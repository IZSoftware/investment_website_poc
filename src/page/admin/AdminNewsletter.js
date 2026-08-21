import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { getAdminNewsletter, deleteAdminNewsletter } from '../../api/services';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await getAdminNewsletter();
      setSubscribers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    setDeletingId(id);
    try {
      await deleteAdminNewsletter({ id });
      await fetchSubscribers();
    } catch (err) {
      console.error(err);
      alert('Could not remove this subscriber.');
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
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Newsletter Subscribers</h1>
            <p className="mt-2 text-gray-500">People who signed up for updates through the homepage.</p>
          </div>

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Subscribed</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : subscribers.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No subscribers yet</td></tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{sub.fullName}</td>
                        <td className="px-6 py-4 text-gray-600">{sub.email}</td>
                        <td className="px-6 py-4 text-gray-500">{sub.createdAt?.slice(0, 10)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(sub.id)}
                            disabled={deletingId === sub.id}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === sub.id ? 'Removing…' : 'Remove'}
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
    </div>
  );
};

export default AdminNewsletter;