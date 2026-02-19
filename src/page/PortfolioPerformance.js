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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getChartData('revenue', activeCurrency)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getChartData('netShare')}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={getChartData('gearing', activeCurrency)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
      <section className="relative flex items-center w-full min-h-screen">
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
            <div className="py-12 lg:py-20 xl:py-32">
              <h1 className="text-5xl font-bold text-white md:text-7xl lg:text-8xl">
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
        <div className="col-span-12 px-4 lg:col-span-10 lg:px-0">

          {/* ── Key Facts ── */}
          <section className="py-16">
            <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
              <h3 className="text-3xl font-bold text-black md:text-4xl">
                Key <strong className="text-gray-600">Facts</strong>
              </h3>
              <div className="mt-4 md:mt-0">
                <ul className="flex p-1 bg-white rounded-lg shadow-sm">
                  {['kes', 'usd'].map(c => (
                    <li
                      key={c}
                      className={`cursor-pointer px-6 py-2 rounded-md transition-all uppercase text-sm font-medium ${
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

            <div className="mb-6 text-gray-500">As at {kf.asAtDate}</div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

              {/* AUM */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg">
                <span className="block text-gray-600">
                  Group Consolidated <strong className="text-black">Assets Under Management (AUM)</strong>
                </span>
                <strong className="block my-2 text-3xl font-bold text-black">
                  <span className="text-gray-500">{activeCurrency.toUpperCase()} </span>
                  {kf.aum.toLocaleString()}
                  <span className="text-lg font-bold"> {kf.aumUnit}</span>
                </strong>
              </div>

              {/* Revenue */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg">
                <span className="block text-gray-600">
                  Group Consolidated <strong className="text-black">Revenue</strong>
                </span>
                <strong className="block my-2 text-3xl font-bold text-black">
                  <span className="text-gray-500">{activeCurrency.toUpperCase()} </span>
                  {kf.revenue.toLocaleString()}
                  <span className="text-lg font-bold"> {kf.revenueUnit}</span>
                </strong>
              </div>

              {/* Debt */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg">
                <span className="block text-gray-600">
                  Group Consolidated <strong className="text-black">Debt</strong>
                </span>
                <strong className="block my-2 text-3xl font-bold text-black">
                  <span className="text-gray-500">{activeCurrency.toUpperCase()} </span>
                  {kf.debt.toLocaleString()}
                  <span className="text-lg font-bold"> {kf.debtUnit}</span>
                </strong>
              </div>

              {/* Gearing */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg">
                <span className="block text-gray-600">
                  Group Consolidated <strong className="text-black">Gearing</strong>
                </span>
                <strong className="block my-2 text-3xl font-bold text-black">
                  {kf.gearing}
                </strong>
              </div>

              {/* ROA */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg">
                <span className="block text-gray-600">
                  Group Consolidated <strong className="text-black">Return on Assets (ROA)</strong>
                </span>
                <strong className="block my-2 text-3xl font-bold text-black">
                  {kf.roa}
                </strong>
              </div>

              {/* Operating Countries */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg">
                <span className="block text-gray-600">
                  Group <strong className="text-black">Operating Countries</strong>
                </span>
                <strong className="block my-2 text-3xl font-bold text-black">
                  {kf.operatingCountries}
                </strong>
                <span className="text-sm text-gray-500">Kenya · Ghana · Ethiopia · Rwanda</span>
              </div>

              {/* Investor Relations — spans full row */}
              <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg md:col-span-2 lg:col-span-3">
                <strong className="block mb-3 text-lg">
                  <span className="text-gray-600">Investor</span> Relations Lead
                </strong>
                <span className="block font-medium text-black">{investorRelations.name}</span>
                <span className="block mt-2 text-gray-600">
                  Tel:{' '}
                  <a href={`tel:${investorRelations.tel}`} className="text-black hover:underline">
                    {investorRelations.tel}
                  </a>
                </span>
                <span className="block text-gray-600">
                  <a href={`mailto:${investorRelations.email}`} className="text-black break-all hover:underline">
                    {investorRelations.email}
                  </a>
                </span>
              </div>

            </div>
          </section>

          {/* ── Key Performance Indicators ── */}
          <section className="py-16">
            <div className="flex flex-col gap-8 lg:flex-row">

              {/* Left — Charts */}
              <div className="lg:w-2/3">
                <div className="flex justify-end mb-4">
                  <ul className="flex p-1 bg-white rounded-lg shadow-sm">
                    {['kes', 'usd'].map(c => (
                      <li
                        key={c}
                        className={`cursor-pointer px-6 py-2 rounded-md transition-all uppercase text-sm font-medium ${
                          activeCurrency === c ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                        }`}
                        onClick={() => setActiveCurrency(c)}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-black md:text-4xl">
                    Key Performance <strong className="text-gray-600">Indicators</strong>
                  </h3>
                </div>

                {/* ── Chart tabs: REVENUE | NET SHARE | GEARING ── */}
                <div className="mb-6">
                  <ul className="flex flex-wrap gap-2">
                    {[
                      { key: 'rev',      label: 'REVENUE'   },
                      { key: 'netShare', label: 'NET SHARE' },
                      { key: 'gearing',  label: 'GEARING'   },
                    ].map(({ key, label }) => (
                      <li
                        key={key}
                        className={`cursor-pointer px-4 py-2 rounded-md transition-all text-sm font-medium ${
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

                <div className="p-6 bg-white rounded-lg shadow-sm">
                  {renderChart()}
                </div>
              </div>

              {/* Right — Pie Chart */}
              <div className="lg:w-1/3">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-black">
                    Investment <strong className="text-gray-600">Portfolio</strong>
                  </h3>
                </div>
                <div className="mb-4">
                  <p className="mb-1 text-gray-500">As at {portfolioTotals.asAtDate}</p>
                  <p className="text-2xl font-bold text-black">
                    {activeCurrency === 'kes' ? portfolioTotals.kes : portfolioTotals.usd}
                  </p>
                </div>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartSectors}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={140}
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