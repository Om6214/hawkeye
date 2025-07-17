const { exec } = require('child_process');

module.exports = function runTrufflehogScan(repo_url) {
  return new Promise((resolve, reject) => {
    const command = `trufflehog git ${repo_url} --json`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Trufflehog error:', stderr);
        return resolve([]); // or reject(error) if you want to fail
      }

      const findings = stdout
        .split('\n')
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      resolve(findings);
    });
  });
};
