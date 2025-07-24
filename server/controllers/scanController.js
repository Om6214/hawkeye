const supabase = require("../config/supabaseClient");
const runTrufflehogScan = require("../services/trufflehogService");
const runSemgrepScan = require("../services/semgrepService"); // Add this
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs-extra');

function getRepoOwner(url) {
  const match = url.match(/github\.com\/([^/]+)/);
  return match ? match[1] : null;
}

function getRepoName(url) {
  const match = url.match(/github\.com\/[^/]+\/([^/.]+)/);
  return match ? match[1] : null;
}

// Helper function to get cache path
function getRepoCachePath(repo_url) {
  const safeRepoName = repo_url.replace(/[^a-zA-Z0-9_]/g, '_');
  return path.join(__dirname, '../repo_cache', safeRepoName);
}

exports.runTruffleHogScan = async (req, res) => {
  const { repo_url, github_id, scan_type = "security" } = req.body;

  if (!repo_url || !github_id) {
    return res.status(400).json({ error: "repo_url and github_id required" });
  }

  const repo_owner = getRepoOwner(repo_url);
  const repo_name = getRepoName(repo_url);
  const branch = "main";
  const startTime = new Date();

  try {
    // 1. Get user by github_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, access_token")
      .eq("github_id", github_id)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: "Invalid github_id: user not found" });
    }

    // 2. Insert scan entry
    const { data: scan, error: insertError } = await supabase
      .from("scans")
      .insert([
        {
          user_id: user.id,
          repo_name,
          repo_owner,
          branch,
          status: "in_progress",
          scan_type  // Add scan type
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;
    const scan_id = scan.id;

    // 3. Get repository cache path
    const repoCachePath = getRepoCachePath(repo_url);
    await fs.ensureDir(repoCachePath);

    // 4. Run scans based on type
    let trufflehogFindings = [];
    let semgrepFindings = [];

    if (scan_type === "trufflehog" || scan_type === "full") {
      trufflehogFindings = await runTrufflehogScan(
        repo_url,
        user.access_token
      );
    }

    if (scan_type === "semgrep" || scan_type === "full") {
      semgrepFindings = await runSemgrepScan(repoCachePath);
    }

    const endTime = new Date();
    const duration_seconds = Math.floor((endTime - startTime) / 1000);

    // 5. Insert scan results
    await supabase.from("scan_results").insert([
      {
        scan_id,
        trufflehog_findings: trufflehogFindings,
        semgrep_findings: semgrepFindings,
        started_at: startTime.toISOString(),
        completed_at: endTime.toISOString(),
        duration_seconds,
        github_id,
      }
    ]);

    // 6. Update scan status
    await supabase
      .from("scans")
      .update({ status: "completed", completed_at: endTime.toISOString() })
      .eq("id", scan_id);

    res.status(200).json({
      message: "Scan completed",
      scan_id,
      trufflehog_findings_count: trufflehogFindings.length,
      semgrep_findings_count: semgrepFindings.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Scan failed", details: error.message });
  }
};

exports.getScanResultById = async (req, res) => {
  const { scan_id } = req.params;

  if (!scan_id) {
    return res.status(400).json({ error: "scan_id is required" });
  }

  try {
    // Check if the scan exists
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", scan_id)
      .single();

    if (scanError || !scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    // Fetch scan result
    const { data: result, error: resultError } = await supabase
      .from("scan_results")
      .select("*")
      .eq("scan_id", scan_id)
      .single();

    if (resultError || !result) {
      return res.status(404).json({ error: "Scan result not found" });
    }

    res.status(200).json({
      scan_id,
      status: scan.status,
      repo_name: scan.repo_name,
      repo_owner: scan.repo_owner,
      scan_type: scan.scan_type,
      trufflehog_findings: result.trufflehog_findings,
      semgrep_findings: result.semgrep_findings,
      started_at: result.started_at,
      completed_at: result.completed_at,
      duration_seconds: result.duration_seconds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: "Failed to fetch scan result", 
      details: err.message 
    });
  }
};

exports.getUserScanResults = async (req, res) => {
  const { github_id } = req.params;
  if (!github_id) {
    return res.status(400).json({ error: "github_id is required" });
  }
  try {
    const { data: results, error } = await supabase
      .from("scan_results")
      .select("*, scans:scan_id (repo_name, repo_owner, scan_type)")
      .eq("github_id", github_id);

    if (error) {
      console.error(error);
      return res.status(500).json({ 
        error: "Supabase error", 
        details: error.message 
      });
    }

    // Enrich results with scan information
    const enrichedResults = results.map(result => ({
      ...result,
      repo_name: result.scans.repo_name,
      repo_owner: result.scans.repo_owner,
      scan_type: result.scans.scan_type
    }));

    // Sort by started_at descending
    const sortedResults = enrichedResults.sort(
      (a, b) => new Date(b.started_at) - new Date(a.started_at)
    );

    return res.status(200).json({ results: sortedResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch user scan results",
      details: err.message,
    });
  }
};