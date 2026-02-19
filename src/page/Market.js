import React, { useState } from 'react';
import { Edit2, Plus, X, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddCountryModal from '../components/InvestorPortal/AddCountryModal';
import {
  marketsData,
  getSupportedCountries,
  getTotalMarketsValue,
} from '../data/data';

export default function Market() {
  const navigate  = useNavigate();
  const [showEditModal,      setShowEditModal]      = useState(false);
  const [showAddModal,       setShowAddModal]       = useState(false);
  const [showYearsEditModal, setShowYearsEditModal] = useState(false);
  const [editingItem,        setEditingItem]        = useState(null);
  const [formData,           setFormData]           = useState({ name: '', years: '', value: '', date: '' });

  // ── State initialised from unified data ──────────────────────
  const [totalYears, setTotalYears] = useState(marketsData.companyOverview.years);

  const [countries, setCountries] = useState(marketsData.countries);

  // Sorted dropdown list (54 African + key global)
  const supportedCountries = getSupportedCountries();

  // ── Derived stats ─────────────────────────────────────────────
  const totalValue = getTotalMarketsValue(countries);

  // ── Handlers ─────────────────────────────────────────────────
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name:  item.name,
      years: item.years.replace(' years', ''),
      value: item.value,
      date:  item.date,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setCountries(prev =>
      prev.map(c =>
        c.id === editingItem.id
          ? { ...c, name: formData.name, years: formData.years ? `${formData.years} years` : '', value: formData.value, date: formData.date }
          : c
      )
    );
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSaveAdd = (newCountryData) => {
    setCountries(prev => [
      ...prev,
      { id: prev.length + 1, ...newCountryData },
    ]);
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      setCountries(prev => prev.filter(c => c.id !== id));
      setShowEditModal(false);
    }
  };

  const handleSaveTotalYears = (newYears) => {
    setTotalYears(prev => ({ ...prev, value: newYears }));
    setShowYearsEditModal(false);
  };

  const handleInputChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-12 sm:px-6 lg:px-8">

            {/* Back */}
            <button
              onClick={() => navigate('/investor-portal/dashboard')}
              className="flex items-center gap-2 mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight">SETTINGS</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                <span className="font-medium">Add Country</span>
              </button>
            </div>

            {/* Description — from data.js */}
            <div className="max-w-4xl mb-16">
              <p className="text-lg text-[#6E6E73] leading-relaxed">{marketsData.description}</p>
            </div>

            {/* ── Company Overview Cards ── */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-6">Company Overview</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                {/* Years — editable */}
                <div className="bg-[#F5F5F7] rounded-2xl p-8 relative group shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                  <button
                    onClick={() => setShowYearsEditModal(true)}
                    className="absolute p-2 text-white transition-all bg-black rounded-lg opacity-0 top-4 right-4 group-hover:opacity-100 hover:bg-gray-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <h3 className="text-lg font-medium text-[#6E6E73] mb-4">Years</h3>
                  <div className="text-5xl font-semibold text-[#1D1D1F] mb-2">{totalYears.value}</div>
                  <p className="text-sm text-[#6E6E73]">{totalYears.description}</p>
                </div>

                {/* Total Countries — auto-computed */}
                <div className="bg-[#F5F5F7] rounded-2xl p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-lg font-medium text-[#6E6E73] mb-4">Total Countries</h3>
                  <div className="text-5xl font-semibold text-[#1D1D1F] mb-2">{countries.length}</div>
                  <p className="text-sm text-[#6E6E73]">active countries</p>
                </div>

                {/* Total Value — auto-computed */}
                <div className="bg-[#F5F5F7] rounded-2xl p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-lg font-medium text-[#6E6E73] mb-4">Total Value</h3>
                  <div className="text-5xl font-semibold text-[#1D1D1F] mb-2">{totalValue}</div>
                  <p className="text-sm text-[#6E6E73]">across all countries</p>
                </div>
              </div>
            </div>

            {/* ── Countries Grid ── */}
            <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-8">Choose a Country</h2>
            <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-3">
              {countries.map(country => (
                <div
                  key={country.id}
                  className="bg-[#F5F5F7] rounded-2xl p-8 relative group shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full"
                >
                  <div className="absolute flex items-center gap-2 transition-all opacity-0 top-4 right-4 group-hover:opacity-100">
                    <button onClick={() => handleEdit(country)} className="p-2 text-white transition-all bg-black rounded-lg hover:bg-gray-800">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(country.id)} className="p-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex items-start gap-2 mb-4">
                    <h3 className="text-xl font-semibold text-[#1D1D1F]">{country.name}</h3>
                    <ChevronRight size={20} className="text-[#6E6E73] mt-1" />
                  </div>
                  <p className="text-sm text-[#6E6E73] mb-6 flex-grow">{country.years}</p>
                  <div>
                    <div className="text-2xl font-semibold text-[#1D1D1F]">{country.value}</div>
                    <p className="text-xs text-[#6E6E73] mt-1 tracking-wide">{country.date}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {/* ── Edit Country Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7]">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Edit Country</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Country Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1D1D1F] block">Country Name</label>
                <select
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236E6E73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="">Select Country</option>
                  {supportedCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Years */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1D1D1F] block">Number of Years <span className="text-red-500">*</span></label>
                <input
                  type="number" min="1" max="100"
                  value={formData.years}
                  onChange={e => handleInputChange('years', e.target.value)}
                  placeholder="Enter number of years"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
                <p className="text-xs text-[#6E6E73]">Number of years operating in this country</p>
              </div>
              {/* Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1D1D1F] block">Valuation <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={e => handleInputChange('value', e.target.value)}
                  placeholder="e.g., $219.4 B"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
              </div>
              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1D1D1F] block">As At Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={e => handleInputChange('date', e.target.value)}
                  placeholder="AS AT DECEMBER 31, 2025"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7]">
              <button onClick={() => handleDelete(editingItem?.id)} className="px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl">
                Delete Country
              </button>
              <div className="flex gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Total Years Modal ── */}
      {showYearsEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" onClick={() => setShowYearsEditModal(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7]">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Edit Total Years</h3>
              <button onClick={() => setShowYearsEditModal(false)} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1D1D1F] block">
                  Number of Years <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="1" max="100"
                  id="totalYearsInput"
                  defaultValue={totalYears.value}
                  placeholder="Enter total years"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
                <p className="text-xs text-[#6E6E73]">Total number of years the company has been investing</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D2D2D7]">
              <button onClick={() => setShowYearsEditModal(false)} className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all">
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById('totalYearsInput').value;
                  if (val) handleSaveTotalYears(val);
                }}
                className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Country Modal ── */}
      <AddCountryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveAdd}
        supportedCountries={supportedCountries}
      />

      <style>{`
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>
    </div>
  );
}