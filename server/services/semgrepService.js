const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

module.exports = async function runSemgrepScan(repoPath) {
  return new Promise((resolve) => {
    const outputPath = path.join(repoPath, 'semgrep_results.json');
    const command = `semgrep --config auto --json -o ${outputPath} ${repoPath}`;
    
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('Semgrep error:', stderr);
        return resolve([]);
      }

      try {
        const rawData = await fs.readFile(outputPath, 'utf8');
        const results = JSON.parse(rawData);
        
        // Cleanup results file
        await fs.unlink(outputPath);
        
        // Extract relevant findings
        const findings = results.results.map(result => ({
          check_id: result.check_id,
          path: result.path,
          start_line: result.start.line,
          end_line: result.end.line,
          message: result.extra.message,
          severity: result.extra.severity,
          metadata: result.extra.metadata || {}
        }));
        
        resolve(findings);
      } catch (parseError) {
        console.error('Failed to parse Semgrep results:', parseError);
        resolve([]);
      }
    });
  });
};