import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LearnAboutUs = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  // Image data with titles and descriptions - EXACTLY AS BEFORE
  const investmentImages = [
    {
      id: 1,
      image: "/medicine-uniform-healthcare-medical-workers-day-concept.jpg",
      title: "Healthcare",
      description: "C-Care International Ltd is a registered private limited company which owns, operates and manages assets in the healthcare sector in Mauritius and across Uganda.",
      category: "Healthcare",
      clusterId: 1 // ADDED: for routing
    },
    {
      id: 2,
      image: "/sun-setting-silhouette-electricity-pylons.jpg",
      title: "Energy",
      description: "Our energy investments focus on sustainable power generation and distribution across Africa.",
      category: "Energy",
      clusterId: 2 // ADDED: for routing
    },
    {
      id: 3,
      image: "/close-up-shot-business-study-essentials-white-desk-work-study-aesthetics.jpg",
      title: "Banking",
      description: "Strategic investments in financial institutions driving economic growth.",
      category: "Banking",
      clusterId: 3 // ADDED: for routing
    },
    {
      id: 4,
      image: "/ai-nuclear-energy-future-innovation-disruptive-technology.jpg",
      title: "Technology",
      description: "Innovative tech solutions transforming African industries and communities.",
      category: "Technology",
      clusterId: 4 // ADDED: for routing
    },
    {
      id: 5,
      image: "/beautiful-aerial-shot-city.jpg",
      title: "Real Estate & Hospitality",
      description: "Premium developments that redefine urban landscapes and tourism.",
      category: "Real Estate",
      clusterId: 5 // ADDED: for routing
    },
    {
      id: 6,
      image: "/medium-shot-smiley-engineer-holding-tablet.jpg",
      title: "Power",
      description: "Our Power investments focus on sustainable power generation and distribution across Africa.",
      category: "Power",
      clusterId: 6 // ADDED: for routing
    }
  ];

  const stats = [
    { label: "Sectors", value: "9" },
    { label: "Continents", value: "4" },
    { label: "Countries", value: "24" },
    { label: "Employees", value: "40k +" },
    { label: "Current Value of Portfolio Investments", value: "$10.5Bn" }
  ];

  // Handle mouse enter and leave - EXACTLY AS BEFORE
  const handleMouseEnter = (id) => {
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  // ONLY ADDITION: Handle click to navigate
  const handleImageClick = (clusterId) => {
    navigate(`/cluster/${clusterId}`);
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            
            {/* SECTION HEADER - EXACTLY AS BEFORE */}
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-7xl">
                Our Clusters
              </h2>
              
              <p className="mb-8 text-lg leading-relaxed text-gray-700 max-w-7xl">
                Holdings is a pan-African, family-owned investment group dedicated to building 
                sustainable businesses that create long-term impact. Our investments focus on 
                sectors that drive growth, improve lives, and shape Africa's future.
              </p>
            </div>
            
            {/* HORIZONTAL IMAGE ACCORDION - ONLY ADDED onClick */}
            <div className="mb-12 lg:mb-16">
              <div 
                className="flex h-[500px] gap-0 overflow-hidden rounded-lg"
                onMouseLeave={handleMouseLeave}
              >
                {investmentImages.map((item) => {
                  // Calculate width based on hover state - EXACTLY AS BEFORE
                  const isHovered = hoveredId === item.id;
                  const anyHovered = hoveredId !== null;
                  
                  let widthClass = "w-1/6";
                  
                  if (anyHovered) {
                    if (isHovered) {
                      widthClass = "w-[45%] flex-grow";
                    } else {
                      widthClass = "w-[11%] flex-shrink";
                    }
                  }
                  
                  return (
                    <div 
                      key={item.id}
                      className={`relative overflow-hidden transition-all duration-700 ease-in-out cursor-pointer ${widthClass}`}
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onClick={() => handleImageClick(item.clusterId)}
                    >
                      {/* Image Container - EXACTLY AS BEFORE */}
                      <div className="relative w-full h-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                        
                        {/* Dark Overlay - EXACTLY AS BEFORE */}
                        <div className={`absolute inset-0 transition-all duration-700 ${
                          isHovered ? "bg-black bg-opacity-60" : "bg-black bg-opacity-30"
                        }`}></div>
                      </div>
                      
                      {/* Content Overlay - EXACTLY AS BEFORE */}
                      <div className="absolute inset-0 flex items-end p-6 lg:p-8">
                        <div className={`transition-all duration-700 ${
                          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}>
                          <div className="mb-2 text-xs font-semibold tracking-wider text-white uppercase">
                            {item.category}
                          </div>
                          <h4 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                            {item.title}
                          </h4>
                          <p className={`max-w-md text-sm lg:text-base leading-relaxed text-gray-200 transition-all duration-700 ${
                            isHovered ? "opacity-100" : "opacity-0"
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Vertical Title - EXACTLY AS BEFORE */}
                      <div className={`absolute transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2 ${
                        isHovered ? "opacity-0" : "opacity-100"
                      } top-1/2 left-1/2`}>
                        <div className="text-xl font-bold text-white transform -rotate-90 whitespace-nowrap">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* BUTTON SECTION - EXACTLY AS BEFORE */}
            <div className="mb-12 text-center lg:mb-16">
              <button className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                EXPLORE OUR INVESTMENTS
              </button>
            </div>
            
            {/* CENTERED DESCRIPTION WITH STATISTICS - EXACTLY AS BEFORE */}
            <div className="text-center">
              <h3 className="max-w-4xl mx-auto mb-8 text-2xl font-bold text-gray-900 lg:text-3xl">
                We are committed to building enduring value through responsible investments that 
                enhance lives and support Africa's transformation. Our portfolio was valued at 
                KES17.92 trillion ($10.5 billion) as of 31 October 2025.
              </h3>
              
              {/* STATISTICS WITH HORIZONTAL LINES - EXACTLY AS BEFORE */}
              <div className="grid grid-cols-2 gap-8 mt-16 sm:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat, index) => (
                  <div key={index} className="relative text-center">
                    
                    {/* Value */}
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A2540] mb-4">
                      {stat.value}
                    </div>
                    
                    {/* Horizontal Line Below */}
                    <div className="w-24 h-0.5 bg-[#0A2540] mx-auto mb-4"></div>
                    
                    {/* Label */}
                    <div className="text-sm font-medium tracking-wide text-gray-600 uppercase sm:text-base">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
        
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </section>
  );
};

export default LearnAboutUs;