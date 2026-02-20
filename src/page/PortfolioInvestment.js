import React, { useState } from 'react';
import { Edit2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditSectorModal from '../components/InvestorPortal/EditSectorModal';
import AddSectorModal from '../components/InvestorPortal/AddSectorModal';
import { investmentPortfolio, getSectorsAsPortfolioCards } from '../data/data';

export default function InvestmentPortfolio() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Initialise from unified data — sectors derived from sectorsData
  const [portfolioData, setPortfolioData] = useState({
    totalPortfolio: investmentPortfolio.totalPortfolio,
    countries:      investmentPortfolio.countries,
    years:          investmentPortfolio.years,
    sectors:        getSectorsAsPortfolioCards(),
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleAdd = () => setShowAddModal(true);

  const handleSaveEdit = (updatedSector) => {
    setPortfolioData(prev => ({
      ...prev,
      sectors: prev.sectors.map(s => s.id === updatedSector.id ? updatedSector : s),
    }));
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSaveAdd = (newSector) => {
    setPortfolioData(prev => ({
      ...prev,
      sectors: [...prev.sectors, newSector],
    }));
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setPortfolioData(prev => ({
      ...prev,
      sectors: prev.sectors.filter(s => s.id !== id),
    }));
  };

  const handleBack = () => navigate('/investor-portal/dashboard');

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8 sm:py-10 lg:py-12">

            {/* Back */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 lg:gap-2 mb-6 lg:mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-medium sm:text-sm">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center lg:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">
                INVESTMENT PORTFOLIO
              </h1>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                <span className="font-medium">Add Sector</span>
              </button>
            </div>

            {/* Philosophy */}
            <div className="max-w-3xl mb-12 lg:mb-16">
              <p className="text-sm sm:text-base lg:text-lg text-[#6E6E73] leading-relaxed">
                {investmentPortfolio.philosophyText}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16 md:grid-cols-3">
              <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Total Portfolio</h3>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                  {portfolioData.totalPortfolio.value}
                </div>
                <p className="text-xs sm:text-sm text-[#6E6E73]">{portfolioData.totalPortfolio.description}</p>
              </div>

              <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Countries</h3>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                  {portfolioData.countries}
                </div>
                <p className="text-xs sm:text-sm text-[#6E6E73]">Countries in which we invest</p>
              </div>

              <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Years</h3>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                  {portfolioData.years}
                </div>
                <p className="text-xs sm:text-sm text-[#6E6E73]">of investing</p>
              </div>
            </div>

            {/* Sectors Grid */}
            <div className="mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-6 lg:mb-8">Our Sectors Include:</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {portfolioData.sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 relative group shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <button
                      onClick={() => handleEdit(sector)}
                      className="absolute p-1.5 lg:p-2 text-white transition-all bg-black rounded-lg opacity-0 top-3 right-3 lg:top-4 lg:right-4 group-hover:opacity-100 hover:bg-gray-800"
                    >
                      <Edit2 size={14} className="lg:w-[18px] lg:h-[18px]" />
                    </button>
                    <div className="mb-3 text-3xl lg:mb-4 lg:text-4xl">{sector.icon}</div>
                    <h3 className="text-lg lg:text-xl font-semibold text-[#1D1D1F] mb-2 lg:mb-3">{sector.title}</h3>
                    <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed mb-4 lg:mb-6">
                      {sector.description}
                    </p>
                    <div>
                      <div className="text-xl lg:text-2xl font-semibold text-[#1D1D1F]">{sector.value}</div>
                      <p className="text-xs text-[#6E6E73] mt-1">{sector.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      <EditSectorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        sector={editingItem}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
      />
      <AddSectorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveAdd}
      />
    </div>
  );
}