import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { portfolioKPI, getChartData, getPieChartSectors } from '../data/data';

const PortfolioPage = () => {
  const [activeCurrency, setActiveCurrency] = useState('kes');
  const [activeKPI, setActiveKPI] = useState('rev');

  const { keyFacts, investorRelations, portfolioTotals } = portfolioKPI;
  const kf = keyFacts[activeCurrency];
  const pieChartSectors = getPieChartSectors();

  const renderChart = () => {
    switch (activeKPI) {
      case 'rev':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={getChartData('revenue', activeCurrency)}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                fill="#012060"
                name={activeCurrency === 'kes' ? 'Revenue (KES M)' : 'Revenue (USD M)'}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'netShare':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={getChartData('netShare')}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2caffe" name="Net Share per Share (KES)" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'gearing':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={getChartData('gearing', activeCurrency)}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" unit="%" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="netDebt"
                fill="#2caffe"
                name={activeCurrency === 'kes' ? 'Net Debt (KES M)' : 'Net Debt (USD M)'}
              />
              <Line
                yAxisId="right"
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

      default:
        return null;
    }
  };

  return (
    <>
      {/* ── Hero ── */}
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

      {/* ── Content ── */}
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 px-4 sm:px-6 lg:px-0 lg:col-span-10">

          {/* ── Key Facts ── */}
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

            <div className="mb-4 text-sm text-gray-500 sm:mb-6 sm:text-base">As at {kf.asAtDate}</div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">

              {/* AUM */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Assets Under Management (AUM)</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  <span className="text-sm text-gray-500 sm:text-base">{activeCurrency.toUpperCase()} </span>
                  {kf.aum.toLocaleString()}
                  <span className="text-sm font-bold sm:text-base lg:text-lg"> {kf.aumUnit}</span>
                </strong>
              </div>

              {/* Revenue */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Revenue</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  <span className="text-sm text-gray-500 sm:text-base">{activeCurrency.toUpperCase()} </span>
                  {kf.revenue.toLocaleString()}
                  <span className="text-sm font-bold sm:text-base lg:text-lg"> {kf.revenueUnit}</span>
                </strong>
              </div>

              {/* Debt */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Debt</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  <span className="text-sm text-gray-500 sm:text-base">{activeCurrency.toUpperCase()} </span>
                  {kf.debt.toLocaleString()}
                  <span className="text-sm font-bold sm:text-base lg:text-lg"> {kf.debtUnit}</span>
                </strong>
              </div>

              {/* Gearing */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Gearing</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  {kf.gearing}
                </strong>
              </div>

              {/* ROA */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group Consolidated <strong className="text-black">Return on Assets (ROA)</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  {kf.roa}
                </strong>
              </div>

              {/* Operating Countries */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg">
                <span className="block text-xs text-gray-600 sm:text-sm">
                  Group <strong className="text-black">Operating Countries</strong>
                </span>
                <strong className="block my-1 text-xl font-bold text-black sm:my-2 sm:text-2xl lg:text-3xl">
                  {kf.operatingCountries}
                </strong>
                <span className="text-xs text-gray-500 sm:text-sm">Kenya · Ghana · Ethiopia · Rwanda</span>
              </div>

              {/* Investor Relations — spans full row */}
              <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 hover:shadow-lg md:col-span-2 lg:col-span-3">
                <strong className="block mb-2 text-base sm:mb-3 sm:text-lg">
                  <span className="text-gray-600">Investor</span> Relations Lead
                </strong>
                <span className="block text-sm font-medium text-black sm:text-base">{investorRelations.name}</span>
                <span className="block mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">
                  Tel:{' '}
                  <a href={`tel:${investorRelations.tel}`} className="text-black hover:underline">
                    {investorRelations.tel}
                  </a>
                </span>
                <span className="block text-xs text-gray-600 sm:text-sm">
                  <a href={`mailto:${investorRelations.email}`} className="text-black break-all hover:underline">
                    {investorRelations.email}
                  </a>
                </span>
              </div>

            </div>
          </section>

          {/* ── Key Performance Indicators ── */}
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

                {/* ── Chart tabs: REVENUE | NET SHARE | GEARING ── */}
                <div className="mb-4 sm:mb-6">
                  <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { key: 'rev',      label: 'REVENUE'   },
                      { key: 'netShare', label: 'NET SHARE' },
                      { key: 'gearing',  label: 'GEARING'   },
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
                  <p className="mb-1 text-xs text-gray-500 sm:text-sm">As at {portfolioTotals.asAtDate}</p>
                  <p className="text-xl font-bold text-black sm:text-2xl">
                    {activeCurrency === 'kes' ? portfolioTotals.kes : portfolioTotals.usd}
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