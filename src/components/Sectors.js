import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSiteInfo } from '../api/services';
import { getClusterImageByName } from '../data/clusterLocalImages';

const Sectors = () => {
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchClusters = async () => {
      try {
        const res = await getSiteInfo();
        if (isMounted && Array.isArray(res?.data?.clusters)) {
          // Clusters from data.clusters
          const mapped = res.data.clusters.map((cluster) => ({
            id: cluster.id,
            title: cluster.name,
            description: cluster.description || `Explore our ${cluster.name} cluster`,
            heroImage: getClusterImageByName(cluster.name),
            // Companies are embedded in cluster.companies[]
            logos: (cluster.companies || []).map(company => ({
              id: company.id || `company-${Math.random()}`,
              name: company.name || 'Company',
              link: company.link || '#',
              image: company.logo || '',
            })),
          }));
          setSectors(mapped);
        }
      } catch (error) {
        console.error('Failed to load clusters:', error);
      }
    };

    fetchClusters();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">Our Clusters</h1>
              <p className="mt-2 text-gray-600">Explore our investment clusters across Africa</p>
            </div>

            {sectors.length > 0 ? sectors.map(sector => (
              <div key={sector.id} id={sector.id} className="py-16 border-b border-gray-200 last:border-b-0">

                <div className="mb-12">
                  <div
                    className="relative w-full bg-center bg-cover rounded-2xl"
                    style={{ backgroundImage: `url('${sector.heroImage}')` }}
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

                <div className="mb-12">
                  <p className="text-lg leading-relaxed text-justify text-gray-700 md:text-xl">
                    {sector.description}
                  </p>
                </div>

                {sector.logos && sector.logos.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {sector.logos.map((company, index) => (
                        <div
                          key={company.id ?? `${sector.id}-logo-${index}`}
                          className="flex flex-col"
                        >
                          <div className="w-full h-0.5 bg-black mb-4" />

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
                                      e.target.src = '';
                                      e.target.style.display = 'none';
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

                            <h4 className="text-xl font-semibold text-gray-900">{company.name}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )) : (
              <div className="py-16 text-center text-gray-500">
                Loading clusters...
              </div>
            )}
          </div>
        </div>

        <div className="hidden col-span-1 lg:block" />
      </div>
    </section>
  );
};

export default Sectors;