import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminNewsletter, deleteAdminNewsletter } from '../../api/services';

// README §8.7 — newsletter list is SUPER_ADMIN / ADMIN.
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

const AdminNewsletter = () => {
  const { userRole } = useAuth();
  const canView = ALLOWED_ROLES.includes(userRole);

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    if (!canView) return;
    try {
      setLoading(true);
      setError(null);
      const envelope = await getAdminNewsletter();
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load subscribers.');
        setSubscribers([]);
        return;
      }
      setSubscribers(Array.isArray(envelope?.data) ? envelope.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load subscribers.');
      setSubscribers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canView]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscribers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const envelope = await deleteAdminNewsletter({ id: deleteTarget.id });
      if (envelope?.success === false) {
        setError(envelope?.message || 'Could not remove this subscriber.');
        return;
      }
      setDeleteTarget(null);
      await fetchSubscribers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not remove this subscriber.');
    } finally {
      setDeleting(false);
    }
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Newsletter Subscribers</h1>
              <p className="mt-2 text-gray-500">People who signed up for updates through the homepage.</p>
            </div>
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <div className="flex items-start gap-3 p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                <ShieldAlert size={20} className="mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Subscriber details are restricted</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This list holds personal contact data, so only a super admin or admin can open it.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex flex-col items-start justify-between gap-4 px-4 pt-10 pb-8 sm:flex-row sm:items-center sm:px-6 lg:px-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Newsletter Subscribers</h1>
              <p className="mt-2 text-gray-500">People who signed up for updates through the homepage.</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="px-4 pb-6 sm:px-6 lg:px-0">
              <p className="p-4 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">{error}</p>
            </div>
          )}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Consent</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Subscribed</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                    ) : error ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Subscribers could not be loaded.</td></tr>
                    ) : subscribers.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No subscribers yet</td></tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{sub.fullName || '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{sub.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                sub.consentConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {sub.consentConfirmed ? 'Confirmed' : 'Not confirmed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(sub.createdAt)}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setDeleteTarget(sub)}
                              title="Erase subscriber"
                              className="p-1.5 text-red-500 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
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

      {/* Hard delete — GDPR erasure, so confirm explicitly. */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Erase subscriber</h2>
            <p className="mb-6 text-gray-600">
              This permanently erases <span className="font-semibold">{deleteTarget.email}</span> from the subscriber
              list. It is a hard delete for GDPR erasure — the record cannot be restored, and they will stop receiving
              updates.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Erasing…' : 'Erase permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
