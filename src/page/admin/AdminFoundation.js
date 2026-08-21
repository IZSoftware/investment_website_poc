import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { getAdminFoundation, updateAdminFoundation } from '../../api/services';

const AdminFoundation = () => {
  const [form, setForm] = useState({ title: '', body: '', ctaLabel: '', ctaUrl: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await getAdminFoundation();
        if (isMounted && res?.data) setForm(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateAdminFoundation(form);
      setMessage({ type: 'success', text: 'Foundation content updated.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Could not save changes.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Foundation</h1>
            <p className="mt-2 text-gray-500">Philanthropy section shown on your homepage.</p>
          </div>

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            {loading ? (
              <div className="py-10 text-center text-gray-400">Loading…</div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl p-8 space-y-5 bg-white border border-gray-200 shadow-lg rounded-xl">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Title</label>
                  <input value={form.title ?? ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Body</label>
                  <textarea rows={5} value={form.body ?? ''} onChange={(e) => handleChange('body', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Button Label</label>
                  <input value={form.ctaLabel ?? ''} onChange={(e) => handleChange('ctaLabel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Button Link</label>
                  <input value={form.ctaUrl ?? ''} onChange={(e) => handleChange('ctaUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Image URL</label>
                  <input value={form.imageUrl ?? ''} onChange={(e) => handleChange('imageUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                </div>

                {message && (
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
                )}

                <button type="submit" disabled={saving} className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default AdminFoundation;