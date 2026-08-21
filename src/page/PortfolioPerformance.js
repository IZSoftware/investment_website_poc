import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { portfolioKPI } from '../data/data';
import {
  getSiteInfoAbout,
  getSiteInfoCluster,
  getSiteInfoPortfolio,
  getSiteInfoPortfolioHistory,
} from '../api/services';
import { formatDisplayDate } from '../utils/valuation';

const PIE_PALETTE = ['#012060', '#2caffe', '#544fc5', '#00d4ff', '#f45b5b', '#91e8e1', '#f7a35c', '#8085e9'];

/** Years of KPI history to chart. The API caps and orders the series; this is just the window. */
const HISTORY_YEARS = 10;

const UNIT_TO_MILLIONS = { THOUSANDS: 0.001, MILLIONS: 1, BILLIONS: 1000 };
const normalizeToMillions = (valuation) => {
  if (!valuation) return 0;
  const factor = UNIT_TO_MILLIONS[valuation.unit] ?? 1;
  return (valuation.amount ?? 0) * factor;
};
const formatMillionsAsUsd = (totalMillions) => {
  if (totalMillions >= 1000) return `USD ${(totalMillions / 1000).toFixed(1)} B`;
  return `USD ${totalMillions.toFixed(1)} M`;
};

const PortfolioPage = () => {
  const [activeCurrency, setActiveCurrency] = useState('kes');
  const [activeKPI, setActiveKPI] = useState('portfolio');

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [historyPoints, setHistoryPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPortfolio = async () => {
      try {
        const res = await getSiteInfoAbout();
        if (isMounted && Array.isArray(res?.data?.assets)) {
          setPortfolioItems(res.data.assets.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      }
    };

    const fetchCountries = async () => {
      try {
        const res = await getSiteInfoCluster();
        if (isMounted && Array.isArray(res?.data?.countries)) {
          const countriesWithName = res.data.countries.map((c, index) => ({
            ...c,
            countryName: c.name || `Country ${index + 1}`,
          }));
          setCountries(countriesWithName);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    };

    const fetchPerformance = async () => {
      try {
        const res = await getSiteInfoPortfolio();
        console.log('Performance API Response:', res);
        if (isMounted && res?.data) {
          setPerformanceData(res.data);
        }
      } catch (error) {
        console.error('Failed to load performance data:', error);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await getSiteInfoPortfolioHistory({ limit: HISTORY_YEARS });
        if (isMounted && Array.isArray(res?.data?.points)) {
          setHistoryPoints(res.data.points);
        }
      } catch (error) {
        console.error('Failed to load performance history:', error);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchPortfolio(),
        fetchCountries(),
        fetchPerformance(),
        fetchHistory(),
      ]);
      setLoading(false);
    };

    fetchAll();
    return () => { isMounted = false; };
  }, []);

  const { investorRelations } = portfolioKPI;

  const getKeyFacts = () => {
    // If no performance data, return fallback values
    if (!performanceData) {
      return {
        kes: {
          asAtDate: 'Current',
          totalPortfolio: 'N/A',
          totalPortfolioUnit: '',
          revenue: 'N/A',
          revenueUnit: '',
          debt: 'N/A',
          debtUnit: '',
          gearing: 'N/A',
          roa: 'N/A',
        },
        usd: {
          asAtDate: 'Current',
          totalPortfolio: 'N/A',
          totalPortfolioUnit: '',
          revenue: 'N/A',
          revenueUnit: '',
          debt: 'N/A',
          debtUnit: '',
          gearing: 'N/A',
          roa: 'N/A',
        }
      };
    }

    const p = performanceData;
    const usdKesRate = p.usdKesRate?.kesValue || 129.5;
    
    const portfolioInUSD = p.groupConsolidatedPortfolio ?? 0;
    const revenueInUSD = p.groupConsolidatedRevenue ?? 0;
    const debtInUSD = p.groupConsolidatedDebt ?? 0;
    
    const portfolioInKES = portfolioInUSD * usdKesRate;
    const revenueInKES = revenueInUSD * usdKesRate;
    const debtInKES = debtInUSD * usdKesRate;
    
    const gearingValue = p.groupConsolidatedGearing;
    const gearingDisplay = gearingValue !== undefined && gearingValue !== null 
      ? gearingValue.toFixed(1) + '%' 
      : 'N/A';
      
    const roaValue = p.groupConsolidatedReturnOnAssets;
    const roaDisplay = roaValue !== undefined && roaValue !== null 
      ? roaValue.toFixed(1) + '%' 
      : 'N/A';

    const asAtDate = p.month && p.year ? `${p.month}/${p.year}` : 'Current';

    return {
      kes: {
        asAtDate: asAtDate,
        totalPortfolio: portfolioInKES >= 1000000000 ? (portfolioInKES / 1000000000).toFixed(1) : (portfolioInKES / 1000000).toFixed(1),
        totalPortfolioUnit: portfolioInKES >= 1000000000 ? 'B' : 'M',
        revenue: revenueInKES >= 1000000000 ? (revenueInKES / 1000000000).toFixed(1) : (revenueInKES / 1000000).toFixed(1),
        revenueUnit: revenueInKES >= 1000000000 ? 'B' : 'M',
        debt: debtInKES >= 1000000000 ? (debtInKES / 1000000000).toFixed(1) : (debtInKES / 1000000).toFixed(1),
        debtUnit: debtInKES >= 1000000000 ? 'B' : 'M',
        gearing: gearingDisplay,
        roa: roaDisplay,
      },
      usd: {
        asAtDate: asAtDate,
        totalPortfolio: portfolioInUSD >= 1000000000 ? (portfolioInUSD / 1000000000).toFixed(1) : (portfolioInUSD / 1000000).toFixed(1),
        totalPortfolioUnit: portfolioInUSD >= 1000000000 ? 'B' : 'M',
        revenue: revenueInUSD >= 1000000000 ? (revenueInUSD / 1000000000).toFixed(1) : (revenueInUSD / 1000000).toFixed(1),
        revenueUnit: revenueInUSD >= 1000000000 ? 'B' : 'M',
        debt: debtInUSD >= 1000000000 ? (debtInUSD / 1000000000).toFixed(1) : (debtInUSD / 1000000).toFixed(1),
        debtUnit: debtInUSD >= 1000000000 ? 'B' : 'M',
        gearing: gearingDisplay,
        roa: roaDisplay,
      }
    };
  };

  const kf = getKeyFacts()[activeCurrency];

  const pieChartSectors = portfolioItems.map((item, idx) => ({
    name: item.name,
    value: item.percent || item.value?.allocationPercent || 0,
    color: PIE_PALETTE[idx % PIE_PALETTE.length],
  }));

  const totalPortfolioMillions = portfolioItems.reduce(
    (sum, item) => sum + normalizeToMillions(item.value || item.valuation),
    0
  );

  const latestAsAtDate = portfolioItems.reduce((latest, item) => {
    const d = item.value?.asAtDate || item.valuation?.asAtDate;
    if (!d) return latest;
    return !latest || d > latest ? d : latest;
  }, null);

  // Stored figures are USD (§6.4/§6.5). A KES series converts each point at the rate recorded
  // for its own period, which is why the endpoint sends one rate per point, not one per series.
  const toMillions = (amount, kesRate) => {
    if (amount === null || amount === undefined) return null;
    if (activeCurrency === 'kes') {
      // No rate on record for that period means there is no honest KES figure for it. Dropping
      // the point beats plotting the USD number under a KES axis.
      if (!kesRate) return null;
      return Number(((amount * kesRate) / 1_000_000).toFixed(2));
    }
    return Number((amount / 1_000_000).toFixed(2));
  };

  const moneySeries = (field) =>
    historyPoints
      .map((p) => ({ year: String(p.year), value: toMillions(p[field], p.usdKesRate?.kesValue) }))
      .filter((point) => point.value !== null);

  const gearingSeries = historyPoints
    .filter((p) => p.groupConsolidatedGearing !== null && p.groupConsolidatedGearing !== undefined)
    .map((p) => ({ year: String(p.year), gearing: Number(p.groupConsolidatedGearing) }));

  const ChartPlaceholder = ({ children }) => (
    <div className="flex items-center justify-center h-[300px] px-4 text-sm text-center text-gray-500">
      {children}
    </div>
  );

  const currencyUnit = activeCurrency === 'kes' ? 'KES M' : 'USD M';

  const renderChart = () => {
    if (!historyPoints.length) {
      return (
        <ChartPlaceholder>
          No performance history has been published yet.
        </ChartPlaceholder>
      );
    }

    switch (activeKPI) {
      case 'portfolio': {
        const data = moneySeries('groupConsolidatedPortfolio');
        if (!data.length) {
          return <ChartPlaceholder>No portfolio figures recorded for these periods.</ChartPlaceholder>;
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#012060" name={`Portfolio Value (${currencyUnit})`} />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'revenue': {
        const data = moneySeries('groupConsolidatedRevenue');
        if (!data.length) {
          return <ChartPlaceholder>No revenue figures recorded for these periods.</ChartPlaceholder>;
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2caffe" name={`Revenue (${currencyUnit})`} />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'gearing': {
        if (!gearingSeries.length) {
          return <ChartPlaceholder>No gearing figures recorded for these periods.</ChartPlaceholder>;
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={gearingSeries} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="gearing"
                stroke="#544fc5"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Gearing %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">
        Loading…
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center w-full h-[50vh] sm:h-[60vh] lg:min-h-screen">
        <div className="absolute inset-0 z-0">
          <img
            src="happy-business-colleagues-watching-content-tablet.jpg"
            alt="Portfolio background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="absolute inset-0 grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="flex items-center col-span-12 lg:col-span-10">
            <div className="px-4 py-8 sm:px-6 lg:px-0 lg:py-20 xl:py-32">
              <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
                Value Proportion
              </h1>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </section>

      {/* Content */}
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 px-4 sm:px-6 lg:px-0 lg:col-span-10">

          {/* Key Facts */}
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col items-start justify-between mb-6 sm:mb-8 md:flex-row md:items-center">
              <h3 className="text-2xl font-bold text-black sm:text-3xl md:text-4xl">
                Key <strong className="text-gray-600">Facts</strong>
              </h3>
              <div className="mt-3 sm:mt-4 md:mt-0">
                <ul className="flex p-1 bg-white rounded-lg shadow-sm">
                  {['kes', 'usd'].map(c => (
                    <li
                      key={c}
                      className={`cursor-pointer px-4 sm:px-6 py-1.5 sm:py-2 rounded-md transition-all uppercase text-xs sm:text-sm font-medium ${
                        activeCurrency === c ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                      }`}
                      onClick={() => setActiveCurrency(c)}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-500 sm:mb-6 sm:text-base">As at {kf?.asAtDate || 'Current'}</div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">

              {/* Portfolio */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Portfolio</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  <span className="text-sm text-gray-500 sm:text-base">{activeCurrency.toUpperCase()} </span>
                  {kf?.totalPortfolio || 'N/A'}
                  <span className="text-sm font-bold sm:text-base lg:text-lg"> {kf?.totalPortfolioUnit || ''}</span>
                </strong>
              </div>

              {/* Revenue */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Revenue</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  <span className="text-sm text-gray-500 sm:text-base">{activeCurrency.toUpperCase()} </span>
                  {kf?.revenue || 'N/A'}
                  <span className="text-sm font-bold sm:text-base lg:text-lg"> {kf?.revenueUnit || ''}</span>
                </strong>
              </div>

              {/* Debt */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Debt</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  <span className="text-sm text-gray-500 sm:text-base">{activeCurrency.toUpperCase()} </span>
                  {kf?.debt || 'N/A'}
                  <span className="text-sm font-bold sm:text-base lg:text-lg"> {kf?.debtUnit || ''}</span>
                </strong>
              </div>

              {/* Gearing */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Gearing</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  {kf?.gearing || 'N/A'}
                </strong>
              </div>

              {/* ROA */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Return on Assets (ROA)</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  {kf?.roa || 'N/A'}
                </strong>
              </div>

              {/* Operating Countries */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group <strong className="text-black">Operating Countries</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  {performanceData?.groupOperatingCountries || countries.length || 0}
                </strong>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {countries.map((c) => c.countryName).join(' · ')}
                </span>
              </div>

              {/* Investor Relations */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg md:col-span-2 lg:col-span-3">
                <strong className="block mb-2 text-base sm:mb-3 sm:text-lg">
                  <span className="text-gray-600">Investor</span> Relations Lead
                </strong>
                <span className="block text-sm font-medium text-black sm:text-base">{investorRelations?.name || 'N/A'}</span>
                <span className="block mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">
                  Tel:{' '}
                  <a href={`tel:${investorRelations?.tel}`} className="text-black hover:underline">
                    {investorRelations?.tel || 'N/A'}
                  </a>
                </span>
                <span className="block text-xs text-gray-600 sm:text-sm">
                  <a href={`mailto:${investorRelations?.email}`} className="text-black break-all hover:underline">
                    {investorRelations?.email || 'N/A'}
                  </a>
                </span>
              </div>

            </div>
          </section>

          {/* Key Performance Indicators */}
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">

              {/* Left — Charts */}
              <div className="lg:w-2/3">
                <div className="flex justify-end mb-3 sm:mb-4">
                  <ul className="flex p-1 bg-white rounded-lg shadow-sm">
                    {['kes', 'usd'].map(c => (
                      <li
                        key={c}
                        className={`cursor-pointer px-4 sm:px-6 py-1.5 sm:py-2 rounded-md transition-all uppercase text-xs sm:text-sm font-medium ${
                          activeCurrency === c ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                        }`}
                        onClick={() => setActiveCurrency(c)}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 sm:mb-6">
                  <h3 className="text-2xl font-bold text-black sm:text-3xl md:text-4xl">
                    Key Performance <strong className="text-gray-600">Indicators</strong>
                  </h3>
                </div>

                {/* Chart tabs */}
                <div className="mb-4 sm:mb-6">
                  <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { key: 'portfolio', label: 'PORTFOLIO' },
                      { key: 'revenue',   label: 'REVENUE' },
                      { key: 'gearing',   label: 'GEARING' },
                    ].map(({ key, label }) => (
                      <li
                        key={key}
                        className={`cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm font-medium ${
                          activeKPI === key
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setActiveKPI(key)}
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm sm:p-6">
                  {renderChart()}
                </div>
              </div>

              {/* Right — Pie Chart */}
              <div className="lg:w-1/3">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-xl font-bold text-black sm:text-2xl">
                    Investment <strong className="text-gray-600">Portfolio</strong>
                  </h3>
                </div>
                <div className="mb-3 sm:mb-4">
                  <p className="mb-1 text-xs text-gray-500 sm:text-sm">
                    As at {formatDisplayDate(latestAsAtDate)}
                  </p>
                  <p className="text-xl font-bold text-black sm:text-2xl">
                    {formatMillionsAsUsd(totalPortfolioMillions)}
                  </p>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartSectors}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {pieChartSectors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </section>

        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </>
  );
};

export default PortfolioPage;