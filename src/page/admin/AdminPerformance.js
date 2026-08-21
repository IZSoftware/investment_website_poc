import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Plus, X, Trash2 } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminPerformance,
  createAdminPerformance,
  updateAdminPerformance,
  deleteAdminPerformance,
} from '../../api/services';

const AdminPerformance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    portfolioValue: '',
    revenue: '',
    debt: '',
    gearing: '',
    returnOnAssets: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminPerformance();
      if (res.success) {
        setRecords(res.data || []);
      } else {
        setError(res.message || 'Failed to load performance records');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load performance records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        month: record.month || '',
        year: record.year || '',
        portfolioValue: record.portfolioValue || '',
        revenue: record.revenue || '',
        debt: record.debt || '',
        gearing: record.gearing || '',
        returnOnAssets: record.returnOnAssets || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        month: '',
        year: '',
        portfolioValue: '',
        revenue: '',
        debt: '',
        gearing: '',
        returnOnAssets: '',
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
      portfolioValue: '',
      revenue: '',
      debt: '',
      gearing: '',
      returnOnAssets: '',
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
        portfolioValue: parseFloat(formData.portfolioValue),
        revenue: parseFloat(formData.revenue) || 0,
        debt: parseFloat(formData.debt) || 0,
        gearing: parseFloat(formData.gearing) || 0,
        returnOnAssets: parseFloat(formData.returnOnAssets) || 0,
      };

      let res;
      if (editingId) {
        res = await updateAdminPerformance({ id: editingId, ...payload });
      } else {
        res = await createAdminPerformance(payload);
      }

      if (res.success) {
        handleCloseModal();
        await fetchRecords();
      } else {
        if (res.message?.includes('already exists')) {
          setFormError('A performance record already exists for this month/year');
        } else {
          setFormError(res.message || 'Failed to save record');
        }
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteAdminPerformance({ id });
      if (res.success) {
        setDeleteConfirm(null);
        await fetchRecords();
      } else {
        setError(res.message || 'Failed to delete record');
      }
    } catch (err) {
      setError(err?.message || 'Failed to delete record');
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

  // Format percentage - already scaled (42.5 = 42.5%)
  const formatPercent = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value}%`;
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
                  Portfolio Performance
                </h1>
                <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
                  Manage consolidated portfolio performance records
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
                >
                  <Plus size={18} />
                  Add Record
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
            <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Portfolio Value
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Debt
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Gearing
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        ROA
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
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-gray-400">
                          Loading...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-gray-400">
                          No performance records found. Click "Add Record" to create one.
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {record.month}/{record.year}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            ${record.portfolioValue?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            ${record.revenue?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            ${record.debt?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {formatPercent(record.gearing)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {formatPercent(record.returnOnAssets)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(record.createdAt)}
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenModal(record)}
                                  className="p-1.5 text-gray-500 transition-colors hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(record.id)}
                                  className="p-1.5 text-red-500 transition-colors hover:text-red-700 hover:bg-red-50 rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this performance record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Performance Record' : 'Add Performance Record'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.portfolioValue}
                    onChange={(e) => setFormData({ ...formData, portfolioValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debt
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.debt}
                    onChange={(e) => setFormData({ ...formData, debt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gearing (%) - Already scaled (42.5 = 42.5%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gearing}
                    onChange={(e) => setFormData({ ...formData, gearing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return on Assets (%) - Already scaled (8.25 = 8.25%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.returnOnAssets}
                    onChange={(e) => setFormData({ ...formData, returnOnAssets: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
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

export default AdminPerformance;