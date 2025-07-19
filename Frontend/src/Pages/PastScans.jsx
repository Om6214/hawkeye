import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserScanReports } from "../store/scanReportsSlice";
import { useParams } from "react-router-dom";
import { FaStar, FaLock, FaClock, FaHistory, FaEye, FaEyeSlash } from "react-icons/fa";

const ScanReports = () => {
  const { githubId } = useParams();
  const dispatch = useDispatch();
  const reports = useSelector((state) => state.scanReports.reports) || [];
  const loading = useSelector((state) => state.scanReports.loading);
  const error = useSelector((state) => state.scanReports.error);
  
  // State to track revealed secrets
  const [revealedSecrets, setRevealedSecrets] = useState({});

  useEffect(() => {
    if (githubId) {
      dispatch(fetchUserScanReports(githubId));
    }
  }, [dispatch, githubId]);

  // Toggle secret visibility
  const toggleSecretVisibility = (reportId, findingIndex) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [`${reportId}-${findingIndex}`]: !prev[`${reportId}-${findingIndex}`]
    }));
  };

  // Format date to relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get severity badge
  const getSeverityBadge = (severity) => {
    const severityMap = {
      CRITICAL: "bg-red-500/20 text-red-400",
      HIGH: "bg-orange-500/20 text-orange-400",
      MEDIUM: "bg-yellow-500/20 text-yellow-400",
      LOW: "bg-blue-500/20 text-blue-400",
      INFO: "bg-gray-500/20 text-gray-400",
    };
    return severityMap[severity] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <FaHistory className="mr-3 text-blue-400" />
              Scan History
            </h1>
            <p className="text-gray-400">
              {reports.length > 0
                ? `Showing ${reports.length} scan reports`
                : "No scan history yet"}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-gray-800/50 border border-red-500/30 rounded-xl p-8 max-w-2xl text-center">
            <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Error Loading Reports
            </h2>
            <p className="text-red-400 mb-6">{error}</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <div className="mx-auto bg-gray-700/30 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No scan history yet
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              You haven't performed any scans yet. Start by scanning a
              repository to see results here.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => {
            const repoName =
              report.findings?.[0]?.SourceMetadata?.Data?.Git?.repository ||
              "Unknown";
            const criticalCount =
              report.findings?.filter((f) => f.Severity === "CRITICAL")
                .length || 0;
            const highCount =
              report.findings?.filter((f) => f.Severity === "HIGH").length || 0;
            const mediumCount =
              report.findings?.filter((f) => f.Severity === "MEDIUM").length ||
              0;
            const lowCount =
              report.findings?.filter((f) => f.Severity === "LOW").length || 0;

            return (
              <div
                key={report.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {repoName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                            Scan ID: {report.scan_id}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                            {report.scan_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="text-red-400 font-bold text-xl">
                          {criticalCount}
                        </div>
                        <div className="text-red-400 text-xs">CRITICAL</div>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <div className="text-orange-400 font-bold text-xl">
                          {highCount}
                        </div>
                        <div className="text-orange-400 text-xs">HIGH</div>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="text-yellow-400 font-bold text-xl">
                          {mediumCount}
                        </div>
                        <div className="text-yellow-400 text-xs">MEDIUM</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-blue-400 font-bold text-xl">
                          {lowCount}
                        </div>
                        <div className="text-blue-400 text-xs">LOW</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 mb-4 md:mb-0">
                    <div className="flex items-center text-gray-400 text-sm">
                      <FaClock className="mr-2" />
                      <span>
                        {report.duration_seconds != null
                          ? `${report.duration_seconds}s`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <span>
                        Scanned{" "}
                        {report.started_at
                          ? formatDate(report.started_at)
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                <details className="mt-4 group">
                  <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                    <div className="flex items-center">
                      <span className="text-blue-400 font-medium">
                        View Findings ({report.findings?.length || 0})
                      </span>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400 transform group-open:rotate-180 transition-transform"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>

                  <div className="mt-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Rule
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Source
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Secret
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {report.findings?.map((finding, index) => {
                            const gitData =
                              finding.SourceMetadata?.Data?.Git || {};
                            const secret = finding.Raw;
                            const key = `${report.id}-${index}`;
                            const isRevealed = revealedSecrets[key] || false;

                            return (
                              <tr key={index} className="hover:bg-gray-800/50">
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-white">
                                    {finding.DetectorName}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {finding.DetectorType} •{" "}
                                    {finding.DecoderName}
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                        />
                                      </svg>
                                    </div>
                                    <div>
                                      <div className="text-sm text-white">
                                        {finding.SourceName}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {gitData.repository ? (
                                          <a
                                            href={gitData.repository}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline"
                                          >
                                            {gitData.repository
                                              .split("/")
                                              .pop()}
                                          </a>
                                        ) : (
                                          "Unknown repo"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="text-sm text-white">
                                    {gitData.file || "Unknown file"}
                                    {gitData.line && `:${gitData.line}`}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1 flex items-center">
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {gitData.timestamp
                                      ? formatDate(gitData.timestamp)
                                      : "Unknown date"}
                                  </div>
                                  {gitData.commit && (
                                    <div className="text-xs text-gray-400 mt-1 flex items-center">
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
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      <a
                                        href={`${gitData.repository}/commit/${gitData.commit}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                      >
                                        {gitData.commit.substring(0, 7)}
                                      </a>
                                    </div>
                                  )}
                                </td>

                                <td className="px-4 py-3">
                                  <div className="text-sm font-mono flex items-center">
                                    {isRevealed ? (
                                      <span className="text-red-400 break-all">
                                        {secret}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">
                                        ••••••••••••••
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      className={`flex items-center text-xs px-3 py-1 rounded ${
                                        isRevealed
                                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                          : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                      }`}
                                      onClick={() => toggleSecretVisibility(report.id, index)}
                                    >
                                      {isRevealed ? (
                                        <>
                                          <FaEyeSlash className="mr-1" />
                                          Hide
                                        </>
                                      ) : (
                                        <>
                                          <FaEye className="mr-1" />
                                          Reveal
                                        </>
                                      )}
                                    </button>
                                    {finding.ExtraData?.rotation_guide && (
                                      <a
                                        href={finding.ExtraData.rotation_guide}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-xs px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                      >
                                        Rotate
                                      </a>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-yellow-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Security Recommendation
                      </h4>
                      <p className="text-sm text-gray-300">
                        {report.findings?.[0]?.DetectorDescription ||
                          "This finding represents a potential security vulnerability that should be addressed immediately."}
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScanReports;