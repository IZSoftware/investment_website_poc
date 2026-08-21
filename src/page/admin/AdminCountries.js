import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { getAdminCountries, createAdminCountry, updateAdminCountry, deleteAdminCountry, updateAdminCountryStatus } from '../../api/services';

const emptyValuation = { currency: 'USD', amount: 0, unit: 'MILLIONS', allocationPercent: 0 };
const emptyForm = { name: '', valuation: emptyValuation, enabled: true, sortOrder: 0 };

const AdminCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminCountries();
      setCountries(Array.isArray(res?.data) ? res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load countries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCountries(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setSlideOpen(true);
  };

  const openEdit = (country) => {
    setEditingId(country.id);
    setForm({
      name: country.name ?? '',
      valuation: { ...emptyValuation, ...country.valuation },
      enabled: country.enabled ?? true,
      sortOrder: country.sortOrder ?? 0,
    });
    setFormError(null);
    setSlideOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (editingId) {
        await updateAdminCountry({ id: editingId, ...payload });
      } else {
        await createAdminCountry(payload);
      }
      setSlideOpen(false);
      await fetchCountries();
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || 'Could not save this country.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this country? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteAdminCountry({ id });
      await fetchCountries();
    } catch (err) {
      console.error(err);
      alert('Could not delete this country.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEnabled = async (country) => {
    try {
      await updateAdminCountryStatus({ id: country.id, enabled: !country.enabled });
      await fetchCountries();
    } catch (err) {
      console.error(err);
      alert('Could not update status.');
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Countries</h1>
              <p className="mt-2 text-gray-500">Markets shown on your Total Portfolio page.</p>
            </div>
            <button onClick={openCreate} className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
              + Add Country
            </button>
          </div>

          {error && <p className="px-4 pb-4 text-sm text-red-600 sm:px-6 lg:px-0">{error}</p>}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold">Country</th>
                    <th className="px-6 py-3 font-semibold">Valuation</th>
                    <th className="px-6 py-3 font-semibold">Allocation %</th>
                    <th className="px-6 py-3 font-semibold">Order</th>
                    <th className="px-6 py-3 font-semibold">Enabled</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : countries.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No countries found</td></tr>
                  ) : (
                    countries.map((country) => (
                      <tr key={country.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{country.name}</td>
                        <td className="px-6 py-4 text-gray-600">{country.valuation?.displayText}</td>
                        <td className="px-6 py-4 text-gray-600">{country.valuation?.allocationPercent}%</td>
                        <td className="px-6 py-4 text-gray-600">{country.sortOrder}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleEnabled(country)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${country.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {country.enabled ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openEdit(country)} className="mr-4 font-semibold text-[#0A2540] hover:text-[#003852]">Edit</button>
                          <button
                            onClick={() => handleDelete(country.id)}
                            disabled={deletingId === country.id}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === country.id ? 'Deleting…' : 'Delete'}
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

      <SlideOver open={slideOpen} title={editingId ? 'Edit Country' : 'Add Country'} onClose={() => setSlideOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Amount</label>
              <input type="number" value={form.valuation.amount} onChange={(e) => setForm({ ...form, valuation: { ...form.valuation, amount: Number(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Unit</label>
              <select value={form.valuation.unit} onChange={(e) => setForm({ ...form, valuation: { ...form.valuation, unit: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
                <option value="THOUSANDS">Thousands</option>
                <option value="MILLIONS">Millions</option>
                <option value="BILLIONS">Billions</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Allocation %</label>
            <input type="number" value={form.valuation.allocationPercent} onChange={(e) => setForm({ ...form, valuation: { ...form.valuation, allocationPercent: Number(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            Enabled
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

export default AdminCountries;