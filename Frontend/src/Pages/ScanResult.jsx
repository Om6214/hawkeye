// ScanResults.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchScanResults, clearScan } from "../store/scanSlice";

const ScanResults = () => {
  const { scanId } = useParams();
  const dispatch = useDispatch();
  const {
    currentScan = null,
    results = {},
    loading = false,
    error = null,
  } = useSelector((state) => state.scan || {});
  const scanResult = results[scanId] || currentScan;

  useEffect(() => {
    if (scanId && !scanResult && !currentScan) {
      dispatch(fetchScanResults(scanId));
    }

    return () => {
      dispatch(clearScan());
    };
  }, [scanId, scanResult, dispatch]);
  console.log("Scan Result:", results);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Scan Error</h2>
          <p className="text-red-400 mb-6">{error.message || error}</p>
          <button
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Scan Not Found</h2>
          <p className="text-gray-400">
            The requested scan results could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Scan Results: {scanResult.repo_name}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  Scan ID: {scanResult.scan_id}
                </span>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  Status: {scanResult.status}
                </span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Findings: {scanResult.findings?.length || 0}
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 text-right">
              <p className="text-gray-400 text-sm">
                Started: {new Date(scanResult.started_at).toLocaleString()}
              </p>
              {scanResult.completed_at && (
                <p className="text-gray-400 text-sm">
                  Duration: {scanResult.duration_seconds} seconds
                </p>
              )}
            </div>
          </div>
        </div>

        {scanResult.status === "in_progress" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mr-4"></div>
              <div>
                <h3 className="text-lg font-bold text-yellow-400">
                  Scan in Progress
                </h3>
                <p className="text-yellow-300">
                  Your scan is currently running. Results will appear here when
                  complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {scanResult.findings && scanResult.findings.length > 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Security Findings
            </h2>

            <div className="space-y-4">
              {scanResult.findings.map((finding, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">
                        {finding.DetectorName} Detection
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">
                        {finding.DetectorDescription}
                      </p>
                    </div>
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-sm">File</p>
                      <p className="text-gray-200 break-all">
                        {finding.SourceMetadata?.Data?.Git?.file}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Commit</p>
                      <p className="text-gray-200 font-mono text-sm break-all">
                        {finding.SourceMetadata?.Data?.Git?.commit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Timestamp</p>
                      <p className="text-gray-200">
                        {new Date(
                          finding.SourceMetadata?.Data?.Git?.timestamp
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Raw Data</p>
                      <p className="text-gray-200 break-all font-mono text-sm">
                        {finding.Raw}
                      </p>
                    </div>
                  </div>

                  {finding.ExtraData?.rotation_guide && (
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <a
                        href={finding.ExtraData.rotation_guide}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Rotation Guide
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          scanResult.status === "completed" && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Security Issues Found
              </h3>
              <p className="text-gray-300 max-w-md mx-auto">
                Great news! The scan completed successfully and didn't find any
                security vulnerabilities.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ScanResults;
