// components/Navbar.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '../supabaseClient';
import { clearUser } from '../store/userSlice';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch(clearUser());
    navigate('/login');
  };

  // Navigation items with their routes
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Repositories', path: '/repositories' },
    { name: 'Scans', path: '/scans' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <NavLink to="/dashboard" className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">
                  <span className="text-blue-400">Hawk</span>Eye
                </h1>
              </NavLink>
            </div>
            
            <nav className="ml-10 hidden md:flex space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `px-1 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-white border-b-2 border-blue-500' 
                        : 'text-gray-300 hover:text-white border-b-2 border-transparent hover:border-blue-500'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            <div className="relative ml-3">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center max-w-xs rounded-full bg-gray-800 text-sm focus:outline-none"
                id="user-menu-button"
              >
                <span className="sr-only">Open user menu</span>
                {user?.user_metadata?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm text-white truncate">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-sm font-medium text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Your Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </NavLink>
                  </div>
                  <div className="py-1 border-t border-gray-700">
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;