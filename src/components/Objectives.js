import React from 'react';

const Objectives = () => {
  const heroImage = "/objective meeting.jpg";

  return (
    <section className="bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Main Title Section */}
            <div className="py-12 border-b border-gray-200">
              <div className="text-left">
                <h1 className="text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
                  Investment Approach
                </h1>
              </div>
            </div>
            
            {/* Objective Section with Image */}
            <div className="py-16 border-b border-gray-200">
              <div className="mb-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                  {/* Left: Image */}
                  <div className="relative w-full overflow-hidden shadow-lg h-96 lg:h-[500px] rounded-2xl">
                    <img 
                      src={heroImage} 
                      alt="La Caisse Portfolio Team"
                      className="absolute inset-0 object-cover w-full h-full"
                    />
                  </div>
                  
                  {/* Right: Content */}
                  <div className="flex flex-col justify-center">
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
                        Our objective
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-lg leading-relaxed text-justify text-gray-700 md:text-xl">
                        We seek to contribute to the financial soundness of our depositors' plans and ensure the prosperity of the funds they entrust to us.
                      </p>
                      <p className="text-lg leading-relaxed text-justify text-gray-700 md:text-xl">
                        To that end, we offer them top-tier advisory services and work to continuously improve the risk-return profile of La Caisse portfolios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </section>
  );
};

export default Objectives;