import React from 'react';
import { Link } from 'react-router-dom';
import { sectorsData, clusters } from '../data/data';

const Sectors = () => {
  return (
    <section className="bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {sectorsData.map(sector => {
              const cluster = clusters.find(c => c.sectorId === sector.id);
              const heroImage = cluster?.image || sector.heroImage;
              const logos = cluster?.logos?.length
                ? cluster.logos
                : (sector.partnerships ?? []);

              return (
                <div key={sector.id} id={sector.id} className="py-16 border-b border-gray-200 last:border-b-0">

                  {/* ── Sector Hero ── */}
                  <div className="mb-12">
                    <div
                      className="relative w-full bg-center bg-cover rounded-2xl"
                      style={{ backgroundImage: `url('${heroImage}')` }}
                    >
                      {/*
                        Height: 280px on mobile/sm, 420px on md, 600px on lg+
                        Only the height utility changes — nothing else is touched.
                      */}
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

                  {/* ── Description — justified text ── */}
                  <div className="mb-12">
                    <p className="text-lg leading-relaxed text-justify text-gray-700 md:text-xl">
                      {sector.description}
                    </p>
                  </div>

                  {/* ── Partnerships / Logos — top line only ── */}
                  {logos.length > 0 && (
                    <div>
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {logos.map((company, index) => (
                          <div
                            key={company.id ?? `${sector.id}-logo-${index}`}
                            className="flex flex-col"
                          >
                            {/* Top line only — bottom line removed */}
                            <div className="w-full h-0.5 bg-black mb-4" />

                            <div className="flex items-center gap-4">
                              <Link
                                to={company.link ?? `/company/${company.id}`}
                                className="flex-shrink-0 block"
                              >
                                <div className="flex items-center justify-center w-20 h-20 bg-white shadow-md rounded-xl">
                                  {(company.image || company.logo) ? (
                                    <img
                                      src={company.image ?? company.logo}
                                      alt={`${company.name} logo`}
                                      className="object-contain w-12 h-12 transition-opacity duration-300 cursor-pointer hover:opacity-80"
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
              );
            })}
          </div>
        </div>

        <div className="hidden col-span-1 lg:block" />
      </div>
    </section>
  );
};

export default Sectors;