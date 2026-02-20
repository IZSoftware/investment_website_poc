import React, { useState } from 'react';

const LeadershipPhilanthropy = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const youtubeVideoId = "_zShxJofkjU";

  return (
    <section className="py-16 bg-white lg:py-24">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            
            {/* SECTION 1: QUOTE */}
            <div className="grid items-center grid-cols-1 gap-12 mb-20 lg:grid-cols-2 lg:gap-16 lg:mb-24">
              <div>
                <div className="mb-8">
                  <div className="mb-6 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                    "The private sector has a role to play in advancing Africa's development."
                  </div>
                  <div className="text-gray-600 border-l-4 border-[#0A2540] pl-4">
                    <div className="text-lg font-semibold">- Victor Edwards, CEO</div>
                    <div className="mt-1 text-gray-500">FOUNDER & CHAIRMAN, NF Holding</div>
                  </div>
                </div>
              </div>
              
              <div className="order-first lg:order-last">
                <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                  <img
                    src="/african-american-business-man-suit.jpg"
                    alt="Victor Edwards, Founder & Chairman"
                    className="object-cover w-full h-90 lg:h-100"
                  />
                </div>
              </div>
            </div>
            
            {/* SECTION 2: FOUNDATION */}
            <div className="grid items-center grid-cols-1 gap-12 mb-20 lg:grid-cols-2 lg:gap-16 lg:mb-24">
              <div>
                <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                  <img
                    src="/children foundation.jpg"
                    alt="Victor Edwards Foundation"
                    className="object-cover w-full h-90 lg:h-100"
                  />
                </div>
              </div>
              
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                  The Victor Edwards Foundation
                </h2>
                
                <p className="mb-8 text-lg leading-relaxed text-justify text-gray-700">
                  Empowering entrepreneurship as a catalyst for economic growth: Our philosophy of 'doing well and doing good' drives both our business and philanthropic initiatives, reflecting our belief that sustainable impact begins with opportunity.
                </p>
                
                <button className="bg-[#0A2540] hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                  MORE ON OUR PHILANTHROPY
                </button>
              </div>
            </div>
            
            {/* SECTION 3: VIDEO */}
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                  Investing in Africa's Future
                </h2>
                
                <p className="mb-8 text-lg leading-relaxed text-justify text-gray-700">
                  NF Holding is committed to improving lives and transforming Africa. We are focused on driving Africa's economic transformation by investing in critical sectors that matter most to the continent's development. Watch the video to discover how we are investing in Africa's future.
                </p>
                
                {!videoPlaying ? (
                  <button 
                    onClick={() => setVideoPlaying(true)}
                    className="bg-[#0A2540] hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    WATCH OUR TELEVISION COMMERCIAL
                  </button>
                ) : (
                  <button 
                    onClick={() => setVideoPlaying(false)}
                    className="px-8 py-3 font-semibold text-white transition-all duration-300 bg-gray-600 rounded-full hover:bg-gray-700"
                  >
                    Hide Video
                  </button>
                )}
              </div>
              
              <div>
                {videoPlaying ? (
                  <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                    <div className="relative pt-[56.25%]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-2xl"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
                        title="NF Holding Television Commercial"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setVideoPlaying(true)}
                    className="relative overflow-hidden shadow-2xl cursor-pointer rounded-2xl group"
                  >
                    <img
                      src="/video-thumbnail.jpg"
                      alt="Watch our television commercial"
                      className="object-cover w-full transition-transform duration-500 h-80 lg:h-96 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="text-white">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-12 h-12 mr-3 bg-white rounded-full">
                            <svg className="w-6 h-6 text-[#0A2540]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-semibold">Play Video</span>
                        </div>
                        <div className="text-sm opacity-90">2:45 min</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
        
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </section>
  );
};

export default LeadershipPhilanthropy;