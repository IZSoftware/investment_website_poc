import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Edit2, Plus, X, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddCountryModal from '../components/InvestorPortal/AddCountryModal';
import {
  getInvestorDashboardCountries,
  getInvestorCountries,
  updateAdminCountry,
  deleteAdminCountry,
} from '../api/services';
import { getSupportedCountries } from '../data/data';
import {
  VALUATION_UNITS,
  CURRENCY_OPTIONS,
  buildValuation,
  parseValuation,
  formatAsAtDate,
  formatDisplayDate,
} from '../utils/valuation';

export default function Market() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', numberOfYears: '', currency: 'USD', amount: '',
    unit: 'BILLIONS', allocationPercent: '', selectedDate: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supportedCountries = getSupportedCountries();

  // Pulled out so it can be re-run after any create/edit/delete,
  // keeping the summary cards and country list in sync with the server
  // instead of only patching local state.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardRes, countriesRes] = await Promise.all([
        getInvestorDashboardCountries(),
        getInvestorCountries(),
      ]);

      if (dashboardRes.success) {
        setDashboardInfo(dashboardRes.data);
      } else {
        setError(dashboardRes.message || 'Failed to load market summary');
      }

      if (countriesRes.success) {
        setCountries(countriesRes.data);
      } else {
        setError((prev) => prev || countriesRes.message || 'Failed to load countries');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (country) => {
    const parsedVal = parseValuation(country.valuation);
    setEditingItem(country);
    setFormData({
      name: country.name || '',
      numberOfYears: country.numberOfYears ?? '',
      currency: parsedVal.currency,
      amount: parsedVal.amount,
      unit: parsedVal.unit,
      allocationPercent: parsedVal.allocationPercent,
      selectedDate: parsedVal.asAtDate,
    });
    setSubmitError(null);
    setShowEditModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    const valuation = buildValuation({
      currency: formData.currency,
      amount: formData.amount,
      unit: formData.unit,
      allocationPercent: formData.allocationPercent,
      asAtDate: formatAsAtDate(formData.selectedDate),
    });

    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = await updateAdminCountry({
        id: editingItem.id,
        name: formData.name,
        numberOfYears: Number(formData.numberOfYears),
        valuation,
        enabled: editingItem.enabled ?? true,
        sortOrder: editingItem.sortOrder ?? 0,
      });

      if (response.success) {
        setShowEditModal(false);
        setEditingItem(null);
        await fetchData();
      } else {
        setSubmitError(response.message || 'Failed to save changes');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAdd = async () => {
    setShowAddModal(false);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this country?')) return;
    try {
      setSubmitting(true);
      const response = await deleteAdminCountry({ id });
      if (response.success) {
        setShowEditModal(false);
        setEditingItem(null);
        await fetchData();
      } else {
        setSubmitError(response.message || 'Failed to delete');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !dashboardInfo) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">Loading market data…</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8 sm:py-10 lg:py-12">

            <button
              onClick={() => navigate('/investor-portal/dashboard')}
              className="flex items-center gap-1.5 lg:gap-2 mb-6 lg:mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-medium sm:text-sm">Back to Dashboard</span>
            </button>

            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center lg:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">
                {dashboardInfo?.title || 'SETTINGS'}
              </h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                <span className="font-medium">Add Country</span>
              </button>
            </div>

            <div className="max-w-4xl mb-12 lg:mb-16">
              <p className="text-sm sm:text-base lg:text-lg text-[#6E6E73] leading-relaxed">
                {dashboardInfo?.introText}
              </p>
            </div>

            <div className="mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-4 lg:mb-6">NF Holding Overview</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 md:grid-cols-3">
                <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Years</h3>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                    {dashboardInfo?.years}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">of investing</p>
                </div>

                <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Total Countries</h3>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                    {dashboardInfo?.totalCountries}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">active countries</p>
                </div>

                <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Total Value</h3>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                    {dashboardInfo?.totalValue?.displayText}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">across all countries</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-4 lg:mb-8">Choose a Country</h2>
            <div className="grid grid-cols-1 gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16 md:grid-cols-2 lg:grid-cols-3">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 relative group shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full"
                >
                  <div className="absolute flex items-center gap-1.5 lg:gap-2 transition-all opacity-0 top-3 right-3 lg:top-4 lg:right-4 group-hover:opacity-100">
                    <button onClick={() => handleEdit(country)} className="p-1.5 lg:p-2 text-white transition-all bg-black rounded-lg hover:bg-gray-800">
                      <Edit2 size={14} className="lg:w-[18px] lg:h-[18px]" />
                    </button>
                    <button onClick={() => handleDelete(country.id)} className="p-1.5 lg:p-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700">
                      <X size={14} className="lg:w-[18px] lg:h-[18px]" />
                    </button>
                  </div>
                  <div className="flex items-start gap-1.5 lg:gap-2 mb-3 lg:mb-4">
                    <h3 className="text-lg lg:text-xl font-semibold text-[#1D1D1F]">{country.name}</h3>
                    <ChevronRight size={16} className="lg:w-5 lg:h-5 text-[#6E6E73] mt-0.5 lg:mt-1" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73] mb-4 lg:mb-6 flex-grow">
                    {country.numberOfYears} years
                  </p>
                  <div>
                    <div className="text-xl lg:text-2xl font-semibold text-[#1D1D1F]">
                      {country.valuation?.displayText}
                    </div>
                    <p className="text-xs text-[#6E6E73] mt-1 tracking-wide">
                      AS AT {formatDisplayDate(country.valuation?.asAtDate).toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl lg:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-[#D2D2D7]">
              <h3 className="text-lg sm:text-xl font-semibold text-[#1D1D1F]">Edit Country</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 lg:p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
                <X size={16} className="lg:w-5 lg:h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 sm:p-5 lg:p-6 lg:space-y-6">
              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#1D1D1F] block">Country Name</label>
                <select
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236E6E73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="">Select Country</option>
                  {supportedCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#1D1D1F] block">
                  Number of Years <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="1" max="100"
                  value={formData.numberOfYears}
                  onChange={(e) => handleInputChange('numberOfYears', e.target.value)}
                  placeholder="Enter number of years"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#1D1D1F] block">
                  Valuation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <select value={formData.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
                      {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <input type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all" />
                  </div>
                  <div className="col-span-4">
                    <select value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
                      {VALUATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#1D1D1F] block">Allocation %</label>
                <input type="number" min="0" max="100" step="0.01" value={formData.allocationPercent} onChange={(e) => handleInputChange('allocationPercent', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all" />
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-[#1D1D1F] block">As At Date</label>
                <DatePicker
                  selected={formData.selectedDate}
                  onChange={(date) => handleInputChange('selectedDate', date)}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select date"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-3 py-2 sm:py-3 text-sm sm:text-base text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={15}
                  scrollableYearDropdown
                  maxDate={new Date()}
                />
              </div>

              {submitError && <p className="text-sm text-red-500">{submitError}</p>}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 lg:p-6 border-t border-[#D2D2D7]">
              <button onClick={() => handleDelete(editingItem?.id)} className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl w-full sm:w-auto">
                Delete Country
              </button>
              <div className="flex flex-col w-full gap-2 sm:flex-row sm:gap-3 sm:w-auto">
                <button onClick={() => setShowEditModal(false)} className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={submitting} className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all text-xs sm:text-sm disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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