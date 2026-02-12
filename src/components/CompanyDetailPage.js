import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { sectorsData } from '../data/sectorsData';
import { companyDetails } from '../data/companyDetails';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CompanyDetailPage = () => {
  const { companyId } = useParams();
  let company = null;

  for (const sector of sectorsData) {
    if (sector.partnerships) {
      const foundCompany = sector.partnerships.find(c => c.id === companyId);
      if (foundCompany) {
        company = foundCompany;
        break;
      }
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-[#0A2540]">Company Not Found</h1>
          <p className="mb-8 text-[#1C1F26]">The requested company page does not exist.</p>
          <Link to="/clusters" className="text-[#0A2540] hover:text-[#1C1F26] font-medium">
            Return to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const companyDetailsData = companyDetails[companyId];

  if (!companyDetailsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-[#0A2540]">Company Data Not Found</h1>
          <p className="mb-8 text-[#1C1F26]">Detailed data for {company.name} is not available.</p>
          <Link to="/clusters" className="text-[#0A2540] hover:text-[#1C1F26] font-medium">
            Return to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const barChartData = {
    labels: companyDetailsData.investmentChartData.map(item => item.year),
    datasets: [
      {
        label: 'KES',
        data: companyDetailsData.investmentChartData.map(item => item.KES),
        backgroundColor: '#D4A574',
        borderColor: '#D4A574',
        borderWidth: 0,
        borderRadius: 0,
        barThickness: 12,
      },
      {
        label: 'USD',
        data: companyDetailsData.investmentChartData.map(item => item.usd),
        backgroundColor: '#60A5FA',
        borderColor: '#60A5FA',
        borderWidth: 0,
        borderRadius: 0,
        barThickness: 12,
      }
    ]
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
          font: {
            size: 14,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: '#0A2540',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#1C1F26',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          maxRotation: 0,
          minRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
          drawBorder: false
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 13,
            family: "'Inter', sans-serif"
          },
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        border: {
          display: false
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="py-4 border-b border-[#0A2540]/10">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Link
                to="/clusters"
                className="inline-flex items-center text-[#0A2540] hover:text-[#1C1F26]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Portfolio
              </Link>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </div>

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {/* Company Header */}
            <div className="mb-8">
              <div className="mb-3 text-sm font-semibold tracking-wider text-[#1C1F26] uppercase">
                EQUITY
              </div>
              <h1 className="mb-4 text-5xl font-bold text-[#0A2540]">{companyDetailsData.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-base text-[#1C1F26]">
                <div className="font-semibold text-[#0A2540]">
                  {companyDetailsData.KESValue} <span className="text-sm text-[#1C1F26]">KES</span>
                </div>
                <div className="text-[#1C1F26]">|</div>
                <div className="font-semibold text-[#0A2540]">
                  {companyDetailsData.usdValue} <span className="text-sm text-[#1C1F26]">USD</span>
                </div>
              </div>
            </div>

            {/* Company Info Grid */}
            <div className="flex flex-wrap items-center gap-3 pb-8 mb-8 text-base border-b border-[#0A2540]/10">
              <div className="text-[#1C1F26]">
                <span className="font-medium text-[#1C1F26]">Year:</span> <span className="font-semibold text-[#0A2540]">{companyDetailsData.year}</span>
              </div>
              <div className="text-[#1C1F26]">|</div>
              <div className="text-[#1C1F26]">
                <span className="font-medium text-[#1C1F26]">Ownership:</span> <span className="font-semibold text-[#0A2540]">{companyDetailsData.ownership}</span>
              </div>
              <div className="text-[#1C1F26]">|</div>
              <div className="text-[#1C1F26]">
                <span className="font-medium text-[#1C1F26]">Sector:</span> <span className="font-semibold text-[#0A2540]">{companyDetailsData.sector}</span>
              </div>
              <div className="text-[#1C1F26]">|</div>
              <div className="text-[#1C1F26]">
                <span className="font-medium text-[#1C1F26]">Country:</span> <span className="font-semibold text-[#0A2540]">{companyDetailsData.country}</span>
              </div>
              <div className="text-[#1C1F26]">|</div>
              <div className="text-[#1C1F26]">
                <span className="font-medium text-[#1C1F26]">Incorporated in:</span> <span className="font-semibold text-[#0A2540]">{companyDetailsData.incorporated}</span>
              </div>
              {companyDetailsData.website && (
                <>
                  <div className="text-[#1C1F26]">|</div>
                  <div className="text-[#1C1F26]">
                    <span className="font-medium text-[#1C1F26]">Website:</span>{' '}
                    <a
                      href={`https://${companyDetailsData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#0A2540] hover:text-[#1C1F26]"
                    >
                      {companyDetailsData.website}
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Historical Investments and Voting Section */}
            <div className="grid grid-cols-1 gap-8 mb-12 lg:grid-cols-12">
              {/* Historical Investments Section */}
              <div className="lg:col-span-7">
                <div className="p-6 rounded-lg bg-[#0A2540]">
                  <h2 className="mb-1 text-2xl font-bold text-white">Historical investments</h2>
                  <div className="mb-6 text-sm text-white/60">
                    Values are in million KES as at 30.06.2025
                  </div>

                  <div className="mb-6" style={{ height: '400px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
              </div>

              {/* Voting Information Section */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-lg bg-[#0A2540]">
                  <h2 className="mb-4 text-2xl font-bold text-white">Our voting</h2>
                  <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-white/60">
                    <div>
                      Voting share: <span className="font-semibold text-white">{companyDetailsData.votingShare}</span>
                    </div>
                    <div>|</div>
                    <div>
                      Ticker: <span className="font-semibold text-white">{companyDetailsData.ticker}</span>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-white">
                    When we own the right to vote at the companys shareholder meetings. This gives us a say in director elections and important decisions that affect the funds investments. We are transparent and predictable on how we vote and why we vote the way we do. We publish our voting intentions five days before the meeting. When we vote against the board`s recommendation, we always give an explanation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;