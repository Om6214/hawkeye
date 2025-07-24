import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchScanResults,
  clearScan,
} from "../store/scanSlice";

const ScanResults = () => {
  const { scanId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('security'); // 'security' or 'quality'
  
  const {
    currentScan = null,
    results = {},
    loading = false,
    error = null,
  } = useSelector((state) => state.scan || {});
  
  // Get scan result from cache or current scan
  const scanResult = results[scanId] || currentScan;

  useEffect(() => {
    if (!scanId) return;
    
    // Always fetch results when component mounts
    dispatch(fetchScanResults(scanId));
    
    return () => {
      dispatch(clearScan());
    };
  }, [scanId, dispatch]);

  // Determine if scan is completed based on presence of completed_at
  const isCompleted = Boolean(scanResult?.completed_at);
  
  // Get findings for active tab
  const getActiveFindings = () => {
    if (!scanResult) return [];
    
    if (activeTab === 'security') {
      return scanResult.trufflehog_findings || [];
    } 
    else if (activeTab === 'quality') {
      return scanResult.semgrep_findings || [];
    }
    
    return [];
  };
  
  const activeFindings = getActiveFindings();
  
  // Get count for each finding type
  const securityCount = scanResult?.trufflehog_findings?.length || 0;
  const qualityCount = scanResult?.semgrep_findings?.length || 0;
  
  // Get scan type display name
  const getScanTypeDisplay = () => {
    if (!scanResult) return '';
    
    switch (scanResult.scan_type) {
      case 'security':
        return 'Security Scan';
      case 'quality':
        return 'Code Quality Scan';
      case 'full':
        return 'Full Scan (Security + Quality)';
      default:
        return 'Scan';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
            <div className="absolute inset-4 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-xl font-bold text-white">
            {scanResult?.completed_at ? "Updating Results" : "Running Scan"}
          </h2>
          <p className="mt-2 text-blue-300 max-w-md">
            {scanResult?.completed_at 
              ? "Refreshing scan results..."
              : "Scanning repository for issues..."}
          </p>
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
          <div className="flex justify-center gap-4">
            <button
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button
              className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-6 py-3 rounded-lg transition-colors"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Scan Not Found</h2>
          <p className="text-gray-400 mb-6">
            The requested scan results could not be found.
          </p>
          <button
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
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
                {getScanTypeDisplay()}: {scanResult.repo_name || "Unknown Repository"}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  Scan ID: {scanResult.scan_id}
                </span>
                <span className={`px-2 py-1 rounded ${
                  isCompleted 
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  Status: {isCompleted ? "completed" : "in_progress"}
                </span>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  {securityCount} Security Findings
                </span>
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                  {qualityCount} Quality Findings
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 text-right">
              <p className="text-gray-400 text-sm">
                Started: {scanResult.started_at 
                  ? new Date(scanResult.started_at).toLocaleString() 
                  : "N/A"}
              </p>
              {scanResult.completed_at && (
                <p className="text-gray-400 text-sm">
                  Duration: {scanResult.duration_seconds || "N/A"} seconds
                </p>
              )}
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mr-4"></div>
              <div>
                <h3 className="text-lg font-bold text-yellow-400">
                  Scan May Still Be Processing
                </h3>
                <p className="text-yellow-300">
                  We found {securityCount + qualityCount} issues so far.
                  More results may appear as the scan completes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'security' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security Findings ({securityCount})
          </button>
          <button
            className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'quality' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('quality')}
          >
            Code Quality Findings ({qualityCount})
          </button>
        </div>

        {activeTab === 'security' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Security Findings ({securityCount})
              </h2>
              <div className="flex items-center">
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm mr-2">
                  {scanResult.trufflehog_findings?.filter(f => f.Verified).length || 0} Verified
                </span>
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm">
                  {scanResult.trufflehog_findings?.filter(f => !f.Verified).length || 0} Unverified
                </span>
              </div>
            </div>

            {securityCount > 0 ? (
              <div className="space-y-4">
                {scanResult.trufflehog_findings.map((finding, index) => (
                  <SecurityFindingCard key={index} finding={finding} />
                ))}
              </div>
            ) : (
              <NoFindingsMessage 
                type="security" 
                isCompleted={isCompleted} 
                scanResult={scanResult} 
              />
            )}
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Code Quality Findings ({qualityCount})
              </h2>
              <div className="flex items-center">
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm mr-2">
                  {scanResult.semgrep_findings?.filter(f => f.severity === 'ERROR').length || 0} Errors
                </span>
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm mr-2">
                  {scanResult.semgrep_findings?.filter(f => f.severity === 'WARNING').length || 0} Warnings
                </span>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                  {scanResult.semgrep_findings?.filter(f => f.severity === 'INFO').length || 0} Info
                </span>
              </div>
            </div>

            {qualityCount > 0 ? (
              <div className="space-y-4">
                {scanResult.semgrep_findings.map((finding, index) => (
                  <QualityFindingCard key={index} finding={finding} />
                ))}
              </div>
            ) : (
              <NoFindingsMessage 
                type="quality" 
                isCompleted={isCompleted} 
                scanResult={scanResult} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Security Finding Card Component
const SecurityFindingCard = ({ finding }) => (
  <div className={`bg-gray-700/30 border-l-4 ${
    finding.Verified ? "border-red-500" : "border-yellow-500"
  } rounded-r-lg p-4 transition-all hover:bg-gray-700/50`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-white">
          {finding.DetectorName} Detection
        </h3>
        <p className="text-gray-300 text-sm mt-1">
          {finding.DetectorDescription}
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded ${
        finding.Verified 
          ? "bg-red-500/20 text-red-400"
          : "bg-yellow-500/20 text-yellow-400"
      }`}>
        {finding.Verified ? "Verified" : "Unverified"}
      </span>
    </div>

    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-gray-400 text-sm">File</p>
        <p className="text-gray-200 break-all font-mono text-sm">
          {finding.SourceMetadata?.Data?.Git?.file || "N/A"}
        </p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-gray-400 text-sm">Commit</p>
        <p className="text-gray-200 font-mono text-sm break-all">
          {finding.SourceMetadata?.Data?.Git?.commit 
            ? finding.SourceMetadata.Data.Git.commit.substring(0, 8) 
            : "N/A"}
        </p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-gray-400 text-sm">Timestamp</p>
        <p className="text-gray-200 text-sm">
          {finding.SourceMetadata?.Data?.Git?.timestamp
            ? new Date(finding.SourceMetadata.Data.Git.timestamp).toLocaleString()
            : "N/A"}
        </p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-gray-400 text-sm">Raw Data</p>
        <div className="relative">
          <p className="text-gray-200 break-all font-mono text-sm p-2 bg-gray-900/30 rounded mt-1 overflow-x-auto">
            {finding.Raw || "N/A"}
          </p>
          {finding.Raw && (
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => navigator.clipboard.writeText(finding.Raw)}
              title="Copy to clipboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
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
);

// Quality Finding Card Component
const QualityFindingCard = ({ finding }) => {
  // Get severity color classes
  const getSeverityColor = () => {
    switch (finding.severity) {
      case 'ERROR':
        return 'bg-red-500/20 text-red-400';
      case 'WARNING':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'INFO':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-gray-700/30 border-l-4 border-cyan-500 rounded-r-lg p-4 transition-all hover:bg-gray-700/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white">
            {finding.check_id}
          </h3>
          <p className="text-gray-300 text-sm mt-1">
            {finding.message}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor()}`}>
          {finding.severity}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">File</p>
          <p className="text-gray-200 break-all font-mono text-sm">
            {finding.path || "N/A"}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Location</p>
          <p className="text-gray-200 font-mono text-sm">
            Lines {finding.start_line} - {finding.end_line}
          </p>
        </div>
        {finding.metadata && (
          <div className="bg-gray-800/50 rounded-lg p-3 md:col-span-2">
            <p className="text-gray-400 text-sm">Metadata</p>
            <div className="relative">
              <pre className="text-gray-200 text-sm p-2 bg-gray-900/30 rounded mt-1 overflow-x-auto">
                {JSON.stringify(finding.metadata, null, 2)}
              </pre>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(finding.metadata, null, 2))}
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {finding.metadata?.cwe && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <a
            href={`https://cwe.mitre.org/data/definitions/${finding.metadata.cwe.split('-').pop()}.html`}
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            View CWE-{finding.metadata.cwe.split('-').pop()} Details
          </a>
        </div>
      )}
    </div>
  );
};

// No Findings Message Component
const NoFindingsMessage = ({ type, isCompleted, scanResult }) => {
  const message = {
    security: {
      title: "No Security Issues Found",
      description: "Great news! The scan completed successfully and didn't find any security vulnerabilities."
    },
    quality: {
      title: "No Code Quality Issues Found",
      description: "Great news! The code quality scan didn't find any issues that need attention."
    }
  }[type];

  return (
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
        {message.title}
      </h3>
      <p className="text-gray-300 max-w-md mx-auto mb-6">
        {message.description}
      </p>
      <div className="flex justify-center gap-4">
        <button
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors"
          onClick={() => window.location.reload()}
        >
          Scan Again
        </button>
        <button
          className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-6 py-3 rounded-lg transition-colors"
          onClick={() => window.history.back()}
        >
          Back to Repositories
        </button>
      </div>
    </div>
  );
};

export default ScanResults;