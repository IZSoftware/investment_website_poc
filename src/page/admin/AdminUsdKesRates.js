import React, { useState, useEffect, useCallback } from 'react';
import { Check, Edit2, Plus, ShieldAlert, X } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminUsdKesRates,
  createAdminUsdKesRate,
  updateAdminUsdKesRate,
  setAdminUsdKesRateAsDefault,
} from '../../api/services';

// README §8.3 — GET is SUPER_ADMIN/ADMIN/FINANCIAL_ADMIN/DEV; writes are SUPER_ADMIN/ADMIN only.
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'DEV'];
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const emptyForm = { month: '', year: '', kesValue: '', usdValue: '1', currentDefault: false };

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const AdminUsdKesRates = () => {
  const { userRole } = useAuth();
  const canRead = READ_ROLES.includes(userRole);
  const canWrite = WRITE_ROLES.includes(userRole);

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [promotingId, setPromotingId] = useState(null);

  const fetchRates = useCallback(async () => {
    if (!canRead) return;
    try {
      setLoading(true);
      setError(null);
      const envelope = await getAdminUsdKesRates();
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load rates.');
        setRates([]);
        return;
      }
      setRates(Array.isArray(envelope?.data) ? envelope.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load rates.');
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleOpenModal = (rate = null) => {
    if (rate) {
      setEditingId(rate.id);
      setFormData({
        month: rate.month ?? '',
        year: rate.year ?? '',
        kesValue: rate.kesValue ?? '',
        usdValue: rate.usdValue ?? '1',
        currentDefault: !!rate.currentDefault,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setFormError(null);
    setFieldErrors([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError(null);
    setFieldErrors([]);
    setFormData(emptyForm);
  };

  const errorFor = (field) => fieldErrors.find((fe) => fe.field === field)?.message;
  const isPeriodClash = /already exists/i.test(formError || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors([]);

    try {
      const payload = {
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
        kesValue: parseFloat(formData.kesValue),
        // usdValue is required by the API; a blank input means the usual "1 USD" quote.
        usdValue: formData.usdValue === '' ? 1 : parseFloat(formData.usdValue),
        // Editing never touches the default flag — "Set Default" owns that (radio
        // semantics, PATCH …/default). Omitted here, the backend leaves it alone.
        currentDefault: editingId ? undefined : formData.currentDefault,
      };

      const envelope = editingId
        ? await updateAdminUsdKesRate({ id: editingId, ...payload })
        : await createAdminUsdKesRate(payload);

      if (envelope?.success === false) {
        setFormError(envelope?.message || 'Failed to save rate.');
        setFieldErrors(envelope?.errors ?? []);
        return;
      }
      handleCloseModal();
      await fetchRates();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save rate.');
      setFieldErrors(err.response?.data?.errors ?? []);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    setPromotingId(id);
    setError(null);
    try {
      const envelope = await setAdminUsdKesRateAsDefault({ id });
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to set the default rate.');
        return;
      }
      await fetchRates();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to set the default rate.');
    } finally {
      setPromotingId(null);
    }
  };

  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">USD/KES Rates</h1>
              <p className="mt-2 text-gray-500">Exchange rates used for portfolio valuation.</p>
            </div>
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <div className="flex items-start gap-3 p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                <ShieldAlert size={20} className="mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Exchange rates are restricted</h3>
                  <p className="mt-1 text-sm text-gray-500">Your role does not have access to the USD/KES rate history.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </div>
    );
  }

  const columnCount = canWrite ? 6 : 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">USD/KES Rates</h1>
                <p className="mt-2 text-gray-500">
                  One rate per month. Rates are never deleted — correct a period by editing it.
                </p>
              </div>
              {canWrite && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Add Rate
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="px-4 pb-6 sm:px-6 lg:px-0">
              <p className="p-4 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">{error}</p>
            </div>
          )}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Month/Year</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">KES Value</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">USD Value</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Default</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Created</th>
                      {canWrite && (
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-10 text-center text-gray-400">Loading…</td>
                      </tr>
                    ) : rates.length === 0 ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-10 text-center text-gray-400">
                          {canWrite ? 'No rates yet. Use “Add Rate” to create one.' : 'No rates yet.'}
                        </td>
                      </tr>
                    ) : (
                      rates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {rate.month}/{rate.year}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{rate.kesValue}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{rate.usdValue}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {rate.currentDefault ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <Check size={12} className="mr-1" />
                                Default
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(rate.createdAt)}</td>
                          {canWrite && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenModal(rate)}
                                  title="Edit rate"
                                  className="p-1.5 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {!rate.currentDefault && (
                                  <button
                                    onClick={() => handleSetDefault(rate.id)}
                                    disabled={promotingId === rate.id}
                                    className="px-3 py-1 text-xs font-semibold text-white transition-colors rounded bg-[#0A2540] hover:bg-[#003852] disabled:opacity-50"
                                  >
                                    {promotingId === rate.id ? 'Setting…' : 'Set Default'}
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

      {/* Create / Edit Modal — no delete: rates are permanent by contract (§8.3). */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Rate' : 'Add Rate'}</h2>
              <button onClick={handleCloseModal} className="p-1 text-gray-400 transition-colors hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Month *</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent ${
                        isPeriodClash || errorFor('month') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errorFor('month') && <p className="mt-1 text-xs text-red-600">{errorFor('month')}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Year *</label>
                    <input
                      type="number"
                      min="2000"
                      max="2500"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent ${
                        isPeriodClash || errorFor('year') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errorFor('year') && <p className="mt-1 text-xs text-red-600">{errorFor('year')}</p>}
                  </div>
                </div>
                {isPeriodClash && <p className="text-xs text-red-600">{formError}</p>}

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">KES Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.kesValue}
                    onChange={(e) => setFormData({ ...formData, kesValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                    required
                  />
                  {errorFor('kesValue') && <p className="mt-1 text-xs text-red-600">{errorFor('kesValue')}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">USD Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.usdValue}
                    onChange={(e) => setFormData({ ...formData, usdValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">Default is 1 — the KES value is quoted per this many USD.</p>
                  {errorFor('usdValue') && <p className="mt-1 text-xs text-red-600">{errorFor('usdValue')}</p>}
                </div>

                {/* Create only: a first rate has to be able to become the default.
                    On edit, the default is changed from the table's Set Default action. */}
                {!editingId ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="currentDefault"
                      checked={formData.currentDefault}
                      onChange={(e) => setFormData({ ...formData, currentDefault: e.target.checked })}
                      className="w-4 h-4 border-gray-300 rounded text-[#0A2540] focus:ring-[#0A2540]"
                    />
                    <label htmlFor="currentDefault" className="ml-2 text-sm text-gray-700">
                      Make this the default rate
                    </label>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {formData.currentDefault
                      ? 'This is the current default rate. Promote another period from the list to change it.'
                      : 'Use “Set Default” in the list to make this the default rate.'}
                  </p>
                )}

                {formError && !isPeriodClash && <p className="text-sm text-red-600">{formError}</p>}

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
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0A2540] rounded-lg hover:bg-[#003852] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : editingId ? 'Update' : 'Create'}
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
