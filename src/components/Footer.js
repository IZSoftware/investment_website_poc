import React from 'react';
import { FaLinkedinIn } from 'react-icons/fa';
import { FaPhone, FaEnvelope, FaLocationDot } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: "About Us", path: "/about-us" },
    { name: "Clusters", path: "/clusters" },
    { name: "Investment Approach", path: "/investment-approach" },
    { name: "Portfolio Performance", path: "/portfolio-performance" }
  ];

  const socialMedia = [
    { name: "LinkedIn", icon: <FaLinkedinIn />, url: "https://linkedin.com/company/NF Holdinggroup" }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <footer className="w-full bg-gray-100">
      {/* MIDDLE: 3 COLUMNS FOOTER */}
      <div className="py-12 bg-gray-300 lg:py-16">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
                
                {/* COLUMN 1: Logo */}
                <div>
                  <div className="mb-8">
                    <img
                      src="/NF Holding Logo.png"
                      alt="NF Holding Logo"
                      className="w-auto h-24 lg:h-26"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    {socialMedia.map((social) => (
                      <button
                        key={social.name}
                        onClick={() => handleExternalLink(social.url)}
                        className="flex items-center justify-center w-10 h-10 transition-colors duration-300 bg-[#1C1F26] rounded-full hover:bg-[#0A2540]"
                        aria-label={`Visit our ${social.name} page (opens in new tab)`}
                      >
                        <span className="text-lg text-white">{social.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* COLUMN 2: Contact Info */}
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 lg:text-xl">
                      Contact Info
                    </h4>
                    {/* Horizontal line below Contact Info title */}
                    <div className="w-16 h-0.5 bg-[#1C1F26] mt-2"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-lg text-[#1C1F26]">
                        <FaPhone />
                      </span>
                      <span>+2547123456789</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-lg text-[#1C1F26]">
                        <FaEnvelope />
                      </span>
                      <span>investor@nf-holding.com</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-lg text-[#1C1F26]">
                        <FaLocationDot />
                      </span>
                      <span>Ushuru Pension Plaza, Nairobi, Kenya</span>
                    </div>
                  </div>
                </div>
                
                {/* COLUMN 3: Quick Links */}
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 lg:text-xl">
                      Quick Links
                    </h4>
                    {/* Horizontal line below Quick Links title */}
                    <div className="w-16 h-0.5 bg-[#1C1F26] mt-2"></div>
                  </div>
                  <div className="space-y-2">
                    {quickLinks.map((link) => (
                      <button
                        key={link.name}
                        onClick={() => handleNavigation(link.path)}
                        className="block w-full py-1 text-left text-gray-700 transition-colors duration-300 hover:text-gray-900 group"
                      >
                        <span className="text-[#1C1F26] mr-2 group-hover:text-[#0A2540]">&gt;</span>
                        {link.name}
                      </button>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </div>

      {/* BOTTOM: COPYRIGHT & LEGAL */}
      <div className="bg-[#1C1F26] py-4">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between md:flex-row">
                {/* Left: Copyright */}
                <div className="mb-4 text-white md:mb-0">
                  © 2026 NF Holding
                </div>
                
                {/* Center: Empty for 3-column alignment */}
                <div className="flex-1 hidden md:block"></div>
                
                {/* Right: Legal Links */}
                <div className="text-white">
                  <button
                    onClick={() => handleNavigation('/privacy-policy')}
                    className="mr-4 hover:underline focus:outline-none"
                  >
                    Privacy Policy
                  </button>
                  <span className="mr-4">|</span>
                  <button
                    onClick={() => handleNavigation('/terms')}
                    className="hover:underline focus:outline-none"
                  >
                    Terms & Conditions
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;