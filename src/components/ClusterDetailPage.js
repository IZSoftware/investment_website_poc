import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClusterDescriptionByName, getClusterCompaniesByName } from '../data/data';
import { getClusterGalleryByName } from '../data/clusterLocalImages';
import { getPublicClusters } from '../api/services';

const ClusterDetailPage = () => {
  const { clusterId } = useParams(); // The backend cluster's DB id, as passed from the card link.
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCluster = async () => {
      try {
        const res = await getPublicClusters();
        if (!isMounted) return;

        const found = Array.isArray(res?.data)
          ? res.data.find((c) => String(c.id) === String(clusterId))
          : null;

        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCluster({
          title: found.name,
          description: found.publicDescription?.trim() || getClusterDescriptionByName(found.name),
          gallery: getClusterGalleryByName(found.name),
          companies: getClusterCompaniesByName(found.name),
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to load cluster:', error);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    fetchCluster();
    return () => { isMounted = false; };
  }, [clusterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (notFound || !cluster) {
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

  // One gallery item per photo in this cluster's array (2, 3, however many),
  // plus the Key Companies card at the end.
  const galleryItems = cluster.gallery.map((src, idx) => ({
    id: `img-${idx}`,
    type: 'image',
    src,
    alt: `${cluster.title} photo ${idx + 1}`,
    title: idx === 0 ? 'Main Facility' : idx === 1 ? 'Operations' : `Gallery Photo ${idx + 1}`,
  }));
  const horizontalItems = [...galleryItems, { id: 'companies', type: 'logos', title: 'Key Companies' }];
  const itemCount = horizontalItems.length;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative h-[40vh] sm:h-[50vh] lg:h-[70vh] w-full">
        <div className="absolute inset-0">
          <img src={cluster.gallery[0]} alt={cluster.title} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative h-full">
          <div className="grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
            <div className="hidden col-span-1 lg:block" />
            <div className="flex items-center h-full col-span-12 lg:col-span-10">
              <div className="px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl xl:text-7xl">
                  {cluster.title}
                </h1>
              </div>
            </div>
            <div className="hidden col-span-1 lg:block" />
          </div>
        </div>
      </section>

      {/* ── Details ── */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <p className="text-base leading-relaxed text-justify text-gray-700 sm:text-lg lg:text-xl">{cluster.description}</p>
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
                  // 45% to whichever card is hovered, the rest split evenly
                  // among the others — works no matter how many photos a
                  // cluster's gallery has.
                  const restWidth = itemCount > 1 ? (55 / (itemCount - 1)).toFixed(2) : 100;

                  const widthStyle = window.innerWidth < 1024
                    ? { width: '100%', height: item.type === 'logos' ? 'auto' : '300px' }
                    : anyHovered
                      ? { flex: isHovered ? '0 0 45%' : `0 0 ${restWidth}%` }
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
                          {cluster.companies.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              {cluster.companies.map((logo, idx) => (
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
                          ) : (
                            <p className="text-sm text-gray-500">No key companies added yet.</p>
                          )}
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