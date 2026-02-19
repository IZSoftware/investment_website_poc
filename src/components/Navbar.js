import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "ABOUT US",            path: "/about-us" },
    { name: "CLUSTERS",            path: "/clusters" },
    { name: "INVESTMENT APPROACH", path: "/investment-approach" },
    { name: "CONTACT",             path: "/contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img
                    src="/NF Holding Logo.png"
                    alt="Company Logo"
                    className="w-auto transition-all duration-300 cursor-pointer h-14 sm:h-20 lg:h-18 xl:h-22 2xl:h-26 hover:opacity-90"
                  />
                </Link>
              </div>

              {/* Desktop nav */}
              <div className="items-center hidden space-x-6 md:flex lg:space-x-8">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="relative text-sm font-bold text-[#0A2540] transition-colors duration-300 hover:text-[#1C1F26] lg:text-xl group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0A2540] group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>

              {/* Hamburger — mobile only */}
              <div className="flex items-center md:hidden">
                <button
                  className="flex items-center p-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              </div>

            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </nav>

      {/* ── Full-page mobile menu overlay ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-white md:hidden"
          style={{ top: 0 }}
        >
          {/* Top bar — mirrors the navbar so close button sits in same spot */}
          <div className="flex items-center justify-between px-4 py-4 shadow-md sm:px-6 flex-shrink-0">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/NF Holding Logo.png"
                alt="Company Logo"
                className="w-auto h-14 sm:h-20 hover:opacity-90 transition-opacity"
              />
            </Link>
            <button
              className="flex items-center p-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links — centred vertically in the remaining space */}
          <div className="flex flex-col items-start justify-center flex-1 px-8 gap-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-5 text-2xl font-bold text-[#0A2540] border-b border-gray-100 hover:text-gray-500 transition-colors duration-200 tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Optional footer strip */}
          <div className="flex-shrink-0 px-8 py-6 border-t border-gray-100">
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">
              NF Holdings Group
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;