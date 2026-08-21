// src/components/admin/AdminNavbar.js
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CONTENT_LINKS = [
  { label: 'Homepage / Site Settings', path: '/admin-portal/content/site' },
  { label: 'Clusters', path: '/admin-portal/content/clusters' },
  { label: 'Portfolio', path: '/admin-portal/content/portfolio' },
  { label: 'Countries', path: '/admin-portal/content/countries' },
  { label: 'Timeline', path: '/admin-portal/content/timeline' },
  { label: 'Values', path: '/admin-portal/content/values' },
  { label: 'Leadership', path: '/admin-portal/content/leadership' },
  { label: 'Foundation', path: '/admin-portal/content/foundation' },
  { label: 'Media', path: '/admin-portal/content/media' },
  { label: 'News', path: '/admin-portal/content/news' },
  { label: 'Pages', path: '/admin-portal/content/pages' },
];

const ENGAGEMENT_LINKS = [
  { label: 'Newsletter Subscribers', path: '/admin-portal/engagement/newsletter' },
  { label: 'Contact Messages', path: '/admin-portal/engagement/messages' },
];

const NavDropdown = ({ label, links }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = links.some((l) => location.pathname === l.path);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={`text-sm font-bold tracking-wide transition-colors duration-200 flex items-center gap-1 ${
          isActive ? 'text-[#0A2540]' : 'text-gray-600 hover:text-[#0A2540]'
        }`}
      >
        {label}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 w-64 py-2 bg-white border border-gray-200 rounded-lg shadow-xl top-full">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0A2540] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminNavbar = () => {
  const { userEmail, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin-portal/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-10">
              {/* Logo now links to homepage */}
              <Link to="/" className="flex-shrink-0">
                <img src="/NF Holding Logo.png" alt="NF Holding Home" className="w-auto h-10" />
              </Link>

              <div className="items-center hidden gap-8 md:flex">
                <Link
                  to="/admin-portal/dashboard"
                  className="text-sm font-bold tracking-wide text-gray-600 hover:text-[#0A2540] transition-colors"
                >
                  Dashboard
                </Link>
                <NavDropdown label="Content" links={CONTENT_LINKS} />
                <NavDropdown label="Engagement" links={ENGAGEMENT_LINKS} />
                <Link
                  to="/admin-portal/users"
                  className="text-sm font-bold tracking-wide text-gray-600 hover:text-[#0A2540] transition-colors"
                >
                  Users
                </Link>
              </div>
            </div>

            <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
              <button className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0A2540] text-white text-sm font-semibold">
                  {userEmail?.charAt(0)?.toUpperCase() ?? 'A'}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{userEmail}</div>
                  <div className="text-xs text-gray-500">{userRole}</div>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 z-50 w-48 py-2 bg-white border border-gray-200 rounded-lg shadow-xl top-full">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </nav>
  );
};

export default AdminNavbar;