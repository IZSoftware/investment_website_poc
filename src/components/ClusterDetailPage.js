import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClusterById } from '../data/data';

const ClusterDetailPage = () => {
  const { clusterId } = useParams(); // This will now be a string like 'finance', 'technology', etc.
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  // Remove parseInt - clusterId is already a string
  const cluster = getClusterById(clusterId);

  if (!cluster) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="px-4 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Cluster Not Found</h1>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const statLabels = cluster.statLabels;

  const horizontalItems = [
    { id: 1, type: 'image', src: cluster.image,                             alt: cluster.title,             title: 'Main Facility' },
    { id: 2, type: 'image', src: cluster.secondImage || '/placeholder.jpg', alt: `${cluster.title} – Ops`, title: 'Operations'    },
    { id: 3, type: 'logos',                                                                                  title: 'Key Companies' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative h-[40vh] sm:h-[50vh] lg:h-[70vh] w-full">
        <div className="absolute inset-0">
          <img src={cluster.image} alt={cluster.title} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative h-full">
          <div className="grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
            <div className="hidden col-span-1 lg:block" />
            <div className="flex items-center h-full col-span-12 lg:col-span-10">
              <div className="px-4 sm:px-6 lg:px-8">
                <h1 className="mb-4 text-2xl font-bold text-white lg:mb-6 sm:text-3xl lg:text-4xl xl:text-7xl">
                  {cluster.title}
                </h1>
                <p className="max-w-2xl text-sm text-justify text-gray-200 sm:text-base lg:text-lg xl:text-xl">{cluster.description}</p>
              </div>
            </div>
            <div className="hidden col-span-1 lg:block" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-white lg:py-16">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 md:grid-cols-4">
                {statLabels.map(({ key, label }) => (
                  <div key={key} className="p-4 text-center sm:p-6 lg:p-8">
                    <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0A2540] mb-2 lg:mb-3">
                      {cluster.stats[key]}
                    </div>
                    <div className="text-xs font-medium tracking-wide text-gray-600 uppercase sm:text-sm">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>

      {/* ── Details ── */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <p className="text-base leading-relaxed text-justify text-gray-700 sm:text-lg lg:text-xl">{cluster.details}</p>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>

      {/* ── Gallery & Key Companies (horizontal accordion) ── */}
      <section className="py-12 bg-white lg:py-16">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 lg:mb-8 sm:text-3xl lg:text-4xl">
                Gallery &amp; Key Companies
              </h2>

              <div
                className="flex flex-col lg:flex-row h-auto lg:h-[500px] gap-4 lg:gap-0 overflow-hidden rounded-lg mb-12 lg:mb-16"
                onMouseLeave={() => setHoveredId(null)}
              >
                {horizontalItems.map(item => {
                  const isHovered  = hoveredId === item.id;
                  const anyHovered = hoveredId !== null;

                  const widthStyle = window.innerWidth < 1024
                    ? { width: '100%', height: item.type === 'logos' ? 'auto' : '300px' }
                    : anyHovered
                      ? { flex: isHovered ? '0 0 45%' : '0 0 27.5%' }
                      : { flex: '1 1 0%' };

                  return (
                    <div
                      key={item.id}
                      className="relative w-full overflow-hidden transition-all duration-500 ease-in-out cursor-pointer lg:w-auto"
                      style={widthStyle}
                      onMouseEnter={() => setHoveredId(item.id)}
                    >
                      {item.type === 'image' ? (
                        <>
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="object-cover w-full h-full transition-transform duration-500 lg:hover:scale-105"
                          />
                          <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-30'}`} />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent lg:hidden">
                            <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          </div>
                        </>
                      ) : (
                        <div className="h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
                          <h3 className="mb-4 text-xl font-bold text-gray-900 lg:mb-6 lg:text-2xl">{item.title}</h3>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {cluster.logos.map((logo, idx) => (
                              <a
                                key={idx}
                                href={logo.link}
                                className="flex flex-col items-center p-3 transition-all duration-300 bg-white border border-gray-200 rounded-lg sm:p-4 group hover:shadow-lg"
                              >
                                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-white rounded-full shadow-sm sm:w-14 sm:h-14 lg:w-16 lg:h-16 lg:mb-3 group-hover:shadow-md">
                                  {logo.image ? (
                                    <img src={logo.image} alt={logo.name} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                                  ) : (
                                    <div className="text-base font-bold text-gray-800 sm:text-lg lg:text-xl">{logo.name.charAt(0)}</div>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-center text-gray-800 sm:text-sm group-hover:text-blue-600">
                                  {logo.name}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center lg:mt-8">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-[#0A2540] text-white font-semibold rounded-full hover:bg-[#003852] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>
    </div>
  );
};

export default ClusterDetailPage;