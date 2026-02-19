import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioHighlights = () => {
  const [activeSector, setActiveSector] = useState("HIGHLIGHTS");

  // Updated sectors with only the specified ones
  const sectors = [
    { id: 1, name: "HIGHLIGHTS", href: "#highlights" },
    { id: 2, name: "FINANCE", href: "#finance" },
    { id: 3, name: "TECHNOLOGY", href: "#technology" },
    { id: 4, name: "HOSPITALITY", href: "#hospitality" },
    { id: 5, name: "POWER", href: "#power" },
    { id: 6, name: "ENERGY", href: "#energy" },
    { id: 7, name: "REAL ESTATE", href: "#realestate" }
  ];

  // Updated portfolio data to match the sectors
  const portfolioData = [
    { category: "Finance", percentage: 25, color: "#338BBA" },
    { category: "Technology", percentage: 20, color: "#FF6B6B" },
    { category: "Hospitality", percentage: 10, color: "#4ECDC4" },
    { category: "Power", percentage: 18, color: "#FFD166" },
    { category: "Energy", percentage: 15, color: "#06D6A0" },
    { category: "Real Estate", percentage: 12, color: "#118AB2" }
  ];

  // Format data for Chart.js Pie chart
  const pieChartData = {
    labels: portfolioData.map(item => item.category),
    datasets: [
      {
        data: portfolioData.map(item => item.percentage),
        backgroundColor: portfolioData.map(item => item.color),
        borderColor: '#fff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    ]
  };

  // Options for the big pie chart
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  const handleSectorClick = (e, sectorName, href) => {
    e.preventDefault();
    setActiveSector(sectorName);
    console.log(`Clicked on: ${sectorName}`);
  };

  return (
    <>
      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section 
        className="relative w-full h-screen min-h-[600px] bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/businessman-is-using-computer-laptop.jpg')",
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content Container with same grid layout as navbar */}
        <div className="grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="relative col-span-12 lg:col-span-10">
            <div className="h-full px-4 sm:px-6 lg:px-8">
              {/* Main Title - Positioned at bottom left */}
              <div className="absolute z-10 bottom-8 left-8">
                <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                  Investment Portfolio
                </h1>
              </div>
              
              {/* Social Share Buttons - Positioned absolutely on the right */}
              <div className="absolute hidden transform -translate-y-1/2 right-8 top-1/2 md:block">
                <div className="flex flex-col space-y-4">
                  <button 
                    className="flex items-center justify-center w-10 h-10 text-white transition bg-white rounded-full bg-opacity-20 hover:bg-opacity-30"
                    aria-label="Share on facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </button>
                  <button 
                    className="flex items-center justify-center w-10 h-10 text-white transition bg-white rounded-full bg-opacity-20 hover:bg-opacity-30"
                    aria-label="Share on twitter"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </button>
                  <button 
                    className="flex items-center justify-center w-10 h-10 text-white transition bg-white rounded-full bg-opacity-20 hover:bg-opacity-30"
                    aria-label="Share on linkedin"
                  >
                    <FaLinkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* PORTFOLIO HIGHLIGHTS SECTION */}
      <section className="py-12 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              
              {/* Navigation Tabs - Updated with new sectors */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                {sectors.map((sector) => (
                  <a
                    key={sector.id}
                    href={sector.href}
                    onClick={(e) => handleSectorClick(e, sector.name, sector.href)}
                    className={`text-sm font-medium uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 ${
                      activeSector === sector.name
                        ? 'bg-[#338BBA] text-white'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {sector.name}
                  </a>
                ))}
              </div>

              {/* Portfolio Highlights Content */}
              <div className="max-w-4xl mx-auto text-center">
                {/* PORTFOLIO HIGHLIGHTS Title */}
                <h6 className="mb-6 text-sm font-bold tracking-widest text-gray-500 uppercase">
                  PORTFOLIO HIGHLIGHTS
                </h6>
                {/* Main Description */}
                <h2 className="mb-8 text-xl font-normal leading-relaxed text-gray-800 md:text-2xl">
                  We invest in sectors that provide strong long-term returns and have the ability to transform Africa's economy. The value of our existing portfolio as at 28 November 2025 is KES 17.92 trillion ($12.39 billion).
                </h2>

                {/* Highlights Grid - Only if we're on HIGHLIGHTS tab */}
                {activeSector === "HIGHLIGHTS" && (
                  <div className="grid grid-cols-2 gap-8 mt-12 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C1F26] md:text-4xl">
                        6
                      </div>
                      <div className="mt-2 text-xs font-medium tracking-wide text-gray-600 uppercase">
                        Sectors
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C1F26] md:text-4xl">
                        24
                      </div>
                      <div className="mt-2 text-xs font-medium tracking-wide text-gray-600 uppercase">
                        Countries
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C1F26] md:text-4xl">
                        40k+
                      </div>
                      <div className="mt-2 text-xs font-medium tracking-wide text-gray-600 uppercase">
                        Employees
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C1F26] md:text-4xl">
                        $12.39Bn
                      </div>
                      <div className="mt-2 text-xs font-medium tracking-wide text-gray-600 uppercase">
                        Portfolio Value
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* PIE CHART SECTION - Big pie chart on top, small pie charts at bottom */}
      <section className="py-16 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Big Pie Chart on Top - Centered */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="h-[500px]">
                  <Pie data={pieChartData} options={pieOptions} />
                </div>
              </div>

              {/* Small Pie Charts at Bottom - Updated to 6 sectors */}
              <div className="grid grid-cols-2 gap-6 mb-16 sm:grid-cols-3 md:grid-cols-6">
                {portfolioData.map((item, index) => {
                  // Create mini pie chart data for each sector
                  const miniPieData = {
                    labels: [item.category, 'Other'],
                    datasets: [
                      {
                        data: [item.percentage, 100 - item.percentage],
                        backgroundColor: [item.color, '#f3f4f6'],
                        borderColor: '#fff',
                        borderWidth: 2,
                      }
                    ]
                  };

                  const miniPieOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        enabled: false,
                      }
                    },
                    cutout: '60%',
                  };

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-3">
                        <Pie data={miniPieData} options={miniPieOptions} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-900">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div 
                            className="flex-shrink-0 w-3 h-3 mr-2 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* INVESTMENT PHILOSOPHY SECTION - Added below the pie charts */}
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="mb-6 text-base font-bold text-gray-900 md:text-3xl lg:text-4xl">
                  INVESTMENT PHILOSOPHY
                </h3>
                
                <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                  Our approach to investment is guided by the philosophy of African capitalism, which is the private sector's commitment to Africa's development through long term investments that create economic prosperity and social wealth.
                </p>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>
    </>
  );
};

export default PortfolioHighlights;