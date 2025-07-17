// Dashboard.jsx
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../supabaseClient";
import { clearUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch(clearUser());
    navigate("/");
  };

  // Safe access to user metadata
  const userMetadata = user?.user_metadata || {};
  const fullName = userMetadata.full_name || "User";
  const userName = userMetadata.user_name || "N/A";
  const avatarUrl = userMetadata.avatar_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">

      <main className="max-w-6xl mx-auto mt-10">
        {/* User Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-500/30"
              />
            )}

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome, {user?.user_metadata?.full_name || "User"} 👋
              </h2>
              <p className="text-gray-300 mb-4">
                Secure your repositories with HawkEye's advanced monitoring
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">
                    {user?.email || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Username</p>
                  <p className="text-white font-medium">
                    @{user?.user_metadata?.user_name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use HawkEye Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">
            How to Use HawkEye
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                title: "Add Repositories",
                desc: "Connect your GitHub account to start monitoring your repositories for vulnerabilities"
              },
              {
                icon: "🛡️",
                title: "Scan Projects",
                desc: "Run security scans to detect vulnerabilities in your dependencies and code"
              },
              {
                icon: "📊",
                title: "View Reports",
                desc: "Get detailed security reports with actionable insights and fixes"
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h4 className="font-bold text-white text-lg mb-2">{step.title}</h4>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="mt-10 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h4 className="font-bold text-white text-lg mb-4">Key Features</h4>
            <ul className="space-y-3">
              {[
                "Real-time vulnerability monitoring",
                "Automated dependency scanning",
                "Security alerts for critical issues",
                "Compliance reporting",
                "Integration with CI/CD pipelines"
              ].map((feature, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;