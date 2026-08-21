// src/components/admin/AdminNavbar.js
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'DEV'];

// Single source of truth for the admin menu. FINANCIAL_ADMIN and DEV can READ
// content/finance sections; write controls are gated inside each page.
const MENU = [
  { label: 'Dashboard', path: '/admin-portal/dashboard', roles: STAFF_ROLES },
  {
    label: 'Content',
    links: [
      { label: 'Site Settings', path: '/admin-portal/content/site', roles: STAFF_ROLES },
      { label: 'Clusters', path: '/admin-portal/content/clusters', roles: STAFF_ROLES },
      { label: 'Portfolio', path: '/admin-portal/content/portfolio', roles: STAFF_ROLES },
      { label: 'Countries', path: '/admin-portal/content/countries', roles: STAFF_ROLES },
      { label: 'Timeline', path: '/admin-portal/content/timeline', roles: STAFF_ROLES },
      { label: 'News', path: '/admin-portal/content/news', roles: STAFF_ROLES },
    ],
  },
  {
    label: 'Finance',
    links: [
      { label: 'Performance', path: '/admin-portal/performance', roles: STAFF_ROLES },
      { label: 'USD/KES Rates', path: '/admin-portal/usd-kes-rates', roles: STAFF_ROLES },
    ],
  },
  {
    label: 'Ops',
    links: [
      { label: 'Login Locks', path: '/admin-portal/login-locks', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { label: 'Audit Log', path: '/admin-portal/audit', roles: ['SUPER_ADMIN', 'ADMIN', 'DEV'] },
      { label: 'Newsletter', path: '/admin-portal/engagement/newsletter', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  { label: 'Users', path: '/admin-portal/users', roles: ['SUPER_ADMIN'] },
];

// Returns the menu filtered for a role; dropdowns with no visible link are dropped.
export const getVisibleMenu = (userRole) =>
  MENU.map((item) => {
    if (item.links) {
      const links = item.links.filter((l) => l.roles.includes(userRole));
      return links.length > 0 ? { label: item.label, links } : null;
    }
    return item.roles.includes(userRole) ? item : null;
  }).filter(Boolean);

const useClickOutside = (ref, onOutside) => {
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
};

const NavDropdown = ({ label, links }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const containerRef = useRef(null);
  const isActive = links.some((l) => location.pathname === l.path);

  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className={`text-sm font-bold tracking-wide transition-colors duration-200 flex items-center gap-1 ${
          isActive ? 'text-[#0A2540]' : 'text-gray-600 hover:text-[#0A2540]'
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 w-64 py-2 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl top-full">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 hover:text-[#0A2540] ${
                location.pathname === link.path ? 'text-[#0A2540] font-semibold' : 'text-gray-700'
              }`}
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
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userMenuRef = useRef(null);

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  // Close open menus after navigating.
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const menu = getVisibleMenu(userRole);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    // logout() revokes the refresh token, clears state and redirects.
    await logout();
  };

  const directLinkClass = (path) =>
    `text-sm font-bold tracking-wide transition-colors duration-200 ${
      location.pathname === path ? 'text-[#0A2540]' : 'text-gray-600 hover:text-[#0A2540]'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-10">
              <Link to="/" className="flex-shrink-0">
                <img src="/NF Holding Logo.png" alt="NF Holding Home" className="w-auto h-10" />
              </Link>

              <div className="items-center hidden gap-8 md:flex">
                {menu.map((item) =>
                  item.links ? (
                    <NavDropdown key={item.label} label={item.label} links={item.links} />
                  ) : (
                    <Link key={item.path} to={item.path} className={directLinkClass(item.path)}>
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  onKeyDown={(e) => e.key === 'Escape' && setUserMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0A2540] text-white text-sm font-semibold">
                    {userEmail?.charAt(0)?.toUpperCase() ?? 'A'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{userEmail}</div>
                    <div className="text-xs text-gray-500">{userRole}</div>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 z-50 w-48 py-2 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl top-full">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={signingOut}
                      className="block w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 text-gray-600 rounded-lg md:hidden hover:text-[#0A2540] hover:bg-gray-50 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

          {mobileOpen && (
            <div className="px-4 pb-4 border-t border-gray-200 md:hidden sm:px-6">
              {menu.map((item) =>
                item.links ? (
                  <div key={item.label} className="pt-3">
                    <div className="px-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      {item.label}
                    </div>
                    {item.links.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-1 py-2 text-sm transition-colors ${
                          location.pathname === link.path
                            ? 'text-[#0A2540] font-semibold'
                            : 'text-gray-700 hover:text-[#0A2540]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-1 pt-3 pb-1 text-sm font-bold tracking-wide transition-colors ${
                      location.pathname === item.path ? 'text-[#0A2540]' : 'text-gray-700 hover:text-[#0A2540]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </nav>
  );
};

export default AdminNavbar;
