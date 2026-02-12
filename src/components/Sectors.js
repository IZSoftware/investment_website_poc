import React from 'react';
import { Link } from 'react-router-dom';
import { sectorsData } from '../data/sectorsData';

const Sectors = () => {
  return (
    <section className="bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {sectorsData.map((sector) => (
              <div key={sector.id} id={sector.id} className="py-16 border-b border-gray-200 last:border-b-0">
                {/* Sector Hero Section - Increased Height */}
                <div className="mb-12">
                  <div 
                    className="relative w-full bg-center bg-cover rounded-2xl"
                    style={{ 
                      backgroundImage: `url('${sector.heroImage}')`,
                      height: '600px'
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl"></div>
                    <div className="absolute inset-0 flex items-end p-8">
                      <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                        {sector.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Sector Description */}
                <div className="mb-12">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                    {sector.description}
                  </p>
                </div>

                {/* Partnerships Section */}
                {sector.partnerships && sector.partnerships.length > 0 && (
                  <div>
                    <h3 className="mb-8 text-2xl font-bold text-gray-900">
                      Partnerships
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {sector.partnerships.map((company) => (
                        <div key={company.id} className="p-6 transition-colors duration-300 bg-gray-50 rounded-xl hover:bg-gray-100">
                          {/* Clickable Logo */}
                          <Link 
                            to={`/company/${company.id}`}
                            className="block mb-4"
                          >
                            <div className="flex items-center justify-center h-16 mb-4">
                              {company.logo ? (
                                <img 
                                  src={company.logo} 
                                  alt={`${company.name} logo`}
                                  className="object-contain max-w-full transition-opacity duration-300 cursor-pointer max-h-16 hover:opacity-80"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full">
                                  <span className="font-semibold text-gray-500">
                                    {company.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>
                          
                          <h4 className="mb-2 text-xl font-semibold text-gray-900">
                            {company.name}
                          </h4>
                          <p className="mb-4 text-gray-600">
                            {company.description}
                          </p>
                          
                          {/* View Details Link */}
                          <Link 
                            to={`/company/${company.id}`}
                            className="inline-flex items-center text-[#1C1F26] hover:text-[#1C1F26] font-medium"
                          >
                            View Details
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </section>
  );
};

export default Sectors;