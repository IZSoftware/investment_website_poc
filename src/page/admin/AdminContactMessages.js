import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { getAdminContactMessages, deleteAdminContactMessage, markAdminContactMessageAsRead } from '../../api/services';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getAdminContactMessages({ page: 0, size: 50 });
      const list = res?.data?.content ?? res?.data ?? [];
      setMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await markAdminContactMessageAsRead({ id: msg.id });
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    setDeletingId(id);
    try {
      await deleteAdminContactMessage({ id });
      setSelected(null);
      await fetchMessages();
    } catch (err) {
      console.error(err);
      alert('Could not delete this message.');
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact Messages</h1>
            <p className="mt-2 text-gray-500">Enquiries submitted through the public contact form.</p>
          </div>

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold"></th>
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Subject</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : messages.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No messages yet</td></tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openMessage(msg)}>
                        <td className="px-6 py-4">{!msg.read && <span className="w-2 h-2 bg-[#0A2540] rounded-full inline-block" />}</td>
                        <td className={`px-6 py-4 ${!msg.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{msg.fullName}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{msg.subject}</td>
                        <td className="px-6 py-4 text-gray-500">{msg.createdAt?.slice(0, 10)}</td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            disabled={deletingId === msg.id}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === msg.id ? 'Deleting…' : 'Delete'}
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

      <SlideOver open={!!selected} title={selected?.subject ?? 'Message'} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div><span className="font-semibold text-gray-700">From:</span> {selected.fullName}</div>
            <div><span className="font-semibold text-gray-700">Email:</span> {selected.email}</div>
            {selected.phone && <div><span className="font-semibold text-gray-700">Phone:</span> {selected.phone}</div>}
            <div><span className="font-semibold text-gray-700">Date:</span> {selected.createdAt?.slice(0, 10)}</div>
            <div className="pt-4 border-t border-gray-200">
              <p className="mb-1 font-semibold text-gray-700">Message:</p>
              <p className="text-gray-600 whitespace-pre-line">{selected.message}</p>
            </div>
            <button
              onClick={() => handleDelete(selected.id)}
              className="w-full py-2.5 mt-4 font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Delete Message
            </button>
          </div>
        )}
      </SlideOver>
    </div>
  );
};

export default AdminContactMessages;