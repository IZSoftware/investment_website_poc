import React from 'react';
import { Link } from 'react-router-dom';
import { sectorsData } from '../data/data';

const Sectors = () => {
  return (
    <section className="bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {sectorsData.map(sector => (
              <div key={sector.id} id={sector.id} className="py-16 border-b border-gray-200 last:border-b-0">

                {/* ── Sector Hero ── */}
                <div className="mb-12">
                  <div
                    className="relative w-full bg-center bg-cover rounded-2xl"
                    style={{ backgroundImage: `url('${sector.heroImage}')`, height: '600px' }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl" />
                    <div className="absolute inset-0 flex items-end p-8">
                      <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                        {sector.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* ── Description ── */}
                <div className="mb-12">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                    {sector.description}
                  </p>
                </div>

                {/* ── Partnerships ── */}
                {sector.partnerships?.length > 0 && (
                  <div>
                    <h3 className="mb-8 text-2xl font-bold text-gray-900">Partnerships</h3>
                    {/*
                      Grid is responsive: 1 col on mobile, 2 on md, 3 on lg.
                      Adding more objects to sector.partnerships in data.js will
                      automatically place them into the next grid cell — no UI
                      changes needed.
                    */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {sector.partnerships.map(company => (
                        <div key={company.id} className="flex flex-col">
                          {/* Top line */}
                          <div className="w-full h-0.5 bg-black mb-4" />

                          <div className="flex items-center gap-4">
                            {/* Logo card */}
                            <Link to={`/company/${company.id}`} className="flex-shrink-0 block">
                              <div className="flex items-center justify-center w-20 h-20 bg-white shadow-md rounded-xl">
                                {company.logo ? (
                                  <img
                                    src={company.logo}
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

                            {/* Company name */}
                            <h4 className="text-xl font-semibold text-gray-900">{company.name}</h4>
                          </div>

                          {/* Bottom line */}
                          <div className="w-full h-0.5 bg-black mt-4" />
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