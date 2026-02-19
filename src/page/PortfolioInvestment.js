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
          <div className="px-4 py-12 sm:px-6 lg:px-8">

            {/* Back */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight">
                INVESTMENT PORTFOLIO
              </h1>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                <span className="font-medium">Add Sector</span>
              </button>
            </div>

            {/* Philosophy */}
            <div className="max-w-3xl mb-16">
              <p className="text-lg text-[#6E6E73] leading-relaxed">
                {investmentPortfolio.philosophyText}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-3">
              <div className="bg-[#F5F5F7] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <h3 className="text-lg font-medium text-[#6E6E73] mb-4">Total Portfolio</h3>
                <div className="text-5xl font-semibold text-[#1D1D1F] mb-2">
                  {portfolioData.totalPortfolio.value}
                </div>
                <p className="text-sm text-[#6E6E73]">{portfolioData.totalPortfolio.description}</p>
              </div>

              <div className="bg-[#F5F5F7] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <h3 className="text-lg font-medium text-[#6E6E73] mb-4">Countries</h3>
                <div className="text-5xl font-semibold text-[#1D1D1F] mb-2">
                  {portfolioData.countries}
                </div>
                <p className="text-sm text-[#6E6E73]">Countries in which we invest</p>
              </div>

              <div className="bg-[#F5F5F7] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <h3 className="text-lg font-medium text-[#6E6E73] mb-4">Years</h3>
                <div className="text-5xl font-semibold text-[#1D1D1F] mb-2">
                  {portfolioData.years}
                </div>
                <p className="text-sm text-[#6E6E73]">of investing</p>
              </div>
            </div>

            {/* Sectors Grid */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-8">Our Sectors Include:</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {portfolioData.sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className="bg-[#F5F5F7] rounded-2xl p-8 relative group shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <button
                      onClick={() => handleEdit(sector)}
                      className="absolute p-2 text-white transition-all bg-black rounded-lg opacity-0 top-4 right-4 group-hover:opacity-100 hover:bg-gray-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <div className="mb-4 text-4xl">{sector.icon}</div>
                    <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">{sector.title}</h3>
                    <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">
                      {sector.description}
                    </p>
                    <div>
                      <div className="text-2xl font-semibold text-[#1D1D1F]">{sector.value}</div>
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