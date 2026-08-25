import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSiteInfo } from '../api/services';

ChartJS.register(ArcElement, Tooltip, Legend);

const FALLBACK_PALETTE = [
  '#338BBA',
  '#FF6B6B',
  '#4ECDC4',
  '#FFD166',
  '#06D6A0',
  '#118AB2',
  '#9B5DE5',
  '#F15BB5',
];

const PortfolioHighlights = () => {
  const hero = {
    title: 'Our Portfolio',
    backgroundImage: '/businessman-is-using-computer-laptop.jpg',
  };

  const [activeTab, setActiveTab] = useState('HIGHLIGHTS');
  const [tabs, setTabs] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [summaryText, setSummaryText] = useState('');

  const [highlightStats, setHighlightStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await getSiteInfo();

        if (!isMounted) return;

        if (!res?.data) {
          setError(true);
          return;
        }

        const data = res.data;

        /*
         * Clusters
         */
        if (Array.isArray(data.clusters) && data.clusters.length > 0) {
          const sorted = data.clusters;

          setTabs([
            {
              id: 0,
              name: 'HIGHLIGHTS',
              href: '#highlights',
            },
            ...sorted.map((cluster, index) => ({
              id: index + 1,
              name: cluster.name,
              href: `#${cluster.id}`,
            })),
          ]);

          setPieData(
            sorted.map((cluster, index) => ({
              category: cluster.name,
              percentage: cluster.percent ?? 0,
              color:
                FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
            }))
          );
        }

        /*
         * Stats
         */
        setHighlightStats([
          {
            label: 'Clusters',
            value: String(data.totalClusters ?? 0),
          },
          {
            label: 'Countries',
            value: String(data.totalCountries ?? 0),
          },
          {
            label: 'Portfolio Companies',
            value: String(data.totalCompanies ?? 0),
          },
          {
            label: 'Portfolio Value',
            value:
              data.totalPortfolioValue?.displayText ?? 'N/A',
          },
        ]);

        /*
         * Summary
         */
        if (data.totalPortfolioValue) {
          const asOfDate = data.lastUpdateTime
            ? new Date(data.lastUpdateTime).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
              )
            : 'N/A';

          setSummaryText(
            `We invest in clusters that provide strong long-term returns and have the ability to transform Africa's economy. The value of our existing portfolio as at ${asOfDate} is ${data.totalPortfolioValue.displayText}.`
          );
        }
      } catch (error) {
        console.error(
          'Failed to load portfolio highlights:',
          error
        );

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const bigPieChartData = {
    labels: pieData.map((item) => item.category),
    datasets: [
      {
        data: pieData.map((item) => item.percentage),
        backgroundColor: pieData.map((item) => item.color),
        borderColor: '#fff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const bigPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <>
      {/* HERO */}
      <section
        className="relative w-full h-[50vh] sm:h-[60vh] lg:h-screen min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: `url('${hero.backgroundImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        <div className="grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />

          <div className="relative col-span-12 lg:col-span-10">
            <div className="h-full px-4 sm:px-6 lg:px-8">

              <div className="absolute z-10 bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8">
                <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  {hero.title}
                </h1>
              </div>

              <div className="absolute hidden transform -translate-y-1/2 right-4 sm:right-6 lg:right-8 top-1/2 md:block">
                <div className="flex flex-col space-y-3 lg:space-y-4">
                  {[FaFacebook, FaTwitter, FaLinkedin].map(
                    (Icon, index) => (
                      <button
                        key={index}
                        className="flex items-center justify-center w-8 h-8 text-white transition bg-white rounded-full lg:w-10 lg:h-10 bg-opacity-20 hover:bg-opacity-30"
                      >
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    )
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-8 bg-white sm:py-10 lg:py-12">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />

          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">

              {/* TABS */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:gap-3 lg:mb-12">

                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"
                    />
                  ))
                ) : error ? (
                  <div className="text-sm text-gray-500">
                    Portfolio navigation unavailable.
                  </div>
                ) : (
                  tabs.map((tab) => (
                    <a
                      key={tab.id}
                      href={tab.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(tab.name);
                      }}
                      className={`text-xs sm:text-sm font-medium uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
                        activeTab === tab.name
                          ? 'bg-[#338BBA] text-white'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.name}
                    </a>
                  ))
                )}

              </div>

              <div className="max-w-4xl mx-auto text-center">

                <h6 className="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase lg:mb-6 sm:text-sm">
                  PORTFOLIO HIGHLIGHTS
                </h6>

                {/* SUMMARY */}
                {loading ? (
                  <div className="max-w-3xl mx-auto space-y-3">
                    <div className="w-full h-4 mx-auto bg-gray-200 rounded animate-pulse" />
                    <div className="w-11/12 h-4 mx-auto bg-gray-200 rounded animate-pulse" />
                    <div className="w-9/12 h-4 mx-auto bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : error ? (
                  <p className="text-gray-500">
                    Unable to load portfolio highlights.
                  </p>
                ) : (
                  <h2 className="mb-6 text-base font-normal leading-relaxed text-gray-800 lg:mb-8 sm:text-lg md:text-xl lg:text-2xl">
                    {summaryText}
                  </h2>
                )}

                {/* STATS */}
                {activeTab === 'HIGHLIGHTS' && (
                  <div className="grid grid-cols-2 gap-4 mt-8 sm:gap-6 lg:gap-8 lg:mt-12 md:grid-cols-4">

                    {loading
                      ? Array.from({ length: 4 }).map(
                          (_, index) => (
                            <div
                              key={index}
                              className="text-center"
                            >
                              <div className="w-20 h-10 mx-auto mb-3 bg-gray-200 rounded animate-pulse sm:h-12" />
                              <div className="w-24 h-3 mx-auto bg-gray-200 rounded animate-pulse" />
                            </div>
                          )
                        )
                      : error
                      ? (
                        <div className="col-span-full py-6 text-gray-500">
                          Unable to load portfolio statistics.
                        </div>
                      )
                      : highlightStats.map((stat, index) => (
                          <div
                            key={index}
                            className="text-center"
                          >
                            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1C1F26]">
                              {stat.value}
                            </div>

                            <div className="mt-1 text-xs font-medium tracking-wide text-gray-600 uppercase sm:mt-2">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                  </div>
                )}

              </div>
            </div>
          </div>

          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>

      {/* PIE CHART */}
      <section className="py-10 bg-white sm:py-12 lg:py-16">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />

          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">

              <div className="max-w-4xl mx-auto mb-8 lg:mb-12">
                <div className="h-[300px] sm:h-[400px] lg:h-[500px]">

                  {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="relative w-56 h-56 border-[18px] border-gray-100 border-t-[#338BBA] rounded-full animate-spin sm:w-64 sm:h-64 lg:w-72 lg:h-72" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      Unable to load portfolio allocation.
                    </div>
                  ) : pieData.length > 0 ? (
                    <Pie
                      data={bigPieChartData}
                      options={bigPieOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      No portfolio allocation available.
                    </div>
                  )}

                </div>
              </div>

              {/* MINI CHARTS */}
              {loading ? (
                <div className="flex flex-wrap justify-center gap-8 mb-12 sm:gap-10 lg:gap-12 lg:mb-16">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center"
                    >
                      <div className="w-20 h-20 mb-3 border-8 border-gray-100 border-t-gray-300 rounded-full animate-spin sm:w-24 sm:h-24 lg:w-28 lg:h-28" />
                      <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16">

                  {pieData.map((item, index) => {
                    const miniData = {
                      labels: [item.category, 'Other'],
                      datasets: [
                        {
                          data: [
                            item.percentage,
                            100 - item.percentage,
                          ],
                          backgroundColor: [
                            item.color,
                            '#f3f4f6',
                          ],
                          borderColor: '#fff',
                          borderWidth: 2,
                        },
                      ],
                    };

                    const miniOptions = {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                      cutout: '60%',
                    };

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center basis-[45%] sm:basis-[30%] md:basis-[15%]"
                      >
                        <div className="relative w-20 h-20 mb-2 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 lg:mb-3">
                          <Pie
                            data={miniData}
                            options={miniOptions}
                          />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <div
                            className="flex-shrink-0 w-2 h-2 mr-1 rounded-full sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 sm:mr-1.5 lg:mr-2"
                            style={{
                              backgroundColor: item.color,
                            }}
                          />

                          <span className="text-xs font-medium text-gray-700 sm:text-sm">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                </div>
              )}

              {/* PHILOSOPHY */}
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="mb-4 text-lg font-bold text-gray-900 lg:mb-6 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                  Our Investment Philosophy
                </h3>

                <p className="text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg lg:text-xl">
                  We invest in clusters that provide strong
                  long-term returns and have the ability to
                  transform Africa's economy. Our approach
                  combines deep local expertise with global
                  best practices to create sustainable value
                  for all stakeholders.
                </p>
              </div>

            </div>
          </div>

          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>
    </>
  );
};

export default PortfolioHighlights;