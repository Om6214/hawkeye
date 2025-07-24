const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const lockfile = require("proper-lockfile");
const os = require("os");

// Use OS temp directory for cache
const REPO_CACHE = path.join(os.tmpdir(), "hawkeye_cache");

// Ensure cache directory exists
!fs.existsSync(REPO_CACHE) && fs.mkdirSync(REPO_CACHE, { recursive: true });

// Function to clean Git locks
function cleanGitLocks(repoPath) {
  const gitDir = path.join(repoPath, ".git");
  if (!fs.existsSync(gitDir)) return;

  const lockFiles = [
    "index.lock",
    "shallow.lock",
    "FETCH_HEAD.lock",
    "HEAD.lock",
  ].map((file) => path.join(gitDir, file));

  lockFiles.forEach((lockFile) => {
    if (fs.existsSync(lockFile)) {
      try {
        console.log(`[CLEANUP] Removing stale Git lock: ${lockFile}`);
        fs.unlinkSync(lockFile);
      } catch (e) {
        console.error(
          `[WARN] Failed to remove lock file ${lockFile}: ${e.message}`
        );
      }
    }
  });
}

// Async directory removal with retries
async function safeRemove(path, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.remove(path);
      console.log(`[CLEANUP] Successfully removed ${path}`);
      return true;
    } catch (err) {
      if (err.code === "EBUSY" && i < retries - 1) {
        console.log(
          `[RETRY] EBUSY on removal (attempt ${
            i + 1
          }/${retries}), retrying in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`[ERROR] Failed to remove ${path}: ${err.message}`);
        return false;
      }
    }
  }
}

// Format path for cross-platform compatibility
function formatPathForCommand(repoPath) {
  if (process.platform === "win32") {
    return repoPath.replace(/\\/g, "/");
  }
  return repoPath;
}

module.exports = async function runTrufflehogScan(repo_url, access_token) {
  const startTime = Date.now();
  const safeRepoName = repo_url.replace(/[^a-zA-Z0-9_]/g, "_");
  const repoPath = path.join(REPO_CACHE, safeRepoName);
  const gitURL = `https://${access_token}@${repo_url.replace("https://", "")}`;

  console.log(`[DEBUG][${new Date().toISOString()}] START: ${repo_url}`);

  try {
    // 1. Directory preparation
    const dirStart = Date.now();
    await fs.ensureDir(repoPath);
    console.log(
      `[DEBUG][${new Date().toISOString()}] DIR_PREP: ${
        Date.now() - dirStart
      }ms`
    );

    // 2. Lock acquisition
    console.log(`[DEBUG][${new Date().toISOString()}] LOCK_ACQUIRE_START`);
    const release = await lockfile.lock(repoPath, {
      retries: 10,
      retryDelay: 2000,
    });
    const lockTime = Date.now() - startTime;
    console.log(
      `[DEBUG][${new Date().toISOString()}] LOCK_ACQUIRED: ${lockTime}ms`
    );

    try {
      // 3. Clean any existing Git locks
      cleanGitLocks(repoPath);

      const gitPath = path.join(repoPath, ".git");
      const gitExists = fs.existsSync(gitPath);

      // 4. Git operations with robust error handling
      const gitStart = Date.now();

      if (!gitExists) {
        console.log(`[DEBUG][${new Date().toISOString()}] GIT_CLONE_START`);
        try {
          // Use async exec with timeout handling
          await new Promise((resolve, reject) => {
            const clone = exec(
              `git clone --filter=blob:none --depth 1 ${gitURL} ${repoPath}`,
              {
                timeout: 300000, // 5 minutes
              }
            );

            clone.on("exit", (code) => {
              if (code === 0) {
                console.log(
                  `[DEBUG][${new Date().toISOString()}] GIT_CLONE_COMPLETE: ${
                    Date.now() - gitStart
                  }ms`
                );
                resolve();
              } else {
                reject(new Error(`Clone failed with code ${code}`));
              }
            });

            clone.on("error", reject);
          });
        } catch (cloneError) {
          console.error(`[ERROR] Clone failed: ${cloneError.message}`);
          await safeRemove(repoPath);
          throw cloneError;
        }
      } else {
        console.log(`[DEBUG][${new Date().toISOString()}] GIT_UPDATE_START`);
        try {
          // Use async exec for fetch
          await new Promise((resolve, reject) => {
            const fetch = exec(`git -C ${repoPath} fetch --depth 1`, {
              timeout: 120000, // 2 minutes
            });

            fetch.on("exit", (code) => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`Fetch failed with code ${code}`));
              }
            });

            fetch.on("error", reject);
          });

          // Reset after successful fetch
          exec(`git -C ${repoPath} reset --hard origin/main`, {
            timeout: 30000,
          });
          console.log(
            `[DEBUG][${new Date().toISOString()}] GIT_UPDATE_COMPLETE: ${
              Date.now() - gitStart
            }ms`
          );
        } catch (updateError) {
          console.error(`[ERROR] Update failed: ${updateError.message}`);
          cleanGitLocks(repoPath);
          throw updateError;
        }
      }

      // 5. Run TruffleHog scan
      console.log(`[DEBUG][${new Date().toISOString()}] SCAN_START`);
      const scanStart = Date.now();

      const findings = await new Promise((resolve) => {
        // Use filesystem scanning instead of git scanning
        const formattedPath = formatPathForCommand(repoPath);
        const command = `trufflehog filesystem ${formattedPath} --json`;
        console.log(`[OPTIMIZED] Running: ${command}`);

        const proc = exec(command, {
          maxBuffer: 1024 * 1024 * 50, // 50MB
        });

        let output = "";
        let errorOutput = "";

        proc.stdout.on("data", (data) => {
          output += data;
          // Progress indicator
          if (output.length % 50000 === 0) {
            console.log(`[PROGRESS] ${output.length} bytes processed`);
          }
        });

        proc.stderr.on("data", (data) => {
          errorOutput += data;
        });

        proc.on("close", (code) => {
          if (code !== 0) {
            console.error(
              `[SCAN_ERROR] TruffleHog exited with code ${code}: ${errorOutput}`
            );
            return resolve([]);
          }

          try {
            const results = output
              .split("\n")
              .filter(Boolean)
              .map((line) => {
                try {
                  return JSON.parse(line);
                } catch (e) {
                  console.error(
                    `[PARSE_ERROR] ${e.message} in line: ${line.substring(
                      0,
                      100
                    )}`
                  );
                  return null;
                }
              })
              .filter(Boolean);

            resolve(results);
          } catch (parseError) {
            console.error(`[CRITICAL_PARSE] ${parseError.message}`);
            resolve([]);
          }
        });
      });

      const scanDuration = Date.now() - scanStart;
      console.log(
        `[DEBUG][${new Date().toISOString()}] SCAN_COMPLETE: ${scanDuration}ms, FINDINGS: ${
          findings.length
        }`
      );
      return findings;
    } finally {
      // 6. Release lock
      const releaseStart = Date.now();
      await release();
      console.log(
        `[DEBUG][${new Date().toISOString()}] LOCK_RELEASE: ${
          Date.now() - releaseStart
        }ms`
      );
    }
  } catch (error) {
    console.error(
      `[ERROR][${new Date().toISOString()}] SCAN_FAILURE: ${error.message}`
    );
    throw error;
  } finally {
    // 7. Final cleanup and reporting
    const totalTime = Date.now() - startTime;
    console.log(
      `[DEBUG][${new Date().toISOString()}] TOTAL_TIME: ${totalTime}ms`
    );

    // Schedule cleanup
    setTimeout(async () => {
      console.log(`[CLEANUP][${new Date().toISOString()}] START`);
      try {
        await lockfile.unlock(repoPath);
        await safeRemove(repoPath);
        console.log(`[CLEANUP][${new Date().toISOString()}] COMPLETE`);
      } catch (cleanupError) {
        console.error(`[CLEANUP_ERROR] ${cleanupError.message}`);
      }
    }, 300000);
  }
};