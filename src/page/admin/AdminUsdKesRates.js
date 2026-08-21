import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Plus, X, Check } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminUsdKesRates,
  createAdminUsdKesRate,
  updateAdminUsdKesRate,
  setAdminUsdKesRateAsDefault,
} from '../../api/services';

const AdminUsdKesRates = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    kesValue: '',
    usdValue: '1',
    currentDefault: false,
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUsdKesRates();
      if (res.success) {
        setRates(res.data || []);
      } else {
        setError(res.message || 'Failed to load rates');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleOpenModal = (rate = null) => {
    if (rate) {
      setEditingId(rate.id);
      setFormData({
        month: rate.month || '',
        year: rate.year || '',
        kesValue: rate.kesValue || '',
        usdValue: rate.usdValue || '1',
        currentDefault: rate.currentDefault || false,
      });
    } else {
      setEditingId(null);
      setFormData({
        month: '',
        year: '',
        kesValue: '',
        usdValue: '1',
        currentDefault: false,
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError(null);
    setFormData({
      month: '',
      year: '',
      kesValue: '',
      usdValue: '1',
      currentDefault: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        kesValue: parseFloat(formData.kesValue),
        usdValue: parseFloat(formData.usdValue),
        currentDefault: formData.currentDefault,
      };

      let res;
      if (editingId) {
        res = await updateAdminUsdKesRate({ id: editingId, ...payload });
      } else {
        res = await createAdminUsdKesRate(payload);
      }

      if (res.success) {
        handleCloseModal();
        await fetchRates();
      } else {
        if (res.message?.includes('already exists')) {
          setFormError('A rate already exists for this month/year');
        } else {
          setFormError(res.message || 'Failed to save rate');
        }
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to save rate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await setAdminUsdKesRateAsDefault({ id });
      if (res.success) {
        await fetchRates();
      } else {
        setError(res.message || 'Failed to set default rate');
      }
    } catch (err) {
      setError(err?.message || 'Failed to set default rate');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:pt-12 lg:pt-16 sm:pb-10 lg:pb-12 sm:px-6 lg:px-0">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:mb-3 lg:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
                  USD/KES Rates
                </h1>
                <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
                  Manage exchange rates for portfolio valuation
                </p>
                <p className="mt-2 text-sm text-blue-600">
                  ⚠️ KES value is the exchange rate. USD value is typically 1.00.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
                >
                  <Plus size={18} />
                  Add Rate
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="px-4 pb-6 sm:px-6 lg:px-0">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Month/Year
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        KES Value
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        USD Value
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Created
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-400">
                          Loading...
                        </td>
                      </tr>
                    ) : rates.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-gray-400">No USD/KES rates found</p>
                            <p className="max-w-md text-xs text-gray-400">
                              Click "Add Rate" to create the first exchange rate.
                              This rate is used to convert USD values to KES on the public site.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {rate.month}/{rate.year}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {rate.kesValue}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {rate.usdValue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {rate.currentDefault ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check size={12} className="mr-1" />
                                Default
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Manual
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(rate.createdAt)}
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenModal(rate)}
                                  className="p-1.5 text-gray-500 transition-colors hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {!rate.currentDefault && (
                                  <button
                                    onClick={() => handleSetDefault(rate.id)}
                                    className="px-3 py-1 text-xs font-medium text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Rate' : 'Add Rate'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Month *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Year *
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2500"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    KES Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.kesValue}
                    onChange={(e) => setFormData({ ...formData, kesValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter KES exchange rate"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    USD Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.usdValue}
                    onChange={(e) => setFormData({ ...formData, usdValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">Default is 1.00 USD</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="currentDefault"
                    checked={formData.currentDefault}
                    onChange={(e) => setFormData({ ...formData, currentDefault: e.target.checked })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="currentDefault" className="ml-2 text-sm text-gray-700">
                    Set as default rate
                  </label>
                </div>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsdKesRates;