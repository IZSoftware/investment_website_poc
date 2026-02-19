import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { name: "ABOUT US", path: "/about-us" },
    { name: "CLUSTERS", path: "/clusters" },
    { name: "INVESTMENT APPROACH", path: "/investment-approach" },
    { name: "CONTACT", path: "/contact" }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          <div className="col-span-12 lg:col-span-10">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center flex-shrink-0">
                <Link to="/">
                  <img 
                    src="/NF Holding Logo.png" 
                    alt="Company Logo" 
                    className="w-auto transition-all duration-300 cursor-pointer h-14 sm:h-20 lg:h-18 xl:h-22 2xl:h-26 hover:opacity-90"
                  />
                </Link>
              </div>

              {/* Desktop Navigation Items */}
              <div className="items-center hidden space-x-6 md:flex lg:space-x-8">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="relative text-sm font-bold text-[#0A2540] transition-colors duration-300 hover:text-[#1C1F26] lg:text-xl group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0A2540] group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ))}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center space-x-4 md:hidden">
                <button 
                  className="flex items-center text-gray-700"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white shadow-lg md:hidden">
          <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
            <div className="hidden col-span-1 lg:block"></div>
            <div className="col-span-12 lg:col-span-10">
              <div className="px-4 py-4 sm:px-6 lg:px-8">
                <div className="space-y-3">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className="block py-2 font-medium text-gray-800 border-b border-gray-100 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden col-span-1 lg:block"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;