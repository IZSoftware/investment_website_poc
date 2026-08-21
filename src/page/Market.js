import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddCountryModal from '../components/InvestorPortal/AddCountryModal';
import EditCountryModal from '../components/InvestorPortal/EditCountryModal';
import { useAuth } from '../context/AuthContext';
import {
  getInvestorDashboardCountries,
  getInvestorCountries,
  getAdminCountries,
  updateAdminCountryStatus,
} from '../api/services';
import { getSupportedCountries } from '../data/data';
import { formatDisplayDate } from '../utils/valuation';
import { sortByOrder } from '../utils/apiHelpers';

// Static reference picklist for country names — the API stores/returns a plain
// `name` string, this list only shapes the input.
const SUPPORTED_COUNTRIES = getSupportedCountries();

export default function Market() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  // DEV reads everything, writes nothing (README §8.1 capability matrix).
  const canWrite = userRole !== 'DEV';

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);

  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Pulled out so it can be re-run after any create/edit/delete, keeping the
  // summary cards and country list in sync with the server.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Writers list from the admin endpoint: /api/investor/** returns only
      // enabled countries, so a disabled one would vanish from the page that is
      // supposed to re-enable it.
      const [dashboardRes, countriesRes] = await Promise.all([
        getInvestorDashboardCountries(),
        canWrite ? getAdminCountries() : getInvestorCountries(),
      ]);

      if (dashboardRes.success) {
        setDashboardInfo(dashboardRes.data);
      } else {
        setError(dashboardRes.message || 'Failed to load market summary');
      }

      if (countriesRes.success) {
        setCountries(sortByOrder(countriesRes.data || []));
      } else {
        setError((prev) => prev || countriesRes.message || 'Failed to load countries');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, [canWrite]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Single owner of the status PATCH — the card button and the edit modal's
  // toggle both delegate here so the call never fires twice for one click.
  const handleToggleStatus = async (id, enabled) => {
    setActionError(null);
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
    try {
      const response = await updateAdminCountryStatus({ id, enabled });
      if (response.success) {
        setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, ...response.data } : c)));
      } else {
        setActionError(response.message || 'Failed to update status');
        await fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
      await fetchData();
    }
  };

  const handleSaved = async () => {
    setEditingCountry(null);
    await fetchData();
  };

  const handleDeleted = async () => {
    setEditingCountry(null);
    await fetchData();
  };

  if (loading && !dashboardInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">
        Loading market data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">{error}</div>
    );
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
                {dashboardInfo?.title || 'MARKETS'}
              </h1>
              {canWrite && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                  <span className="font-medium">Add Country</span>
                </button>
              )}
            </div>

            {dashboardInfo?.introText && (
              <div className="max-w-4xl mb-12 lg:mb-16">
                <p className="text-sm sm:text-base lg:text-lg text-[#6E6E73] leading-relaxed">
                  {dashboardInfo.introText}
                </p>
              </div>
            )}

            {actionError && (
              <div className="px-4 py-3 mb-8 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
                {actionError}
              </div>
            )}

            <div className="mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-4 lg:mb-6">Overview</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 md:grid-cols-3">
                <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Years</h3>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                    {dashboardInfo?.years ?? '—'}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">of investing</p>
                </div>

                <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Total Countries</h3>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                    {dashboardInfo?.totalCountries ?? '—'}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">active countries</p>
                </div>

                <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg border-l-4 border-emerald-500">
                  <h3 className="text-base sm:text-lg font-medium text-[#6E6E73] mb-2 lg:mb-4">Total Value</h3>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] mb-1 lg:mb-2">
                    {dashboardInfo?.totalValue?.displayText || '—'}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">across all countries</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-4 lg:mb-8">Countries</h2>

            {countries.length === 0 ? (
              <p className="mb-12 text-sm text-[#6E6E73] lg:mb-16">No countries have been added yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16 md:grid-cols-2 lg:grid-cols-3">
                {countries.map((country) => {
                  const enabled = country.enabled ?? true;
                  const asAt = formatDisplayDate(country.valuation?.asAtDate);
                  return (
                    <div
                      key={country.id}
                      className={`bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 relative group shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border-l-4 ${enabled ? 'border-emerald-500' : 'border-red-500 bg-red-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3 lg:mb-4">
                        <h3 className="text-lg lg:text-xl font-semibold text-[#1D1D1F]">{country.name}</h3>
                        {canWrite && (
                          <button
                            onClick={() => setEditingCountry(country)}
                            className="p-1.5 lg:p-2 text-white transition-all bg-[#1D1D1F] rounded-lg opacity-0 hover:bg-[#2D2D2F] group-hover:opacity-100 flex-shrink-0"
                            title="Edit country"
                          >
                            <Edit2 size={14} className="lg:w-[18px] lg:h-[18px]" />
                          </button>
                        )}
                      </div>

                      <div className="mb-4 lg:mb-6">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="text-xl lg:text-2xl font-semibold text-[#1D1D1F]">
                          {country.valuation?.displayText || '—'}
                        </div>
                        {asAt && (
                          <p className="text-xs text-[#6E6E73] mt-1 tracking-wide">
                            AS AT {asAt.toUpperCase()}
                          </p>
                        )}
                      </div>

                      {canWrite && (
                        <button
                          onClick={() => handleToggleStatus(country.id, !enabled)}
                          className={`mt-4 lg:mt-6 px-4 py-2 text-xs font-medium rounded-xl transition-all ${enabled ? 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                          {enabled ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      <AddCountryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaved}
        supportedCountries={SUPPORTED_COUNTRIES}
      />

      <EditCountryModal
        isOpen={Boolean(editingCountry)}
        onClose={() => setEditingCountry(null)}
        country={editingCountry}
        onSave={handleSaved}
        onDelete={handleDeleted}
        onToggleStatus={handleToggleStatus}
        supportedCountries={SUPPORTED_COUNTRIES}
      />
    </div>
  );
}
