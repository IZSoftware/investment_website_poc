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
    <div className="flex flex-col h-full p-6 transition-shadow duration-300 bg-white border border-gray-200 shadow-lg hover:shadow-xl">
      {/* Icon and Title */}
      <div className="flex items-start mb-4">
        <img src={icon} alt={title} className="flex-shrink-0 w-10 h-10 mr-4" />
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      </div>
      
      {/* Description */}
      <p className="mb-6 text-sm leading-relaxed text-gray-600">
        {description}
      </p>
      
      {/* Amount */}
      <div className="mb-1">
        <span className="text-5xl font-bold text-gray-900">
          {amount}
        </span>
      </div>
      
      {/* Amount Description */}
      <p className="mb-6 text-sm text-gray-500">
        {amountDescription}
      </p>
      
      {/* Horizontal Line */}
      <hr className="mb-4 border-t border-gray-200" />
      
      {/* Manage Button */}
      <div className="mt-auto">
        <button 
          onClick={() => handleManageClick(navigateTo)}
          className="bg-black hover:bg-black text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200 text-sm tracking-wide"
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
          <div className="pt-16 pb-12">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
              CLUSTER OVERVIEW
            </h1>
            <p className="text-2xl font-light text-gray-500">
              Portfolio management dashboard
            </p>
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 gap-8 pb-16 md:grid-cols-3">
            
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