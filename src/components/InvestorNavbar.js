import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InvestorNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, fullName, userEmail, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    // Clears tokens server- and client-side, then redirects to the login page
    await logout();
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/investor-portal/profile');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const isLoginPage = location.pathname === '/investor-portal/login';

  // Only show the avatar for a signed-in user outside the login page
  const showAvatar = isAuthenticated && !isLoginPage;

  // Logo always takes user to home page
  const logoLink = '/';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center flex-shrink-0">
              <Link to={logoLink}>
                <img
                  src="/NF Holding Logo.png"
                  alt="Company Logo"
                  className="w-auto transition-all duration-300 cursor-pointer h-14 sm:h-20 lg:h-18 xl:h-22 2xl:h-26 hover:opacity-90"
                />
              </Link>
            </div>

            {/* Right side - Home button and Avatar */}
            <div className="flex items-center gap-4">
              {/* Home Button - Always visible */}
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all"
                title="Go to Home"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </button>

              {/* Avatar Dropdown - only for signed-in users */}
              {showAvatar && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <img
                      src="/man profile avatar.png"
                      alt="User avatar"
                      className="object-cover w-10 h-10 transition-all duration-200 border-2 border-gray-200 rounded-full hover:border-blue-600"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 z-50 w-56 py-2 mt-3 bg-white border border-gray-100 rounded-lg shadow-lg">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{fullName || 'Account'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                      </div>

                      {/* Profile Link */}
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </button>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </nav>
  );
};

export default InvestorNavbar;
