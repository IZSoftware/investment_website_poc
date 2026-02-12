import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clustersData from '../data/clustersData.json';

const ClusterDetailPage = () => {
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
  
  const cluster = clustersData.clusters.find(c => c.id === parseInt(clusterId));

  const handleMouseEnter = (id) => {
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  // Function to get stat labels based on cluster type
  const getStatLabels = (clusterTitle) => {
    const labels = {
      "Healthcare Cluster": {
        stat1: { value: cluster?.stats.hospitals, label: "Hospitals" },
        stat2: { value: cluster?.stats.clinics, label: "Clinics" },
        stat3: { value: cluster?.stats.medicalStaff, label: "Medical Staff" },
        stat4: { value: cluster?.stats.countries, label: "Countries" }
      },
      "Energy Cluster": {
        stat1: { value: cluster?.stats.powerPlants, label: "Power Plants" },
        stat2: { value: cluster?.stats.renewableCapacity, label: "Renewable Capacity" },
        stat3: { value: cluster?.stats.employees, label: "Employees" },
        stat4: { value: cluster?.stats.countries, label: "Countries" }
      },
      "Banking Cluster": {
        stat1: { value: cluster?.stats.branches, label: "Branches" },
        stat2: { value: cluster?.stats.customers, label: "Customers" },
        stat3: { value: cluster?.stats.employees, label: "Employees" },
        stat4: { value: cluster?.stats.countries, label: "Countries" }
      },
      "Technology Cluster": {
        stat1: { value: cluster?.stats.dataCenters, label: "Data Centers" },
        stat2: { value: cluster?.stats.techStartups, label: "Tech Startups" },
        stat3: { value: cluster?.stats.employees, label: "Employees" },
        stat4: { value: cluster?.stats.countries, label: "Countries" }
      },
      "Real Estate & Hospitality Cluster": {
        stat1: { value: cluster?.stats.properties, label: "Properties" },
        stat2: { value: cluster?.stats.hotels, label: "Hotels" },
        stat3: { value: cluster?.stats.employees, label: "Employees" },
        stat4: { value: cluster?.stats.countries, label: "Countries" }
      },
      "Power Cluster": {
        stat1: { value: cluster?.stats.totalCapacity, label: "Total Capacity" },
        stat2: { value: cluster?.stats.transmissionLines, label: "Transmission Lines" },
        stat3: { value: cluster?.stats.employees, label: "Employees" },
        stat4: { value: cluster?.stats.countries, label: "Countries" }
      }
    };
    
    return labels[clusterTitle] || labels["Healthcare Cluster"]; // Default fallback
  };

  const statLabels = getStatLabels(cluster?.title || "");

  // Dynamic items based on cluster data
  const horizontalItems = [
    { 
      id: 1, 
      type: 'image', 
      src: cluster?.image, 
      alt: cluster?.title, 
      title: "Main Facility" 
    },
    { 
      id: 2, 
      type: 'image', 
      src: cluster?.secondImage || "/placeholder-image.jpg",
      alt: `${cluster?.title} - Operations`, 
      title: "Operations" 
    },
    { 
      id: 3, 
      type: 'logos', 
      title: "Key Companies" 
    }
  ];

  if (!cluster) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Cluster Not Found</h1>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* First Section: Full-width background image with title */}
      <section className="relative h-[60vh] lg:h-[70vh] w-full">
        <div className="absolute inset-0">
          <img
            src={cluster.image}
            alt={cluster.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative h-full">
          <div className="grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
            <div className="hidden col-span-1 lg:block"></div>
            
            <div className="flex items-center h-full col-span-12 lg:col-span-10">
              <div className="px-4 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-7xl">
                  {cluster.title}
                </h1>
                <p className="max-w-2xl text-lg text-gray-200 lg:text-xl">
                  {cluster.description}
                </p>
              </div>
            </div>
            
            <div className="hidden col-span-1 lg:block"></div>
          </div>
        </div>
      </section>

      {/* Second Section: Statistics in a row - NO CARDS/BACKGROUND */}
      <section className="py-16 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="p-8 text-center">
                  <div className="text-5xl font-bold text-[#0A2540] mb-3">
                    {statLabels.stat1.value}
                  </div>
                  <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                    {statLabels.stat1.label}
                  </div>
                </div>
                <div className="p-8 text-center">
                  <div className="text-5xl font-bold text-[#0A2540] mb-3">
                    {statLabels.stat2.value}
                  </div>
                  <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                    {statLabels.stat2.label}
                  </div>
                </div>
                <div className="p-8 text-center">
                  <div className="text-5xl font-bold text-[#0A2540] mb-3">
                    {statLabels.stat3.value}
                  </div>
                  <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                    {statLabels.stat3.label}
                  </div>
                </div>
                <div className="p-8 text-center">
                  <div className="text-5xl font-bold text-[#0A2540] mb-3">
                    {statLabels.stat4.value}
                  </div>
                  <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                    {statLabels.stat4.label}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* Rest of the component remains the same... */}
      {/* Third Section: Full-width description */}
      <section className="py-16 bg-gray-50">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <p className="text-xl leading-relaxed text-gray-700">
                {cluster.details}
              </p>
            </div>
          </div>
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>

      {/* Fourth Section: 2 Images + Logos in horizontal accordion */}
      <section className="py-16 bg-white">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 lg:text-4xl">
                Gallery & Key Companies
              </h2>
              
              {/* HORIZONTAL ACCORDION: 2 Images + Logos */}
              <div 
                className="flex h-[500px] gap-0 overflow-hidden rounded-lg mb-16"
                onMouseLeave={handleMouseLeave}
              >
                {horizontalItems.map((item) => {
                  const isHovered = hoveredId === item.id;
                  const anyHovered = hoveredId !== null;
                  
                  let widthClass = "w-1/3";
                  
                  if (anyHovered) {
                    if (isHovered) {
                      widthClass = "w-[45%] flex-grow";
                    } else {
                      widthClass = "w-[27.5%] flex-shrink";
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      className={`relative h-full transition-all duration-500 ease-in-out cursor-pointer overflow-hidden ${widthClass}`}
                      onMouseEnter={() => handleMouseEnter(item.id)}
                    >
                      {item.type === 'image' ? (
                        <>
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                          />
                          <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-30'}`}></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/70 to-transparent">
                          </div>
                        </>
                      ) : (
                        <div className="h-full p-8 bg-gray-50">
                          <h3 className="mb-6 text-2xl font-bold text-gray-900">{item.title}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {cluster.logos.map((logo, index) => (
                              <a
                                key={index}
                                href={logo.link}
                                className="flex flex-col items-center p-4 transition-all duration-300 bg-white border border-gray-200 rounded-lg group hover:shadow-lg"
                              >
                                <div className="flex items-center justify-center w-16 h-16 mb-3 bg-white rounded-full shadow-sm group-hover:shadow-md">
                                  {logo.image ? (
                                    <img src={logo.image} alt={logo.name} className="w-12 h-12" />
                                  ) : (
                                    <div className="text-xl font-bold text-gray-800">
                                      {logo.name.charAt(0)}
                                    </div>
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

              {/* Back Button */}
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
          
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </section>
    </div>
  );
};

export default ClusterDetailPage;