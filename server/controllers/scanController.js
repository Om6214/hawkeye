const supabase = require("../config/supabaseClient");
const runTrufflehogScan = require("../services/trufflehogService");
const { v4: uuidv4 } = require("uuid");

function getRepoOwner(url) {
  const match = url.match(/github\.com\/([^/]+)/);
  return match ? match[1] : null;
}

function getRepoName(url) {
  const match = url.match(/github\.com\/[^/]+\/([^/.]+)/);
  return match ? match[1] : null;
}

exports.runTruffleHogScan = async (req, res) => {
  const { repo_url, github_id } = req.body; // Changed from user_id to github_id

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
      .eq("github_id", github_id) // Changed to use github_id
      .single();

    if (userError || !user) {
      return res
        .status(400)
        .json({ error: "Invalid github_id: user not found" });
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
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const scan_id = scan.id;

    // 3. Run scan with user's access token
    const trufflehogFindings = await runTrufflehogScan(
      repo_url,
      user.access_token // Pass access token to service
    );

    const endTime = new Date();
    const duration_seconds = Math.floor((endTime - startTime) / 1000);

    // 4. Insert scan results
    await supabase.from("scan_results").insert([
      {
        scan_id,
        findings: trufflehogFindings,
        started_at: startTime.toISOString(),
        completed_at: endTime.toISOString(),
        duration_seconds,
        github_id: github_id, // Store github_id for reference
      },
    ]);

    // 5. Update scan status
    await supabase
      .from("scans")
      .update({ status: "completed", completed_at: endTime.toISOString() })
      .eq("id", scan_id);

    res.status(200).json({
      message: "Scan completed",
      scan_id,
      trufflehog_findings_count: trufflehogFindings.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Full scan failed", details: error.message });
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
      findings: result.findings,
      started_at: result.started_at,
      completed_at: result.completed_at,
      duration_seconds: result.duration_seconds,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch scan result", details: err.message });
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
      .select("*")
      .eq("github_id", github_id);

    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Supabase error", details: error.message });
    }

    // (Optional) Sort as desired in JS:
    const sortedResults = results.sort(
      (a, b) => new Date(b.started_at) - new Date(a.started_at)
      // OR: (a, b) => new Date(b.scans?.started_at || 0) - new Date(a.scans?.started_at || 0)
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
