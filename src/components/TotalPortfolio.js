import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TotalPortfolioPage = () => {
  // Asset Classes - Individual Pie Chart Data
  const sovereignFixedIncomeData = {
    labels: ["Sovereign Bonds (Long-term Investment)", "Sovereign Bills (Short-term Investment)"],
    datasets: [
      {
        data: [82.5, 34.0],
        backgroundColor: ["#338BBA", "#4ECDC4"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  const creditData = {
    labels: ["Corporate Loan", "Corporate Bonds"],
    datasets: [
      {
        data: [41.2, 28.9],
        backgroundColor: ["#338BBA", "#4ECDC4"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  const equitiesData = {
    labels: [
      "Public Equity (Equity Market)",
      "Private Equity",
      "Global Public Equity",
      "Global Private Equity"
    ],
    datasets: [
      {
        data: [52.0, 31.5, 18.8, 12.4],
        backgroundColor: ["#338BBA", "#4ECDC4", "#FFD166", "#06D6A0"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  const realEstateData = {
    labels: ["Residential", "Land", "Commercial Buildings"],
    datasets: [
      {
        data: [29.0, 17.5, 38.5],
        backgroundColor: ["#338BBA", "#4ECDC4", "#FFD166"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  const fundOfFundsData = {
    labels: ["Fund of Funds"],
    datasets: [
      {
        data: [45.0],
        backgroundColor: ["#338BBA"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  // Markets (Africa only - Kenya & Ethiopia)
  const africaMarketsData = {
    labels: ["Kenya", "Ethiopia"],
    datasets: [
      {
        data: [68, 32],
        backgroundColor: ["#338BBA", "#4ECDC4"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  // Enhanced pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: { size: 14, weight: 'normal' },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  const assetPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: { size: 14, weight: 'normal' },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: CAD ${value} B`;
          }
        }
      }
    }
  };

  // Legend data arrays
  const sovereignArray = [
    { name: "Sovereign Bonds (Long-term Investment)", value: 82.5, color: "#338BBA" },
    { name: "Sovereign Bills (Short-term Investment)", value: 34.0, color: "#4ECDC4" }
  ];

  const creditArray = [
    { name: "Corporate Loan", value: 41.2, color: "#338BBA" },
    { name: "Corporate Bonds", value: 28.9, color: "#4ECDC4" }
  ];

  const equitiesArray = [
    { name: "Public Equity (Equity Market)", value: 52.0, color: "#338BBA" },
    { name: "Private Equity", value: 31.5, color: "#4ECDC4" },
    { name: "International Equity", value: null, color: null }, // header
    { name: "   ↳ Global Public Equity", value: 18.8, color: "#FFD166" },
    { name: "   ↳ Global Private Equity", value: 12.4, color: "#06D6A0" }
  ];

  const realEstateArray = [
    { name: "Residential", value: 29.0, color: "#338BBA" },
    { name: "Land", value: 17.5, color: "#4ECDC4" },
    { name: "Commercial Buildings", value: 38.5, color: "#FFD166" }
  ];

  const fundOfFundsArray = [
    { name: "Fund of Funds", value: 45.0, color: "#338BBA" }
  ];

  const africaArray = [
    { name: "Kenya", value: 68, color: "#338BBA" },
    { name: "Ethiopia", value: 32, color: "#4ECDC4" }
  ];

  return (
    <>
      {/* SECTION 1: Total Portfolio - FULL WIDTH */}
      <section className="py-20 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h1 className="mb-8 font-sans text-4xl font-bold text-gray-900 md:text-5xl">
                Total Portfolio
              </h1>
              
              <div className="space-y-6">
                <p className="font-sans text-xl leading-relaxed text-gray-700">
                  Our total portfolio is comprised of all our investments in various asset classes focused primarily on Africa and selective international opportunities.
                </p>
                
                <p className="font-sans text-xl leading-relaxed text-gray-700">
                  Our investment team manages portfolio construction with a strong emphasis on diversification, risk management, and long-term value creation across African markets.
                </p>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* SECTION 2: In Figures - FULL WIDTH */}
      <section className="py-20 bg-gray-50">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-16 font-sans text-4xl font-bold text-center text-gray-900 md:text-5xl">
                IN FIGURES
              </h2>
              
              <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    CAD 380 B
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Net assets as at December 31, 2025
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    2
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Core countries of focus
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    18
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Years of focused investing
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* SECTION 3: A Diversified Portfolio - FULL WIDTH */}
      <section className="py-20 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 font-sans text-4xl font-bold text-gray-900 md:text-5xl">
                A diversified portfolio
              </h2>
              
              <div className="space-y-6">
                <p className="font-sans text-xl leading-relaxed text-gray-700">
                  Diversification across asset classes and within Africa is key to our strategy. It helps manage volatility while targeting attractive risk-adjusted returns.
                </p>
                
                <p className="font-sans text-xl leading-relaxed text-gray-700">
                  Allocation decisions balance domestic opportunities in Kenya and Ethiopia with selective international exposure through funds and equities.
                </p>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* SECTION 4: Our Asset Classes */}
      <section className="py-20 bg-gray-50">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 font-sans text-4xl font-bold text-gray-900 md:text-5xl">
                Our asset classes
              </h2>
              
              <p className="mb-16 font-sans text-xl leading-relaxed text-gray-700">
                We allocate capital to specialized portfolios across fixed income, credit, equities, real estate and fund structures — with strong roots in African markets.
              </p>
              
              <h3 className="mb-16 font-sans text-3xl font-bold text-center text-gray-800">
                NET ASSETS BY PORTFOLIO
              </h3>
              
              <div className="space-y-20">
                {/* Sovereign Fixed Income */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">SOVEREIGN FIXED INCOME</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">CAD 116.5 B</div>
                    <div className="font-sans text-base tracking-wider text-gray-500">AS AT DECEMBER 31, 2025</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-16 lg:flex-row">
                    <div className="lg:w-1/2 h-80">
                      <Pie data={sovereignFixedIncomeData} options={assetPieOptions} />
                    </div>
                    
                    <div className="lg:w-1/2">
                      <div className="space-y-6">
                        {sovereignArray.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center">
                              <div 
                                className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-sans text-2xl font-bold text-gray-900">CAD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">CREDIT</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">CAD 70.1 B</div>
                    <div className="font-sans text-base tracking-wider text-gray-500">AS AT DECEMBER 31, 2025</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-16 lg:flex-row">
                    <div className="lg:w-1/2 h-80">
                      <Pie data={creditData} options={assetPieOptions} />
                    </div>
                    
                    <div className="lg:w-1/2">
                      <div className="space-y-6">
                        {creditArray.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center">
                              <div 
                                className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-sans text-2xl font-bold text-gray-900">CAD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equities */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">EQUITIES</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">CAD 114.7 B</div>
                    <div className="font-sans text-base tracking-wider text-gray-500">AS AT DECEMBER 31, 2025</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-16 lg:flex-row">
                    <div className="lg:w-1/2 h-80">
                      <Pie data={equitiesData} options={assetPieOptions} />
                    </div>
                    
                    <div className="lg:w-1/2">
                      <div className="space-y-6">
                        {equitiesArray.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center">
                              {item.color && (
                                <div 
                                  className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                              )}
                              <span className={`font-sans text-xl font-medium text-gray-800 ${!item.color ? 'font-bold' : ''}`}>
                                {item.name}
                              </span>
                            </div>
                            {item.value !== null && (
                              <span className="font-sans text-2xl font-bold text-gray-900">CAD {item.value} B</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Estate */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">REAL ESTATE</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">CAD 85.0 B</div>
                    <div className="font-sans text-base tracking-wider text-gray-500">AS AT DECEMBER 31, 2025</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-16 lg:flex-row">
                    <div className="lg:w-1/2 h-80">
                      <Pie data={realEstateData} options={assetPieOptions} />
                    </div>
                    
                    <div className="lg:w-1/2">
                      <div className="space-y-6">
                        {realEstateArray.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center">
                              <div 
                                className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-sans text-2xl font-bold text-gray-900">CAD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fund of Funds */}
                <div>
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">FUND OF FUNDS</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">CAD 45.0 B</div>
                    <div className="font-sans text-base tracking-wider text-gray-500">AS AT DECEMBER 31, 2025</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-16 lg:flex-row">
                    <div className="lg:w-1/2 h-80">
                      <Pie data={fundOfFundsData} options={assetPieOptions} />
                    </div>
                    
                    <div className="lg:w-1/2">
                      <div className="space-y-6">
                        {fundOfFundsArray.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center">
                              <div 
                                className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-sans text-2xl font-bold text-gray-900">CAD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* SECTION 5: Our Markets - Africa Exposure */}
      <section className="py-20 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 font-sans text-4xl font-bold text-gray-900 md:text-5xl">
                Our markets
              </h2>
              
              <p className="mb-16 font-sans text-xl leading-relaxed text-gray-700">
                Our investments are concentrated in high-potential African markets, with strategic focus on Kenya and Ethiopia to capture growth while maintaining diversification.
              </p>
              
              <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
                {/* Left - Pie Chart */}
                <div>
                  <h3 className="mb-4 font-sans text-2xl font-bold text-gray-800 md:text-3xl">EXPOSURE</h3>
                  <h4 className="mb-4 font-sans text-xl font-semibold text-gray-700">BY COUNTRY</h4>
                  <div className="mb-10 font-sans text-base text-gray-500">AS AT DECEMBER 31, 2025</div>
                  
                  <div className="h-[450px]">
                    <Pie data={africaMarketsData} options={pieOptions} />
                  </div>
                </div>
                
                {/* Right - Legend */}
                <div className="flex flex-col justify-center">
                  <div className="space-y-5">
                    {africaArray.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 w-5 h-5 mr-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="font-sans text-xl font-medium text-gray-900">{item.name}</span>
                        </div>
                        <span className="font-sans text-2xl font-bold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>
    </>
  );
};

export default TotalPortfolioPage;