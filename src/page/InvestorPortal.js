import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InvestorPortal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isDirectNavigation = !document.referrer;
    if (!isDirectNavigation) {
      navigate('/');
    }
  }, [navigate]);

  const handleManageClick = (path) => {
    navigate(`/investor-portal/${path}`);
  };

  const Card = ({ icon, title, description, amount, amountDescription, manageText = "Manage", navigateTo }) => (
    <div className="flex flex-col h-full p-4 transition-shadow duration-300 bg-white border border-gray-200 shadow-lg sm:p-5 lg:p-6 hover:shadow-xl">
      {/* Icon and Title */}
      <div className="flex items-start mb-3 lg:mb-4">
        <img src={icon} alt={title} className="flex-shrink-0 w-8 h-8 mr-3 sm:w-9 sm:h-9 lg:w-10 lg:h-10 lg:mr-4" />
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-xl">
          {title}
        </h2>
      </div>
      
      {/* Description */}
      <p className="mb-4 text-xs leading-relaxed text-gray-600 lg:mb-6 sm:text-sm lg:text-sm">
        {description}
      </p>
      
      {/* Amount */}
      <div className="mb-1">
        <span className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
          {amount}
        </span>
      </div>
      
      {/* Amount Description */}
      <p className="mb-4 text-xs text-gray-500 lg:mb-6 sm:text-sm lg:text-sm">
        {amountDescription}
      </p>
      
      {/* Horizontal Line */}
      <hr className="mb-3 border-t border-gray-200 lg:mb-4" />
      
      {/* Manage Button */}
      <div className="mt-auto">
        <button 
          onClick={() => handleManageClick(navigateTo)}
          className="bg-black hover:bg-black text-white font-medium py-2 sm:py-2.5 px-6 sm:px-8 rounded-md transition-colors duration-200 text-xs sm:text-sm tracking-wide"
        >
          {manageText}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          
          {/* Header Section */}
          <div className="px-4 pt-10 pb-8 sm:pt-12 lg:pt-16 sm:pb-10 lg:pb-12 sm:px-6 lg:px-0">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:mb-3 lg:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              CLUSTER OVERVIEW
            </h1>
            <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
              Portfolio management dashboard
            </p>
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 gap-4 px-4 pb-10 sm:gap-6 lg:gap-8 sm:pb-12 lg:pb-16 sm:px-6 lg:px-0 md:grid-cols-3">
            
            {/* Portfolio Investment Card */}
            <Card 
              icon="/briefcase.png"
              title="Portfolio investment"
              description="We invest in sectors that provide strong long-term returns and have the ability to transform Africa's economy"
              amount="$10.5"
              amountDescription="Total Portfolio Investments"
              manageText="Manage"
              navigateTo="portfolio-investment"
            />

            {/* Net Assets Card */}
            <Card 
              icon="/digital-asset-management.png"
              title="Net Assets"
              description="We take diversification into account in terms of risk factors"
              amount="$7.5"
              amountDescription="Total Net Assets"
              manageText="Manage"
              navigateTo="net-assets"
            />

            {/* Markets Card */}
            <Card 
              icon="/settings.png"
              title="Settings"
              description="Our investments are strategically located around the world, in markets targeted for their performance potential."
              amount="$10.5"
              amountDescription="Total Net Assets in each region"
              manageText="Manage"
              navigateTo="market"
            />

          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </div>
  );
};

export default InvestorPortal;