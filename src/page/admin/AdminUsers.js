import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { useAuth } from '../../context/AuthContext';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../api/services';

// README §8.6 — role ∈ SUPER_ADMIN | ADMIN | DEV | FINANCIAL_ADMIN | INVESTOR
const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DEV', label: 'Developer' },
  { value: 'FINANCIAL_ADMIN', label: 'Financial Admin' },
  { value: 'INVESTOR', label: 'Investor' },
];

const ROLE_STYLES = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-indigo-100 text-indigo-700',
  DEV: 'bg-slate-100 text-slate-700',
  FINANCIAL_ADMIN: 'bg-amber-100 text-amber-800',
  INVESTOR: 'bg-blue-100 text-blue-700',
};

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));

const emptyForm = { fullName: '', email: '', role: 'INVESTOR', active: true };

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] disabled:bg-gray-100 disabled:text-gray-500';

const AdminUsers = () => {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  // [{ field, message }] from the envelope — duplicate email lands here.
  const [fieldErrors, setFieldErrors] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const envelope = await getAdminUsers();
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load users.');
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(envelope?.data) ? envelope.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const errorFor = (field) => fieldErrors.find((fe) => fe.field === field)?.message;
  const unmatchedErrors = fieldErrors.filter((fe) => !['fullName', 'email', 'role', 'active'].includes(fe.field));

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Users</h1>
              <p className="mt-2 text-gray-500">Accounts and access levels.</p>
            </div>
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <div className="flex items-start gap-3 p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                <ShieldAlert size={20} className="mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Only the super admin manages users</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Creating accounts, changing roles and deactivating people is restricted to the super admin. Ask them
                    if you need an account added or a role changed.
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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFieldErrors([]);
    setSlideOpen(true);
  };

  const openEdit = (account) => {
    setEditingId(account.id);
    setForm({
      fullName: account.fullName ?? '',
      email: account.email ?? '',
      role: account.role ?? 'INVESTOR',
      active: !!account.active,
    });
    setFormError(null);
    setFieldErrors([]);
    setSlideOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      const envelope = editingId
        ? // email is not editable per the API — omit it on update
          await updateAdminUser({ id: editingId, fullName: form.fullName, role: form.role, active: form.active })
        : await createAdminUser(form);

      if (envelope?.success === false) {
        setFormError(envelope?.message || 'Could not save this user.');
        setFieldErrors(envelope?.errors ?? []);
        return;
      }
      setSlideOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Could not save this user.');
      setFieldErrors(err.response?.data?.errors ?? []);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const envelope = await deleteAdminUser({ id: deleteTarget.id });
      if (envelope?.success === false) {
        setError(envelope?.message || 'Could not delete this user.');
        return;
      }
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not delete this user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Users</h1>
              <p className="mt-2 text-gray-500">Manage staff and investor accounts.</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add User
            </button>
          </div>

          {error && <div className="px-4 pb-4 text-sm text-red-600 sm:px-6 lg:px-0">{error}</div>}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No users yet</td></tr>
                    ) : (
                      users.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{account.fullName}</td>
                          <td className="px-6 py-4 text-gray-600">{account.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLES[account.role] ?? 'bg-gray-100 text-gray-600'}`}>
                              {ROLE_LABELS[account.role] ?? account.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${account.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {account.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(account)}
                                title="Edit user"
                                className="p-1.5 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(account)}
                                title="Delete user"
                                className="p-1.5 text-red-500 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Delete user</h2>
            <p className="mb-6 text-gray-600">
              Remove <span className="font-semibold">{deleteTarget.fullName || deleteTarget.email}</span>? They lose
              access immediately and this cannot be undone.
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
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SlideOver open={slideOpen} title={editingId ? 'Edit User' : 'Add User'} onClose={() => setSlideOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!editingId && (
            <p className="p-3 text-sm text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
              An invite email will be sent — the user sets their own password.
            </p>
          )}

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Full Name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              className={inputClass}
            />
            {errorFor('fullName') && <p className="mt-1 text-xs text-red-600">{errorFor('fullName')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!editingId}
              className={inputClass}
            />
            {errorFor('email') && <p className="mt-1 text-xs text-red-600">{errorFor('email')}</p>}
            {editingId && <p className="mt-1 text-xs text-gray-400">Email cannot be changed after creation.</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errorFor('role') && <p className="mt-1 text-xs text-red-600">{errorFor('role')}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
          {errorFor('active') && <p className="text-xs text-red-600">{errorFor('active')}</p>}

          {unmatchedErrors.length > 0 && (
            <ul className="p-3 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50">
              {unmatchedErrors.map((fe, i) => (
                <li key={`${fe.field}-${i}`}>{fe.field ? `${fe.field}: ` : ''}{fe.message}</li>
              ))}
            </ul>
          )}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Send Invite'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
};

export default AdminUsers;
