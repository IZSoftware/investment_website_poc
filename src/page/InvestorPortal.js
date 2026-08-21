import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvestorDashboardCluster } from '../api/services';

const CARD_ICONS = {
  portfolioInvestment: '/briefcase.png',
  netAssets: '/digital-asset-management.png',
  settings: '/settings.png',
};

// Presentational copy only — title/subtitle/value all come from the API.
const CARD_DESCRIPTIONS = {
  portfolioInvestment:
    "We invest in Clusters that provide strong long-term returns and have the ability to transform Africa's economy",
  netAssets: 'We take diversification into account in terms of risk factors',
  settings:
    'Our investments are strategically located around the world, in markets targeted for their performance potential.',
};

const CARD_ROUTES = {
  portfolioInvestment: 'portfolio-investment',
  netAssets: 'net-assets',
  settings: 'market',
};

const InvestorPortal = () => {
  const navigate = useNavigate();
  const [clusterData, setClusterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCluster = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getInvestorDashboardCluster();
        if (response.success) {
          setClusterData(response.data);
        } else {
          setError(response.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        setError(err.response?.data?.message || err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchCluster();
  }, []);

  const handleManageClick = (path) => {
    navigate(`/investor-portal/${path}`);
  };

  const Card = ({ cardKey, cardData }) => (
    <div className="flex flex-col h-full p-4 transition-shadow duration-300 bg-white border border-gray-200 shadow-lg sm:p-5 lg:p-6 hover:shadow-xl">
      <div className="flex items-start mb-3 lg:mb-4">
        <img
          src={CARD_ICONS[cardKey]}
          alt={cardData?.title || cardKey}
          className="flex-shrink-0 w-8 h-8 mr-3 sm:w-9 sm:h-9 lg:w-10 lg:h-10 lg:mr-4"
        />
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-xl">
          {cardData?.title}
        </h2>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-gray-600 lg:mb-6 sm:text-sm lg:text-sm">
        {CARD_DESCRIPTIONS[cardKey]}
      </p>

      <div className="mb-1">
        <span className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
          {cardData?.value}
        </span>
      </div>

      <p className="mb-4 text-xs text-gray-500 lg:mb-6 sm:text-sm lg:text-sm">
        {cardData?.subtitle}
      </p>

      <hr className="mb-3 border-t border-gray-200 lg:mb-4" />

      <div className="mt-auto">
        <button
          onClick={() => handleManageClick(CARD_ROUTES[cardKey])}
          className="bg-black hover:bg-black text-white font-medium py-2 sm:py-2.5 px-6 sm:px-8 rounded-md transition-colors duration-200 text-xs sm:text-sm tracking-wide"
        >
          Manage
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full py-24 text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full py-24 text-red-500">
        {error}
      </div>
    );
  }

  if (!clusterData) return null;

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:pt-12 lg:pt-16 sm:pb-10 lg:pb-12 sm:px-6 lg:px-0">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:mb-3 lg:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              CLUSTER OVERVIEW
            </h1>
            <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
              Dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 pb-10 sm:gap-6 lg:gap-8 sm:pb-12 lg:pb-16 sm:px-6 lg:px-0 md:grid-cols-3">
            <Card cardKey="netAssets" cardData={clusterData?.netAssets} />
            <Card cardKey="portfolioInvestment" cardData={clusterData?.portfolioInvestment} />
            <Card cardKey="settings" cardData={clusterData?.settings} />
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </div>
  );
};

export default InvestorPortal;
