import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TotalPortfolioPage = () => {
  const sovereignFixedIncomeData = {
    labels: ['Sovereign Bonds (Long-term Investment)', 'Sovereign Bills (Short-term Investment)'],
    datasets: [
      {
        data: [0.9, 0.6],
        backgroundColor: ['#338BBA', '#4ECDC4'],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const creditData = {
    labels: ['Corporate Loan', 'Corporate Bonds'],
    datasets: [
      {
        data: [0.6, 0.4],
        backgroundColor: ['#338BBA', '#4ECDC4'],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const equitiesData = {
    labels: [
      'Public Equity (Equity Market)',
      'Private Equity',
      'Global Public Equity',
      'Global Private Equity'
    ],
    datasets: [
      {
        data: [0.5, 0.3, 0.12, 0.08],
        backgroundColor: ['#338BBA', '#4ECDC4', '#FFD166', '#06D6A0'],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const realEstateData = {
    labels: ['Residential', 'Land', 'Commercial Buildings'],
    datasets: [
      {
        data: [0.45, 0.20, 0.35],
        backgroundColor: ['#338BBA', '#4ECDC4', '#FFD166'],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const fundOfFundsData = {
    labels: ['Fund of Funds'],
    datasets: [
      {
        data: [0.5],
        backgroundColor: ['#338BBA'],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  // ─────────────────────────────────────────────────────────────
  // MARKETS — 4 countries, $5.0 B total
  // Kenya $2.0 B (40%) | Ghana $1.25 B (25%) | Ethiopia $1.0 B (20%) | Rwanda $0.75 B (15%)
  // ─────────────────────────────────────────────────────────────
  const africaMarketsData = {
    labels: ['Kenya', 'Ghana', 'Ethiopia', 'Rwanda'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ['#338BBA', '#4ECDC4', '#FFD166', '#06D6A0'],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  // Pie chart options
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
            return `${label}: USD ${value} B`;
          }
        }
      }
    }
  };

  // Legend data arrays
  const sovereignArray = [
    { name: 'Sovereign Bonds (Long-term Investment)', value: '0.9', color: '#338BBA' },
    { name: 'Sovereign Bills (Short-term Investment)', value: '0.6', color: '#4ECDC4' },
  ];

  const creditArray = [
    { name: 'Corporate Loan',  value: '0.6', color: '#338BBA' },
    { name: 'Corporate Bonds', value: '0.4', color: '#4ECDC4' },
  ];

  const equitiesArray = [
    { name: 'Public Equity (Equity Market)', value: '0.5',  color: '#338BBA' },
    { name: 'Private Equity',                value: '0.3',  color: '#4ECDC4' },
    { name: 'International Equity',          value: null,   color: null      }, // sub-header
    { name: '   ↳ Global Public Equity',     value: '0.12', color: '#FFD166' },
    { name: '   ↳ Global Private Equity',    value: '0.08', color: '#06D6A0' },
  ];

  const realEstateArray = [
    { name: 'Residential',        value: '0.45', color: '#338BBA' },
    { name: 'Land',               value: '0.20', color: '#4ECDC4' },
    { name: 'Commercial Buildings', value: '0.35', color: '#FFD166' },
  ];

  const fundOfFundsArray = [
    { name: 'Fund of Funds', value: '0.5', color: '#338BBA' },
  ];

  const africaArray = [
    { name: 'Kenya',    pct: 40, value: '2.0',  color: '#338BBA' },
    { name: 'Ghana',    pct: 25, value: '1.25', color: '#4ECDC4' },
    { name: 'Ethiopia', pct: 20, value: '1.0',  color: '#FFD166' },
    { name: 'Rwanda',   pct: 15, value: '0.75', color: '#06D6A0' },
  ];

  return (
    <>
      {/* SECTION 1: Total Portfolio */}
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

      {/* SECTION 2: In Figures */}
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
                    USD 5.0 B
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Net assets as at December 31, 2025
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    4
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Core countries of focus
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    5
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

      {/* SECTION 3: A Diversified Portfolio */}
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
                  Allocation decisions balance domestic opportunities across Kenya, Ghana, Ethiopia, and Rwanda with selective international exposure through funds and equities.
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

                {/* ── Sovereign Fixed Income ── */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">SOVEREIGN FIXED INCOME</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">USD 1.5 B</div>
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
                              <div className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="ml-4 font-sans text-2xl font-bold text-gray-900 whitespace-nowrap">USD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Credit ── */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">CREDIT</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">USD 1.0 B</div>
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
                              <div className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="ml-4 font-sans text-2xl font-bold text-gray-900 whitespace-nowrap">USD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Equities ── */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">EQUITIES</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">USD 1.0 B</div>
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
                                <div className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" style={{ backgroundColor: item.color }}></div>
                              )}
                              <span className={`font-sans text-xl font-medium text-gray-800 ${!item.color ? 'font-bold pl-0' : ''}`}>
                                {item.name}
                              </span>
                            </div>
                            {item.value !== null && (
                              <span className="ml-4 font-sans text-2xl font-bold text-gray-900 whitespace-nowrap">USD {item.value} B</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Real Estate ── */}
                <div className="pb-16 border-b border-gray-200">
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">REAL ESTATE</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">USD 1.0 B</div>
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
                              <div className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="ml-4 font-sans text-2xl font-bold text-gray-900 whitespace-nowrap">USD {item.value} B</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Fund of Funds ── */}
                <div>
                  <div className="mb-16 text-center">
                    <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">FUND OF FUNDS</h4>
                    <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">USD 0.5 B</div>
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
                              <div className="flex-shrink-0 w-5 h-5 mr-5 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="font-sans text-xl font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="ml-4 font-sans text-2xl font-bold text-gray-900 whitespace-nowrap">USD {item.value} B</span>
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

      {/* SECTION 5: Our Markets */}
      <section className="py-20 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 font-sans text-4xl font-bold text-gray-900 md:text-5xl">
                Our markets
              </h2>
              <p className="mb-16 font-sans text-xl leading-relaxed text-gray-700">
                Our investments are concentrated in four high-potential African markets — Kenya, Ghana, Ethiopia, and Rwanda — capturing growth while maintaining diversification across the continent.
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
                          <div className="flex-shrink-0 w-5 h-5 mr-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-sans text-xl font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-sans text-2xl font-bold text-gray-900">{item.pct}%</span>
                          <span className="block font-sans text-base text-gray-500">USD {item.value} B</span>
                        </div>
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