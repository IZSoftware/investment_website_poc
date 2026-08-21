import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Plus, ShieldAlert, Trash2, X } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminPerformance,
  createAdminPerformance,
  updateAdminPerformance,
  deleteAdminPerformance,
} from '../../api/services';

// README §8.3 — GET is SUPER_ADMIN/ADMIN/FINANCIAL_ADMIN/DEV; writes are SUPER_ADMIN/ADMIN only.
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'DEV'];
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const emptyForm = {
  month: '',
  year: '',
  portfolioValue: '',
  revenue: '',
  debt: '',
  gearing: '',
  returnOnAssets: '',
};

// Reporting currency for these figures is USD (§8.3 carries no per-record currency),
// so the symbol lives here rather than being repeated at every cell.
const formatMoney = (value) => {
  if (value === undefined || value === null || value === '') return 'N/A';
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : `$${n.toLocaleString()}`;
};

// Gearing / ROA arrive pre-scaled (42.5 means 42.5%).
const formatPercent = (value) => {
  if (value === undefined || value === null || value === '') return 'N/A';
  return `${value}%`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// '' means "leave this optional field unset" — omit it rather than sending 0,
// but a typed 0 is a legitimate value and must survive.
const optionalNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

const AdminPerformance = () => {
  const { userRole } = useAuth();
  const canRead = READ_ROLES.includes(userRole);
  const canWrite = WRITE_ROLES.includes(userRole);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!canRead) return;
    try {
      setLoading(true);
      setError(null);
      const envelope = await getAdminPerformance();
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load performance records.');
        setRecords([]);
        return;
      }
      setRecords(Array.isArray(envelope?.data) ? envelope.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load performance records.');
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        month: record.month ?? '',
        year: record.year ?? '',
        portfolioValue: record.portfolioValue ?? '',
        revenue: record.revenue ?? '',
        debt: record.debt ?? '',
        gearing: record.gearing ?? '',
        returnOnAssets: record.returnOnAssets ?? '',
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
  // A duplicate month/year comes back as a 400 whose message names the period —
  // it belongs on the period fields, not just in the generic error line.
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
        portfolioValue: optionalNumber(formData.portfolioValue),
        revenue: optionalNumber(formData.revenue),
        debt: optionalNumber(formData.debt),
        gearing: optionalNumber(formData.gearing),
        returnOnAssets: optionalNumber(formData.returnOnAssets),
      };

      const envelope = editingId
        ? await updateAdminPerformance({ id: editingId, ...payload })
        : await createAdminPerformance(payload);

      if (envelope?.success === false) {
        setFormError(envelope?.message || 'Failed to save record.');
        setFieldErrors(envelope?.errors ?? []);
        return;
      }
      handleCloseModal();
      await fetchRecords();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save record.');
      setFieldErrors(err.response?.data?.errors ?? []);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    setError(null);
    try {
      const envelope = await deleteAdminPerformance({ id });
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to delete record.');
        return;
      }
      setDeleteConfirm(null);
      await fetchRecords();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeleting(false);
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Portfolio Performance</h1>
              <p className="mt-2 text-gray-500">Consolidated monthly performance records.</p>
            </div>
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <div className="flex items-start gap-3 p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                <ShieldAlert size={20} className="mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Performance figures are restricted</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your role does not have access to consolidated performance reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </div>
    );
  }

  const columnCount = canWrite ? 8 : 7;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Portfolio Performance</h1>
                <p className="mt-2 text-gray-500">Consolidated monthly performance records, reported in USD.</p>
              </div>
              {canWrite && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Add Record
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
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Portfolio Value</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Debt</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Gearing</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ROA</th>
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
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-10 text-center text-gray-400">
                          {canWrite ? 'No performance records yet. Use “Add Record” to create one.' : 'No performance records yet.'}
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {record.month}/{record.year}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatMoney(record.portfolioValue)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatMoney(record.revenue)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatMoney(record.debt)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatPercent(record.gearing)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatPercent(record.returnOnAssets)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(record.createdAt)}</td>
                          {canWrite && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenModal(record)}
                                  title="Edit record"
                                  className="p-1.5 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(record.id)}
                                  title="Delete record"
                                  className="p-1.5 text-red-500 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">
              Delete this performance record? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Performance Record' : 'Add Performance Record'}
              </h2>
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">Portfolio Value * (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.portfolioValue}
                    onChange={(e) => setFormData({ ...formData, portfolioValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                    required
                  />
                  {errorFor('portfolioValue') && <p className="mt-1 text-xs text-red-600">{errorFor('portfolioValue')}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Revenue (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                  />
                  {errorFor('revenue') && <p className="mt-1 text-xs text-red-600">{errorFor('revenue')}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Debt (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.debt}
                    onChange={(e) => setFormData({ ...formData, debt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                  />
                  {errorFor('debt') && <p className="mt-1 text-xs text-red-600">{errorFor('debt')}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Gearing (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gearing}
                    onChange={(e) => setFormData({ ...formData, gearing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">Already scaled — enter 42.5 for 42.5%. Leave blank to omit.</p>
                  {errorFor('gearing') && <p className="mt-1 text-xs text-red-600">{errorFor('gearing')}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Return on Assets (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.returnOnAssets}
                    onChange={(e) => setFormData({ ...formData, returnOnAssets: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">Already scaled — enter 8.25 for 8.25%. Leave blank to omit.</p>
                  {errorFor('returnOnAssets') && <p className="mt-1 text-xs text-red-600">{errorFor('returnOnAssets')}</p>}
                </div>

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

export default AdminPerformance;
