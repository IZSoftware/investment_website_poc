import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../api/services';

const ROLE_STYLES = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  INVESTOR: 'bg-blue-100 text-blue-700',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'INVESTOR', active: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUsers();
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ fullName: '', email: '', role: 'INVESTOR', active: true });
    setFormError(null);
    setSlideOpen(true);
  };

  const openEdit = (user) => {
    setEditingId(user.id);
    setForm({ fullName: user.fullName, email: user.email, role: user.role, active: user.active });
    setFormError(null);
    setSlideOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        // email is not editable per the API — omit it on update
        await updateAdminUser({ id: editingId, fullName: form.fullName, role: form.role, active: form.active });
      } else {
        await createAdminUser(form);
      }
      setSlideOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setFormError('Could not save this user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteAdminUser({ id });
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Could not delete this user.');
    } finally {
      setDeletingId(null);
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
              <p className="mt-2 text-gray-500">Manage admin and investor accounts.</p>
            </div>
            <button onClick={openCreate} className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
              + Add New
            </button>
          </div>

          {error && <div className="px-4 pb-4 text-sm text-red-600 sm:px-6 lg:px-0">{error}</div>}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No users yet</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLES[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openEdit(user)} className="mr-4 font-semibold text-[#0A2540] hover:text-[#003852]">Edit</button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === user.id ? 'Deleting…' : 'Delete'}
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
        <div className="hidden col-span-1 lg:block" />
      </div>

      <SlideOver open={slideOpen} title={editingId ? 'Edit User' : 'Add User'} onClose={() => setSlideOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!editingId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] disabled:bg-gray-100 disabled:text-gray-500"
            />
            {editingId && <p className="mt-1 text-xs text-gray-400">Email cannot be changed after creation.</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="INVESTOR">Investor</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button type="submit" disabled={saving} className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
};

export default AdminUsers;