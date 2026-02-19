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
                  Depositors and Total Portfolio team
                </h1>
              </div>
            </div>
            
            {/* Objective Section with Image */}
            <div className="py-16 border-b border-gray-200">
              {/* Hero Section with Image */}
              <div className="mb-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                  {/* Left: Image - Increased Height */}
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
                      <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                        We seek to contribute to the financial soundness of our depositors' plans and ensure the prosperity of the funds they entrust to us.
                      </p>
                      <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                        To that end, we offer them top-tier advisory services and work to continuously improve the risk-return profile of La Caisse portfolios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activities Section */}
            <div className="py-16 border-b border-gray-200">
              {/* Activities Title */}
              <div className="mb-12">
                <h3 className="text-4xl font-bold text-gray-900 md:text-5xl">
                  Our activities
                </h3>
              </div>
              
              {/* Activities Grid with Drop Shadow */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Activity 1 */}
                <div className="p-6 transition-all duration-300 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">
                      DEPOSITOR ADVISORY SERVICES
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    Help our clients establish their investment policies by thoroughly understanding their needs and leveraging our long investment track record.
                  </p>
                </div>
                
                {/* Activity 2 */}
                <div className="p-6 transition-all duration-300 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">
                      PORTFOLIO CONSTRUCTION
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    Optimize the strategic allocation of long-term assets to improve the risk-return profile of the total portfolio, while conducting integrated monitoring of the portfolio.
                  </p>
                </div>
                
                {/* Activity 3 */}
                <div className="p-6 transition-all duration-300 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">
                      CURRENCY MANAGEMENT
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    Manage NF Holding s exposure to foreign currencies to ensure optimal positioning and provide the total portfolio with a diversification effect.
                  </p>
                </div>
                
                {/* Activity 4 */}
                <div className="p-6 transition-all duration-300 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">
                      ECONOMIC AND FINANCIAL ANALYSIS
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    Analyze global macroeconomic conditions and financial market developments to support investment activities.
                  </p>
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