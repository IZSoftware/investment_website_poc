import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { sectorsData, getCompanyById } from '../data/data';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompanyDetailPage = () => {
  const { companyId } = useParams();

  let company = null;
  for (const sector of sectorsData) {
    const found = sector.partnerships?.find(p => p.id === companyId);
    if (found) { company = found; break; }
  }

  const detail = getCompanyById(companyId);

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="mb-3 lg:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2540]">Company Not Found</h1>
          <p className="mb-6 lg:mb-8 text-sm sm:text-base text-[#1C1F26]">The requested company page does not exist.</p>
          <Link to="/clusters" className="text-sm sm:text-base text-[#0A2540] hover:text-[#1C1F26] font-medium">Return to Portfolio</Link>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="mb-3 lg:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2540]">Company Data Not Found</h1>
          <p className="mb-6 lg:mb-8 text-sm sm:text-base text-[#1C1F26]">Detailed data for {company.name} is not available.</p>
          <Link to="/clusters" className="text-sm sm:text-base text-[#0A2540] hover:text-[#1C1F26] font-medium">Return to Portfolio</Link>
        </div>
      </div>
    );
  }

  const barChartData = {
    labels: detail.investmentChartData.map(d => d.year),
    datasets: [
      {
        label: 'KES',
        data: detail.investmentChartData.map(d => d.KES),
        backgroundColor: '#D4A574',
        borderColor: '#D4A574',
        borderWidth: 0,
        borderRadius: 0,
        barThickness: 12,
      },
      {
        label: 'USD',
        data: detail.investmentChartData.map(d => d.usd),
        backgroundColor: '#60A5FA',
        borderColor: '#60A5FA',
        borderWidth: 0,
        borderRadius: 0,
        barThickness: 12,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: '#ffffff',
          font: { size: 12, family: "'Inter', sans-serif" },
        },
      },
      tooltip: {
        backgroundColor: '#0A2540',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#1C1F26',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#e2e8f0', font: { size: 11, family: "'Inter', sans-serif" }, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: { color: '#e2e8f0', font: { size: 11, family: "'Inter', sans-serif" }, callback: v => v.toLocaleString() },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  const Sep = () => <div className="text-[#1C1F26] px-1">|</div>;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Back bar ── */}
      <div className="py-3 lg:py-4 border-b border-[#0A2540]/10">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Link to="/clusters" className="inline-flex items-center text-xs sm:text-sm text-[#0A2540] hover:text-[#1C1F26]">
                <svg className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Portfolio
              </Link>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </div>

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* ── Company header ── */}
            <div className="mb-6 lg:mb-8">
              <div className="mb-2 lg:mb-3 text-xs sm:text-sm font-semibold tracking-wider text-[#1C1F26] uppercase">
                EQUITY
              </div>
              <h1 className="mb-3 lg:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2540]">{detail.name}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-[#1C1F26]">
                <div className="font-semibold text-[#0A2540]">
                  {detail.KESValue} <span className="text-xs sm:text-sm text-[#1C1F26]">KES</span>
                </div>
                <Sep />
                <div className="font-semibold text-[#0A2540]">
                  {detail.usdValue} <span className="text-xs sm:text-sm text-[#1C1F26]">USD</span>
                </div>
              </div>
            </div>

            {/* ── Company meta ── */}
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 pb-6 lg:pb-8 mb-6 lg:mb-8 text-sm sm:text-base border-b border-[#0A2540]/10">
              {[
                ['Year',           detail.year],
                ['Ownership',      detail.ownership],
                ['Sector',         detail.sector],
                ['Country',        detail.country],
                ['Incorporated in', detail.incorporated],
              ].map(([label, value], i, arr) => (
                <React.Fragment key={label}>
                  <div className="text-xs sm:text-sm text-[#1C1F26]">
                    <span className="font-medium">{label}:</span>{' '}
                    <span className="font-semibold text-[#0A2540]">{value}</span>
                  </div>
                  {i < arr.length - 1 && <Sep />}
                </React.Fragment>
              ))}
              {detail.website && (
                <>
                  <Sep />
                  <div className="text-xs sm:text-sm text-[#1C1F26]">
                    <span className="font-medium">Website:</span>{' '}
                    <a
                      href={`https://${detail.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#0A2540] hover:text-[#1C1F26] break-all"
                    >
                      {detail.website}
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* ── Charts + Voting ── */}
            <div className="grid grid-cols-1 gap-6 mb-8 lg:gap-8 lg:mb-12 lg:grid-cols-12">

              {/* Historical investments */}
              <div className="lg:col-span-7">
                <div className="p-4 sm:p-5 lg:p-6 rounded-lg bg-[#0A2540]">
                  <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Historical investments</h2>
                  <div className="mb-4 text-xs lg:mb-6 sm:text-sm text-white/60">
                    Values are in million KES as at 30.06.2025
                  </div>
                  <div className="mb-4 lg:mb-6" style={{ height: '300px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
              </div>

              {/* Voting */}
              <div className="lg:col-span-5">
                <div className="p-4 sm:p-5 lg:p-6 rounded-lg bg-[#0A2540]">
                  <h2 className="mb-3 text-xl font-bold text-white lg:mb-4 sm:text-2xl">Our voting</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs lg:gap-3 lg:mb-6 sm:text-sm text-white/60">
                    <div>Voting share: <span className="font-semibold text-white">{detail.votingShare}</span></div>
                    <div>|</div>
                    <div>Ticker: <span className="font-semibold text-white">{detail.ticker}</span></div>
                  </div>
                  <div className="text-xs leading-relaxed text-justify text-white sm:text-sm">
                    When we own the right to vote at the company's shareholder meetings, this gives us a say in
                    director elections and important decisions that affect the fund's investments. We are
                    transparent and predictable on how we vote and why we vote the way we do. We publish our
                    voting intentions five days before the meeting. When we vote against the board's
                    recommendation, we always give an explanation.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default CompanyDetailPage;