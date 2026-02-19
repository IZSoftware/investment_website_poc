import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { learnAboutUs } from '../data/data';

const LearnAboutUs = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const {
    heading,
    intro,
    portfolioStatement,
    exploreButtonLabel,
    investmentCards,
    stats,
  } = learnAboutUs;

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">

            {/* ── Section header ── */}
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-7xl">
                {heading}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-700 max-w-7xl">
                {intro}
              </p>
            </div>

            {/* ── Horizontal image accordion ── */}
            <div className="mb-12 lg:mb-16">
              <div
                className="flex h-[500px] gap-0 overflow-hidden rounded-lg"
                onMouseLeave={() => setHoveredId(null)}
              >
                {investmentCards.map(item => {
                  const isHovered  = hoveredId === item.id;
                  const anyHovered = hoveredId !== null;

                  const widthStyle = anyHovered
                    ? { flex: isHovered ? '0 0 45%' : '0 0 11%' }
                    : { flex: '1 1 0%' };

                  return (
                    <div
                      key={item.id}
                      className="relative overflow-hidden transition-all duration-700 ease-in-out cursor-pointer"
                      style={widthStyle}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onClick={() => navigate(`/cluster/${item.clusterId}`)}
                    >
                      {/* Image */}
                      <div className="relative w-full h-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                        {/* Overlay */}
                        <div
                          className={`absolute inset-0 transition-all duration-700 ${
                            isHovered ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-30'
                          }`}
                        />
                      </div>

                      {/* Expanded content (bottom, fades in on hover) */}
                      <div className="absolute inset-0 flex items-end p-6 lg:p-8">
                        <div
                          className={`transition-all duration-700 ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          }`}
                        >
                          <div className="mb-2 text-xs font-semibold tracking-wider text-white uppercase">
                            {item.category}
                          </div>
                          <h4 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                            {item.title}
                          </h4>
                          <p
                            className={`max-w-md text-sm lg:text-base leading-relaxed text-gray-200 transition-all duration-700 ${
                              isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Vertical title (shows when collapsed) */}
                      <div
                        className={`absolute transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2 ${
                          isHovered ? 'opacity-0' : 'opacity-100'
                        } top-1/2 left-1/2`}
                      >
                        <div className="text-xl font-bold text-white transform -rotate-90 whitespace-nowrap">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Explore button ── */}
            <div className="mb-12 text-center lg:mb-16">
              <button className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                {exploreButtonLabel}
              </button>
            </div>

            {/* ── Portfolio statement + statistics ── */}
            <div className="text-center">
              <h3 className="max-w-4xl mx-auto mb-8 text-2xl font-bold text-gray-900 lg:text-3xl">
                {portfolioStatement}
              </h3>

              <div className="grid grid-cols-2 gap-8 mt-16 sm:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat, idx) => (
                  <div key={idx} className="relative text-center">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A2540] mb-4">
                      {stat.value}
                    </div>
                    <div className="w-24 h-0.5 bg-[#0A2540] mx-auto mb-4" />
                    <div className="text-sm font-medium tracking-wide text-gray-600 uppercase sm:text-base">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="hidden col-span-1 lg:block" />
      </div>
    </section>
  );
};

export default LearnAboutUs;