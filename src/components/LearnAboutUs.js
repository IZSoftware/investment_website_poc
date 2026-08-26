import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSiteInfo } from "../api/services";
import { getClusterImageByName } from "../data/clusterLocalImages";

const formatToday = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const LearnAboutUs = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  // Static content
  const heading = "Who We Are";

  const intro =
    "NF Holdings is a pan-African family-owned investment holding company with investment in various sectors in East Africa. NF Holdings is inspired by our mission to create a legacy, for all Africans who will inherit the Africa we are building today. We create, grow and preserve value for our stakeholders – while driving Africa's sustainable economic and social development.";

  const exploreButtonLabel = "Explore Our Portfolio";

  const portfolioStatementBase =
    "We are committed to building enduring value through responsible investments that enhance lives and support Africa's transformation. Our portfolio was valued at";

  const [investmentCards, setInvestmentCards] = useState([]);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  const [stats, setStats] = useState([
    { value: null, label: "Total Portfolio" },
    { value: null, label: "Clusters" },
    { value: null, label: "Countries" },
    { value: null, label: "Portfolio Companies" },
  ]);

  const [portfolioStatement, setPortfolioStatement] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await getSiteInfo();

        if (isMounted && res?.data) {
          const data = res.data;

          /*
           * ---------------------------------------
           * CLUSTERS
           * ---------------------------------------
           */
          if (Array.isArray(data.clusters) && data.clusters.length > 0) {
            const mapped = data.clusters.map((cluster) => ({
              id: cluster.id,
              clusterId: cluster.id,
              title: cluster.name,
              image: getClusterImageByName(cluster.name),
              category: cluster.value?.displayText ?? "",
              description:
                cluster.description ||
                `Explore our ${cluster.name} cluster`,
            }));

            setInvestmentCards(mapped);
          }

          setClustersLoading(false);

          /*
           * ---------------------------------------
           * STATISTICS
           * ---------------------------------------
           *
           * Continents has intentionally been removed.
           */
          setStats([
            {
              value: data.totalPortfolioValue?.displayText ?? "N/A",
              label: "Total Portfolio",
            },
            {
              value: data.totalClusters ?? 0,
              label: "Clusters",
            },
            {
              value: data.totalCountries ?? 0,
              label: "Countries",
            },
            {
              value: data.totalCompanies ?? 0,
              label: "Portfolio Companies",
            },
          ]);

          setStatsLoading(false);

          /*
           * ---------------------------------------
           * PORTFOLIO STATEMENT
           * ---------------------------------------
           */
          if (data.totalPortfolioValue) {
            const asOfDate = data.lastUpdateTime
              ? new Date(data.lastUpdateTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : formatToday();

            setPortfolioStatement(
              `${portfolioStatementBase} ${data.totalPortfolioValue.displayText} as of ${asOfDate}.`
            );
          }

          setPortfolioLoading(false);
        }
      } catch (error) {
        console.error("Failed to load data:", error);

        if (isMounted) {
          setClustersLoading(false);
          setStatsLoading(false);
          setPortfolioLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-gray-50 lg:py-24">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }

          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">

            {/* ================================
                INTRO
            ================================= */}
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-7xl">
                {heading}
              </h2>

              <p className="mb-8 text-lg leading-relaxed text-justify text-gray-700 max-w-7xl">
                {intro}
              </p>
            </div>

            {/* ================================
                CLUSTERS
            ================================= */}
            <div className="mb-12 lg:mb-16">
              <div
                className="flex flex-col lg:flex-row h-auto lg:h-[500px] gap-4 lg:gap-0 overflow-hidden rounded-lg"
                onMouseLeave={() => setHoveredId(null)}
              >
                {clustersLoading ? (
                  <div className="flex flex-col w-full h-[300px] lg:h-[500px] gap-4 lg:flex-row overflow-hidden rounded-lg">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="relative flex-1 overflow-hidden rounded-lg skeleton-shimmer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-300/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                          <div className="w-20 h-3 mb-3 rounded skeleton-shimmer" />
                          <div className="w-32 h-6 rounded skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : investmentCards.length > 0 ? (
                  investmentCards.map((item) => {
                    const isHovered = hoveredId === item.id;
                    const anyHovered = hoveredId !== null;

                    const widthStyle =
                      window.innerWidth < 1024
                        ? {
                            width: "100%",
                            height: "300px",
                          }
                        : anyHovered
                        ? {
                            flex: isHovered
                              ? "0 0 45%"
                              : "0 0 11%",
                          }
                        : {
                            flex: "1 1 0%",
                          };

                    return (
                      <div
                        key={item.id}
                        className="relative w-full overflow-hidden transition-all duration-700 ease-in-out cursor-pointer lg:w-auto"
                        style={widthStyle}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onClick={() =>
                          navigate(`/cluster/${item.clusterId}`)
                        }
                      >
                        <div className="relative w-full h-full">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80";
                            }}
                          />

                          <div
                            className={`absolute inset-0 transition-all duration-700 ${
                              isHovered
                                ? "bg-black bg-opacity-60"
                                : "bg-black bg-opacity-30"
                            }`}
                          />
                        </div>

                        {/* Mobile Content */}
                        <div className="absolute inset-0 flex items-end p-4 lg:hidden">
                          <div className="w-full">
                            <div className="mb-1 text-xs font-semibold tracking-wider text-white uppercase">
                              {item.category}
                            </div>

                            <h4 className="mb-2 text-xl font-bold text-white">
                              {item.title}
                            </h4>

                            <p className="text-sm leading-relaxed text-gray-200 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Desktop Content */}
                        <div className="absolute inset-0 items-end hidden p-6 lg:flex lg:p-8">
                          <div
                            className={`transition-all duration-700 ${
                              isHovered
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4"
                            }`}
                          >
                            <div className="mb-2 text-xs font-semibold tracking-wider text-white uppercase">
                              {item.category}
                            </div>

                            <h4 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                              {item.title}
                            </h4>

                            <p
                              className={`max-w-md text-sm lg:text-base leading-relaxed text-gray-200 transition-all duration-700 ${
                                isHovered
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Collapsed Vertical Title */}
                        <div
                          className={`absolute transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block ${
                            isHovered
                              ? "opacity-0"
                              : "opacity-100"
                          } top-1/2 left-1/2`}
                        >
                          <div className="text-xl font-bold text-white transform -rotate-90 whitespace-nowrap">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500">
                    No clusters available.
                  </div>
                )}
              </div>
            </div>

            {/* ================================
                EXPLORE PORTFOLIO
            ================================= */}
            <div className="mb-12 text-center lg:mb-16">
              <button
                onClick={() => navigate("/portfolio")}
                className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                {exploreButtonLabel}
              </button>
            </div>

            {/* ================================
                PORTFOLIO VALUE + STATS
            ================================= */}
            <div className="text-center">
              <h3 className="max-w-4xl mx-auto mb-8 text-2xl font-bold text-gray-900 lg:text-3xl">
                {portfolioLoading ? (
                  <span className="block max-w-3xl mx-auto">
                    <span className="block w-11/12 mx-auto mb-3 rounded-md h-7 skeleton-shimmer" />
                    <span className="block w-7/12 mx-auto rounded-md h-7 skeleton-shimmer" />
                  </span>
                ) : (
                  portfolioStatement
                )}
              </h3>

              {/* ================================
                  STATS
                  4 ITEMS — NO CONTINENTS
              ================================= */}
              <div className="grid grid-cols-2 gap-4 mt-8 sm:gap-8 sm:mt-16 sm:grid-cols-4">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="relative text-center"
                  >
                    {statsLoading ? (
                      <>
                        <div className="w-24 h-12 mx-auto mb-2 rounded-md sm:w-32 sm:h-14 lg:w-40 lg:h-16 sm:mb-4 skeleton-shimmer" />

                        <div className="w-16 sm:w-20 lg:w-24 h-0.5 bg-gray-200 mx-auto mb-2 sm:mb-4" />

                        <div className="w-20 h-3 mx-auto rounded skeleton-shimmer sm:w-24 sm:h-4" />
                      </>
                    ) : (
                      <>
                        <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0A2540] mb-2 sm:mb-4">
                          {stat.value}
                        </div>

                        <div className="w-16 sm:w-20 lg:w-24 h-0.5 bg-[#0A2540] mx-auto mb-2 sm:mb-4" />

                        <div className="text-xs font-medium tracking-wide text-gray-600 uppercase sm:text-sm">
                          {stat.label}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="hidden col-span-1 lg:block" />
      </div>
    </section>
  );
};

export default LearnAboutUs;