import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSiteInfoAbout, getSiteInfoCluster, getSiteInfo } from '../api/services';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#338BBA', '#4ECDC4', '#FFD166', '#06D6A0', '#EF476F', '#7209B7', '#F4A261', '#2A9D8F'];

const UNIT_TO_MILLIONS = { THOUSANDS: 0.001, MILLIONS: 1, BILLIONS: 1000 };
const normalizeToMillions = (valuation) => {
  if (!valuation) return 0;
  const factor = UNIT_TO_MILLIONS[valuation.unit] ?? 1;
  return (valuation.amount ?? 0) * factor;
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const buildAssetPieData = (items) => ({
  labels: items.map((i) => i.name),
  datasets: [{
    data: items.map((i) => normalizeToMillions(i.value)),
    backgroundColor: items.map((_, idx) => PALETTE[idx % PALETTE.length]),
    borderColor: '#fff',
    borderWidth: 2,
  }],
});

const buildAssetPieOptions = (items) => ({
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
          const item = items[context.dataIndex];
          return `${item.name}: ${item.value?.displayText ?? ''}`;
        },
      },
    },
  },
});

const buildCountryPieData = (countries) => ({
  labels: countries.map((c) => c.name || 'Country'),
  datasets: [{
    data: countries.map((c) => c.percent ?? 0),
    backgroundColor: countries.map((_, idx) => PALETTE[idx % PALETTE.length]),
    borderColor: '#fff',
    borderWidth: 2,
  }],
});

const countryPieOptions = {
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
        label: (context) => `${context.label}: ${context.parsed}%`,
      },
    },
  },
};

const TotalPortfolioPage = () => {
  const [portfolioCategories, setPortfolioCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAboutData = async () => {
      try {
        const aboutRes = await getSiteInfoAbout();
        if (!isMounted) return;

        if (Array.isArray(aboutRes?.data?.assets)) {
          setPortfolioCategories(aboutRes.data.assets);
        }
      } catch (err) {
        console.error('Failed to load about data:', err);
      }
    };

    const fetchClusterData = async () => {
      try {
        const clusterRes = await getSiteInfoCluster();
        if (!isMounted) return;

        if (Array.isArray(clusterRes?.data?.countries)) {
          // TEMPORARY FIX: Add name field if missing from backend
          const countriesWithName = clusterRes.data.countries.map((c, index) => ({
            ...c,
            name: c.name || `Country ${index + 1}`,
          }));
          setCountries(countriesWithName);
        }
      } catch (err) {
        console.error('Failed to load cluster data:', err);
      }
    };

    const fetchSiteData = async () => {
      try {
        const siteRes = await getSiteInfo();
        if (!isMounted) return;

        if (siteRes?.data) {
          setStats({
            aum: siteRes.data.totalPortfolioValue?.displayText ?? 'N/A',
            countriesCount: siteRes.data.totalCountries ?? 0,
            sectorsCount: siteRes.data.totalClusters ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load site stats:', err);
        if (isMounted) {
          setStats({
            aum: 'N/A',
            countriesCount: 0,
            sectorsCount: 0,
          });
        }
      }
    };

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        await Promise.all([
          fetchAboutData(),
          fetchClusterData(),
          fetchSiteData(),
        ]);

      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load portfolio data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">Loading…</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">{error}</div>;
  }

  return (
    <>
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
                    {stats?.aum ?? '—'}
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Net assets as at {formatDisplayDate(portfolioCategories[0]?.value?.asAtDate) || 'July 30, 2026'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    {stats?.countriesCount ?? '—'}
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Core countries of focus
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-6 text-5xl font-bold text-[#0A2540] md:text-6xl lg:text-7xl font-sans">
                    {stats?.sectorsCount ?? '—'}
                  </div>
                  <div className="font-sans text-xl font-medium text-gray-700">
                    Clusters
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

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
                  Allocation decisions balance domestic opportunities across our core markets with selective international exposure through funds and equities.
                </p>
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

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
                {portfolioCategories.length > 0 ? portfolioCategories.map((category, catIdx) => {
                  const subEntities = category.subclasses || [];
                  const hasBreakdown = subEntities.length > 0;
                  return (
                    <div
                      key={category.id}
                      className={catIdx < portfolioCategories.length - 1 ? 'pb-16 border-b border-gray-200' : ''}
                    >
                      <div className="mb-16 text-center">
                        <h4 className="mb-6 font-sans text-3xl font-bold text-gray-900">
                          {category.name?.toUpperCase()}
                        </h4>
                        <div className="mb-4 text-5xl font-bold text-[#0A2540] font-sans">
                          {category.value?.displayText}
                        </div>
                        <div className="font-sans text-base tracking-wider text-gray-500">
                          AS AT {formatDisplayDate(category.value?.asAtDate).toUpperCase()}
                        </div>
                      </div>

                      {(() => {
                        const chartItems = hasBreakdown ? subEntities : [category];
                        const categoryTotalMillions = chartItems.reduce(
                          (sum, it) => sum + normalizeToMillions(it.value),
                          0
                        );

                        return (
                          <div className="flex flex-col items-center gap-16 lg:flex-row">
                            <div className="lg:w-1/2 h-80">
                              <Pie data={buildAssetPieData(chartItems)} options={buildAssetPieOptions(chartItems)} />
                            </div>
                            <div className="lg:w-1/2">
                              <div>
                                {chartItems.map((item, index) => {
                                  const itemMillions = normalizeToMillions(item.value);
                                  const percentage = categoryTotalMillions > 0
                                    ? (itemMillions / categoryTotalMillions) * 100
                                    : 0;
                                  const color = PALETTE[index % PALETTE.length];

                                  return (
                                    <div key={item.id ?? index} className="py-5 border-b border-gray-100 last:border-0">
                                      <div className="flex items-center justify-between gap-4 mb-3">
                                        <div className="flex items-center min-w-0">
                                          <div
                                            className="flex-shrink-0 w-5 h-5 mr-5 rounded-full"
                                            style={{ backgroundColor: color }}
                                          ></div>
                                          <span className="font-sans text-xl font-medium text-gray-800 truncate">{item.name}</span>
                                        </div>

                                        <div className="flex items-center flex-shrink-0 gap-3">
                                          <span className="font-sans text-2xl font-bold text-gray-900 whitespace-nowrap">
                                            {item.value?.displayText}
                                          </span>
                                          <span
                                            className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-white rounded-full whitespace-nowrap min-w-[64px]"
                                            style={{ backgroundColor: color }}
                                          >
                                            {percentage.toFixed(1)}%
                                          </span>
                                        </div>
                                      </div>

                                      <div className="w-full h-2.5 ml-10 overflow-hidden bg-gray-100 rounded-full">
                                        <div
                                          className="h-full transition-all duration-1000 ease-out rounded-full"
                                          style={{ width: `${percentage}%`, backgroundColor: color }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }) : (
                  <div className="text-center text-gray-500">No portfolio data available</div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 font-sans text-4xl font-bold text-gray-900 md:text-5xl">
                Our markets
              </h2>
              <p className="mb-16 font-sans text-xl leading-relaxed text-gray-700">
                Our investments span our core African markets — capturing growth while maintaining diversification across the continent.
              </p>
              <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

                <div>
                  <h3 className="mb-4 font-sans text-2xl font-bold text-gray-800 md:text-3xl">EXPOSURE</h3>
                  <h4 className="mb-4 font-sans text-xl font-semibold text-gray-700">BY COUNTRY</h4>
                  <div className="mb-10 font-sans text-base text-gray-500">
                    AS AT {formatDisplayDate(countries[0]?.value?.asAtDate).toUpperCase()}
                  </div>
                  <div className="h-[450px]">
                    {countries.length > 0 ? (
                      <Pie data={buildCountryPieData(countries)} options={countryPieOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No country data available
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="space-y-5">
                    {countries.length > 0 ? countries.map((country, index) => (
                      <div key={country.id ?? index} className="flex items-center justify-between py-5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 w-5 h-5 mr-4 rounded-full"
                            style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                          ></div>
                          <span className="font-sans text-xl font-medium text-gray-900">
                            {country.name || 'Unknown Country'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block font-sans text-2xl font-bold text-gray-900">
                            {country.percent}%
                          </span>
                          <span className="block font-sans text-base text-gray-500">
                            {country.value?.displayText}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-500">No country data available</div>
                    )}
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