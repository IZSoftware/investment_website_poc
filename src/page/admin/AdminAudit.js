import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, ShieldAlert } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { useAdminPagedList } from '../../hooks/useAdminCrud';
import { getAdminAudit } from '../../api/services';

// README §8.8 — audit log is SUPER_ADMIN / ADMIN / DEV.
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DEV'];
const PAGE_SIZE = 20;

// OTP_REQUEST can still appear on historic rows even though nothing writes it now.
const ACTION_STYLES = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-gray-100 text-gray-600',
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const PageShell = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <AdminNavbar />
    <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
      <div className="hidden col-span-1 lg:block" />
      <div className="col-span-12 lg:col-span-10">{children}</div>
      <div className="hidden col-span-1 lg:block" />
    </div>
  </div>
);

const AuditTable = () => {
  const { items, page, totalPages, totalElements, loading, error, setPage, refresh } = useAdminPagedList(
    getAdminAudit,
    { size: PAGE_SIZE }
  );

  const canPrev = page > 0 && !loading;
  const canNext = page + 1 < totalPages && !loading;

  return (
    <>
      <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Audit Log</h1>
            <p className="mt-2 text-gray-500">Every create, update, delete and sign-in recorded by the API.</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
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
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">When</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actor</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Request</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">IP</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Summary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">The audit log could not be loaded.</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No audit entries yet</td></tr>
                ) : (
                  items.map((entry, index) => (
                    <tr key={entry.id ?? `${entry.createdAt}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatTimestamp(entry.createdAt)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.actorEmail || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ACTION_STYLES[entry.actionType] ?? 'bg-gray-100 text-gray-600'}`}>
                          {entry.actionType || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{entry.entityType || '—'}</div>
                        {entry.entityId && (
                          <div className="font-mono text-xs text-gray-400">{entry.entityId}</div>
                        )}
                      </td>
                      <td className="max-w-xs px-6 py-4 text-xs text-gray-600">
                        <div className="font-mono font-semibold text-gray-500">{entry.httpMethod || '—'}</div>
                        {entry.endpoint && (
                          <div className="font-mono truncate" title={entry.endpoint}>{entry.endpoint}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{entry.ipAddress || '—'}</td>
                      <td className="max-w-sm px-6 py-4 text-sm text-gray-600 truncate" title={entry.summary || ''}>
                        {entry.summary || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 sm:flex-row bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages} — {totalElements} entr{totalElements === 1 ? 'y' : 'ies'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!canPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#0A2540] bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#0A2540] bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AdminAudit = () => {
  const { userRole } = useAuth();

  // The table lives in its own component so the paged hook (which fetches on
  // mount) never fires for a role the endpoint would reject.
  if (!ALLOWED_ROLES.includes(userRole)) {
    return (
      <PageShell>
        <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Audit Log</h1>
          <p className="mt-2 text-gray-500">A record of every change made through the API.</p>
        </div>
        <div className="px-4 pb-16 sm:px-6 lg:px-0">
          <div className="flex items-start gap-3 p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <ShieldAlert size={20} className="mt-0.5 text-gray-400 shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900">The audit log is restricted</h3>
              <p className="mt-1 text-sm text-gray-500">
                It records who changed what, so only a super admin, admin or developer can read it.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuditTable />
    </PageShell>
  );
};

export default AdminAudit;
