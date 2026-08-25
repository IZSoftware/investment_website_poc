import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSiteInfo } from "../api/services";
import { getClusterImageByName } from "../data/clusterLocalImages";

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchClusters = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await getSiteInfo();

        if (!isMounted) return;

        if (Array.isArray(res?.data?.clusters)) {
          const mapped = res.data.clusters.map((cluster) => ({
            id: cluster.id,
            title: cluster.name,
            description:
              cluster.description || `Explore our ${cluster.name} cluster`,
            heroImage: getClusterImageByName(cluster.name),

            logos: (cluster.companies || []).map((company, index) => ({
              id: company.id || `company-${cluster.id}-${index}`,
              name: company.name || "Company",
              link: company.link || "#",
              image: company.logo || "",
            })),
          }));

          setSectors(mapped);
        } else {
          setSectors([]);
        }
      } catch (error) {
        console.error("Failed to load clusters:", error);

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClusters();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* PAGE HEADER */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                Our Clusters
              </h1>

              <p className="mt-2 text-gray-600">
                Explore our investment clusters across Africa
              </p>
            </div>

            {/* LOADING STATE */}
            {loading && (
              <div className="space-y-16">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="py-16 border-b border-gray-200">
                    {/* IMAGE SKELETON */}
                    <div className="mb-12">
                      <div className="w-full h-[280px] sm:h-[340px] md:h-[420px] lg:h-[600px] bg-gray-200 rounded-2xl animate-pulse" />
                    </div>

                    {/* DESCRIPTION SKELETON */}
                    <div className="mb-12 space-y-3">
                      <div className="w-full h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="w-11/12 h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="w-9/12 h-5 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* COMPANY SKELETONS */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, companyIndex) => (
                        <div key={companyIndex} className="flex flex-col">
                          <div className="w-full h-0.5 mb-4 bg-gray-200 animate-pulse" />

                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 bg-gray-200 shadow-md rounded-xl animate-pulse" />

                            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR STATE */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-5 bg-gray-100 rounded-full">
                  <span className="text-2xl text-gray-400">!</span>
                </div>

                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Unable to load our clusters
                </h3>

                <p className="max-w-md text-gray-500">
                  We couldn't retrieve the cluster information right now. Please
                  try again later.
                </p>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && sectors.length === 0 && (
              <div className="py-24 text-center">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No clusters available
                </h3>

                <p className="text-gray-500">
                  There are currently no investment clusters available.
                </p>
              </div>
            )}

            {/* REAL DATA */}
            {!loading &&
              !error &&
              sectors.length > 0 &&
              sectors.map((sector) => (
                <div
                  key={sector.id}
                  id={sector.id}
                  className="py-16 border-b border-gray-200 last:border-b-0"
                >
                  {/* HERO IMAGE */}
                  <div className="mb-12">
                    <div
                      className="relative w-full bg-center bg-cover rounded-2xl"
                      style={{
                        backgroundImage: `url('${sector.heroImage}')`,
                      }}
                    >
                      <div className="h-[280px] sm:h-[340px] md:h-[420px] lg:h-[600px]">
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl" />

                        <div className="absolute inset-0 flex items-end p-8">
                          <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            {sector.title}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mb-12">
                    <p className="text-lg leading-relaxed text-justify text-gray-700 md:text-xl">
                      {sector.description}
                    </p>
                  </div>

                  {/* COMPANIES */}
                  {sector.logos && sector.logos.length > 0 && (
                    <div>
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {sector.logos.map((company, index) => (
                          <div
                            key={company.id ?? `${sector.id}-logo-${index}`}
                            className="flex flex-col"
                          >
                            <div className="w-full h-0.5 mb-4 bg-black" />

                            <div className="flex items-center gap-4">
                              <Link
                                to={company.link ?? `/company/${company.id}`}
                                className="flex-shrink-0 block"
                              >
                                <div className="flex items-center justify-center w-20 h-20 bg-white shadow-md rounded-xl">
                                  {company.image ? (
                                    <img
                                      src={company.image}
                                      alt={`${company.name} logo`}
                                      className="object-contain w-12 h-12 transition-opacity duration-300 cursor-pointer hover:opacity-80"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                                      <span className="text-lg font-semibold text-gray-500">
                                        {company.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </Link>

                              <h4 className="text-xl font-semibold text-gray-900">
                                {company.name}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="hidden col-span-1 lg:block" />
      </div>
    </section>
  );
};

export default Sectors;
