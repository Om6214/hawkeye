// Repositories.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchRepos } from "../store/repoSlice";
import { startScan } from "../store/scanSlice";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaCodeBranch,
  FaLock,
  FaJava,
  FaCaretDown,
  FaLockOpen,
  FaGithub,
} from "react-icons/fa";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiHtml5,
  SiCss3,
  SiReact,
} from "react-icons/si";
import { supabase } from "../supabaseClient";

const Repositories = () => {
  const dispatch = useDispatch();
  const [githubToken, setGithubToken] = useState(null);
  const navigate = useNavigate();

  // Get user from Redux store
  const user = useSelector((state) => state.user.user);

  // Get repos state with safe defaults
  const reposState = useSelector((state) => state.repos || {});
  const { repos = [], loading = false, error = null } = reposState;

  const handleScan = (scanType, repo) => {
    dispatch(
      startScan({
        scanType,
        repoUrl: repo.html_url,
        userId: user.identities[0].id,
      })
    ).then((action) => {
      if (startScan.fulfilled.match(action)) {
        navigate(`/scan-results/${action.payload.scan_id}`);
      }
    });
  };

  useEffect(() => {
    const getSessionAndToken = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) throw new Error("No session found");

        // Extract GitHub token from session
        const token = session.provider_token;
        if (!token) throw new Error("GitHub token not found in session");

        setGithubToken(token);
        dispatch(fetchRepos(token));
      } catch (err) {
        console.error("Error getting session:", err);
      }
    };

    getSessionAndToken();
  }, [dispatch]);

  // Get language icon component
  const getLanguageIcon = (language) => {
    if (!language) return null;

    const languageIcons = {
      JavaScript: <SiJavascript className="text-yellow-400" />,
      TypeScript: <SiTypescript className="text-blue-600" />,
      Python: <SiPython className="text-blue-400" />,
      Java: <FaJava className="text-red-500" />,
      HTML: <SiHtml5 className="text-orange-500" />,
      CSS: <SiCss3 className="text-blue-500" />,
      "Jupyter Notebook": <SiPython className="text-orange-600" />,
      "C#": <FaJava className="text-purple-600" />,
      PHP: <FaJava className="text-purple-500" />,
      Ruby: <FaJava className="text-red-600" />,
      Go: <FaJava className="text-blue-500" />,
      Swift: <FaJava className="text-orange-500" />,
      Kotlin: <FaJava className="text-purple-500" />,
      Rust: <FaJava className="text-orange-700" />,
      React: <SiReact className="text-blue-400" />,
    };

    return (
      languageIcons[language] || <FaCodeBranch className="text-gray-400" />
    );
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

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-80 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                  </div>

                  <div className="h-4 bg-gray-700 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6 mb-6"></div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex items-center justify-center">
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
            Error Loading Repositories
          </h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors flex items-center justify-center mx-auto"
            onClick={() =>
              session?.provider_token &&
              dispatch(fetchRepos(session.provider_token))
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Repositories
            </h1>
            <p className="text-gray-400">
              {repos.length > 0
                ? `Showing ${repos.length} repositories`
                : "No repositories found"}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <button className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </button>

            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                />
              </svg>
              Sort
            </button>
          </div>
        </div>

        {repos.length === 0 && !loading && !error && (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No repositories found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              You don't have any repositories yet. Create a new repository on
              GitHub or check your connection.
            </p>
            <button
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors"
              onClick={() =>
                session?.provider_token &&
                dispatch(fetchRepos(session.provider_token))
              }
            >
              Refresh Repositories
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {repo.private ? (
                      <FaLock className="text-yellow-500" />
                    ) : (
                      <FaLockOpen className="text-green-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg truncate">
                      {repo.name}
                    </h4>
                    <p className="text-gray-400 text-sm">{repo.owner.login}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    repo.private
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {repo.private ? "Private" : "Public"}
                </span>
              </div>

              {repo.description && (
                <p className="text-gray-300 mt-3 text-sm line-clamp-2 flex-grow">
                  {repo.description}
                </p>
              )}

              {!repo.description && (
                <p className="text-gray-500 mt-3 text-sm italic flex-grow">
                  No description provided
                </p>
              )}

              <div className="flex items-center gap-4 mt-4 mb-4">
                {repo.language && (
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">
                      {getLanguageIcon(repo.language)}
                    </span>
                    {repo.language}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-400">
                  <FaStar className="mr-1 text-yellow-400" />
                  {repo.stargazers_count}
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <FaCodeBranch className="mr-1 text-purple-400" />
                  {repo.forks_count}
                </div>
              </div>

              <p className="text-gray-500 text-xs mb-4">
                Updated {formatDate(repo.updated_at)}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm font-medium flex items-center"
                >
                  <FaGithub className="mr-2" />
                  View on GitHub
                </a>
                <div className="relative group">
                  <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm px-3 py-1 rounded transition-colors flex items-center">
                    Scan
                    <FaCaretDown className="ml-1" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleScan("trufflehog", repo)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
                      >
                        <span className="bg-purple-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">T</span>
                        </span>
                        Trufflehog Scan
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">
                        <span className="bg-green-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">G</span>
                        </span>
                        Gitleaks Scan
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">
                        <span className="bg-yellow-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">S</span>
                        </span>
                        Semgrep Audit
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">
                        <span className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">D</span>
                        </span>
                        Dependency Scan
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">
                        <span className="bg-red-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">C</span>
                        </span>
                        CodeQL Analysis
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">
                        <span className="bg-indigo-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">F</span>
                        </span>
                        Full Security Audit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {repos.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-300 px-6 py-3 rounded-lg transition-colors flex items-center">
              Load More Repositories
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Repositories;
