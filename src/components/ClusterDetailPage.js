import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClusterById } from '../data/data';

const ClusterDetailPage = () => {
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  // clusterId from the URL may be a string — coerce to number for lookup
  const cluster = getClusterById(parseInt(clusterId, 10));

  if (!cluster) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Cluster Not Found</h1>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // statLabels is now stored on each cluster in data.js — no title-keyed map needed
  const statLabels = cluster.statLabels;

  // Accordion panels: 2 images + logos
  const horizontalItems = [
    { id: 1, type: 'image', src: cluster.image,                              alt: cluster.title,             title: 'Main Facility' },
    { id: 2, type: 'image', src: cluster.secondImage || '/placeholder.jpg',  alt: `${cluster.title} – Ops`, title: 'Operations'    },
    { id: 3, type: 'logos',                                                                                   title: 'Key Companies' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative h-[60vh] lg:h-[70vh] w-full">
        <div className="absolute inset-0">
          <img src={cluster.image} alt={cluster.title} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative h-full">
          <div className="grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
            <div className="hidden col-span-1 lg:block" />
            <div className="flex items-center h-full col-span-12 lg:col-span-10">
              <div className="px-4 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-7xl">
                  {cluster.title}
                </h1>
                <p className="max-w-2xl text-lg text-gray-200 lg:text-xl">{cluster.description}</p>
              </div>
            </div>
            <div className="hidden col-span-1 lg:block" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {statLabels.map(({ key, label }) => (
                  <div key={key} className="p-8 text-center">
                    <div className="text-5xl font-bold text-[#0A2540] mb-3">
                      {cluster.stats[key]}
                    </div>
                    <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
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
      <section className="py-16 bg-gray-50">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <p className="text-xl leading-relaxed text-gray-700">{cluster.details}</p>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>

      {/* ── Gallery & Key Companies (horizontal accordion) ── */}
      <section className="py-16 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 lg:text-4xl">
                Gallery &amp; Key Companies
              </h2>

              <div
                className="flex h-[500px] gap-0 overflow-hidden rounded-lg mb-16"
                onMouseLeave={() => setHoveredId(null)}
              >
                {horizontalItems.map(item => {
                  const isHovered  = hoveredId === item.id;
                  const anyHovered = hoveredId !== null;
                  const widthStyle = anyHovered
                    ? { flex: isHovered ? '0 0 45%' : '0 0 27.5%' }
                    : { flex: '1 1 0%' };

                  return (
                    <div
                      key={item.id}
                      className="relative h-full overflow-hidden transition-all duration-500 ease-in-out cursor-pointer"
                      style={widthStyle}
                      onMouseEnter={() => setHoveredId(item.id)}
                    >
                      {item.type === 'image' ? (
                        <>
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                          />
                          <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-30'}`} />
                        </>
                      ) : (
                        <div className="h-full p-8 bg-gray-50">
                          <h3 className="mb-6 text-2xl font-bold text-gray-900">{item.title}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {cluster.logos.map((logo, idx) => (
                              <a
                                key={idx}
                                href={logo.link}
                                className="flex flex-col items-center p-4 transition-all duration-300 bg-white border border-gray-200 rounded-lg group hover:shadow-lg"
                              >
                                <div className="flex items-center justify-center w-16 h-16 mb-3 bg-white rounded-full shadow-sm group-hover:shadow-md">
                                  {logo.image ? (
                                    <img src={logo.image} alt={logo.name} className="w-12 h-12" />
                                  ) : (
                                    <div className="text-xl font-bold text-gray-800">{logo.name.charAt(0)}</div>
                                  )}
                                </div>
                                <div className="text-sm font-semibold text-center text-gray-800 group-hover:text-blue-600">
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

              {/* Back */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-8 py-3 bg-[#0A2540] text-white font-semibold rounded-full hover:bg-[#003852] transition-all duration-300 shadow-md hover:shadow-lg"
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