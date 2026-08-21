import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldAlert, Unlock } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminLoginLocks, deleteAdminLoginLock } from '../../api/services';

// README §8.6a — login locks are SUPER_ADMIN / ADMIN.
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const isFuture = (value) => {
  if (!value) return false;
  try {
    return new Date(value) > new Date();
  } catch {
    return false;
  }
};

const SCOPE_STYLES = {
  ACCOUNT: 'bg-red-100 text-red-800',
  IP: 'bg-yellow-100 text-yellow-800',
};

const AdminLoginLocks = () => {
  const { userRole } = useAuth();
  const canManage = ALLOWED_ROLES.includes(userRole);

  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocks = useCallback(async () => {
    if (!canManage) return;
    try {
      setLoading(true);
      setError(null);
      const envelope = await getAdminLoginLocks();
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load login locks.');
        setLocks([]);
        return;
      }
      setLocks(Array.isArray(envelope?.data) ? envelope.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load login locks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canManage]);

  useEffect(() => {
    fetchLocks();
  }, [fetchLocks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLocks();
  };

  const handleUnlock = async () => {
    if (!unlockTarget) return;
    setUnlocking(true);
    setError(null);
    try {
      const envelope = await deleteAdminLoginLock({ id: unlockTarget.id });
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to clear this lock.');
        return;
      }
      setUnlockTarget(null);
      await fetchLocks();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to clear this lock.');
    } finally {
      setUnlocking(false);
    }
  };

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Login Locks</h1>
              <p className="mt-2 text-gray-500">Locked accounts and source addresses.</p>
            </div>
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <div className="flex items-start gap-3 p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                <ShieldAlert size={20} className="mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Lockouts are handled by admins</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Only a super admin or admin can view and clear login lockouts. Ask them if someone is locked out and
                    cannot wait for the lock to expire.
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
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Login Locks</h1>
                <p className="mt-2 text-gray-500">
                  Accounts lock for 24 hours and addresses for 15 minutes. Clear one early when someone cannot wait.
                </p>
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
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Scope</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Identifier</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Failed Attempts</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Locked Until</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cooldown Until</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading…</td>
                      </tr>
                    ) : locks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400">No locks right now. All clear.</td>
                      </tr>
                    ) : (
                      locks.map((lock) => {
                        const locked = isFuture(lock.lockedUntil);
                        const cooling = !locked && isFuture(lock.cooldownUntil);
                        return (
                          <tr key={lock.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${SCOPE_STYLES[lock.scope] ?? 'bg-gray-100 text-gray-600'}`}>
                                {lock.scope}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{lock.identifier}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{lock.failedCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {locked ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                  Locked
                                </span>
                              ) : cooling ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                  Cooling down
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  Expired
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(lock.lockedUntil)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(lock.cooldownUntil)}</td>
                            {/* Unlock is offered for every row: a cooldown-only entry still
                                blocks the next attempt, and clearing a spent record is harmless. */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setUnlockTarget(lock)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                              >
                                <Unlock size={14} />
                                Unlock
                              </button>
                            </td>
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

      {/* Unlock Confirmation Modal */}
      {unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Unlock</h2>
            <p className="mb-6 text-gray-600">
              Clear the lock on <span className="font-semibold">{unlockTarget.identifier}</span>? Sign-in attempts will
              be allowed again immediately, and the unlock is recorded in the audit log.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUnlockTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {unlocking ? 'Unlocking…' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginLocks;
