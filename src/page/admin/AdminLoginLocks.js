import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminLoginLocks, deleteAdminLoginLock } from '../../api/services';

const AdminLoginLocks = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminLoginLocks();
      if (res.success) {
        setLocks(res.data || []);
      } else {
        setError(res.message || 'Failed to load login locks');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load login locks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocks();
  }, [fetchLocks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLocks();
  };

  const handleUnlock = async (id) => {
    try {
      const res = await deleteAdminLoginLock({ id });
      if (res.success) {
        setDeleteConfirm(null);
        await fetchLocks();
      } else {
        setError(res.message || 'Failed to unlock');
      }
    } catch (err) {
      setError(err?.message || 'Failed to unlock');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Checks BOTH lockedUntil (account-scope, 24h) and cooldownUntil (IP-scope, 15min) —
  // whichever one this row actually populates
  const isLockActive = (lock) => {
    const until = lock.lockedUntil || lock.cooldownUntil;
    if (!until) return false;
    try {
      return new Date(until) > new Date();
    } catch {
      return false;
    }
  };

  const getScopeBadge = (scope) => {
    const styles = {
      ACCOUNT: 'bg-red-100 text-red-800',
      IP: 'bg-yellow-100 text-yellow-800',
    };
    return styles[scope] || 'bg-gray-100 text-gray-800';
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
                  Login Locks
                </h1>
                <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
                  View and manage locked accounts and IP addresses
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                  Refresh
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
                        Scope
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Identifier
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Failed Attempts
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Locked Until
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Cooldown Until
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
                        <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-400">
                          Loading...
                        </td>
                      </tr>
                    ) : locks.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-400">
                          No active locks found. All systems clear.
                        </td>
                      </tr>
                    ) : (
                      locks.map((lock) => {
                        const active = isLockActive(lock);
                        return (
                          <tr key={lock.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getScopeBadge(lock.scope)}`}>
                                {lock.scope}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {lock.identifier}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                              {lock.failedCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {active ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Locked
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Expired
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {formatDate(lock.lockedUntil)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {formatDate(lock.cooldownUntil)}
                            </td>
                            {isAdmin && active && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => setDeleteConfirm(lock.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 size={14} />
                                  Unlock
                                </button>
                              </td>
                            )}
                            {isAdmin && !active && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                —
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Unlock</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unlock this account/IP? The user will be able to attempt login again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnlock(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginLocks;