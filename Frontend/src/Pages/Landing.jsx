// Landing.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  const loginWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        options: { redirectTo: "http://localhost:5173" },
        scopes: "repo", // Request repository access
      },
    });
    if (error) {
      setLoginError(error.description || error.message || "Unknown error");
      console.error("Login error:", error);
    }
    if (data) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      dispatch(setUser({ user: session.user, session }));
    }

    if (error) {
      console.error("Login error:", error);
    } else {
      // Redirect will be handled by onAuthStateChange
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center max-w-lg p-8 bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500 rounded-lg p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
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
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="text-blue-400">Hawk</span>Eye
        </h1>

        <p className="text-gray-300 mb-8 text-lg max-w-md mx-auto">
          Keep your repositories secure with advanced vulnerability scanning and
          monitoring
        </p>
        {loginError && (
          <div className="mb-4 text-red-500 font-semibold">{loginError}</div>
        )}

        <button
          onClick={loginWithGitHub}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Login with GitHub
        </button>
      </div>
    </div>
  );
};

export default Landing;
