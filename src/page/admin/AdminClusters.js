import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { getAdminClusters, createAdminCluster, updateAdminCluster, deleteAdminCluster, updateAdminClusterStatus } from '../../api/services';

const emptyValuation = { currency: 'USD', amount: 0, unit: 'MILLIONS', allocationPercent: 0 };
const emptyClusterForm = { name: '', icon: '', description: '', publicDescription: '', companies: [], valuation: emptyValuation, enabled: true, sortOrder: 0 };

const CompaniesEditor = ({ companies, onChange }) => {
  const updateCompany = (index, field, value) => {
    const next = companies.slice();
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };
  const addCompany = () => onChange([...companies, { name: '', link: '', logo: '' }]);
  const removeCompany = (index) => onChange(companies.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {companies.map((company, index) => (
        <div key={company.id ?? `new-${index}`} className="p-3 space-y-2 border border-gray-200 rounded-lg bg-gray-50">
          <input type="text" placeholder="Company name" value={company.name ?? ''} onChange={(e) => updateCompany(index, 'name', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          <input type="text" placeholder="Link (https://…)" value={company.link ?? ''} onChange={(e) => updateCompany(index, 'link', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          <input type="text" placeholder="Logo URL" value={company.logo ?? ''} onChange={(e) => updateCompany(index, 'logo', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          <button type="button" onClick={() => removeCompany(index)} className="text-xs font-semibold text-red-600 hover:text-red-800">Remove</button>
        </div>
      ))}
      <button type="button" onClick={addCompany} className="text-sm font-semibold text-[#0A2540] hover:text-[#003852]">+ Add Company</button>
    </div>
  );
};

const AdminClusters = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyClusterForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchClusters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminClusters();
      setClusters(Array.isArray(res?.data) ? res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load clusters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClusters(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyClusterForm);
    setFormError(null);
    setSlideOpen(true);
  };

  const openEdit = (cluster) => {
    setEditingId(cluster.id);
    setForm({
      name: cluster.name ?? '',
      icon: cluster.icon ?? '',
      description: cluster.description ?? '',
      publicDescription: cluster.publicDescription ?? '',
      companies: Array.isArray(cluster.companies) ? cluster.companies : [],
      valuation: { ...emptyValuation, ...cluster.valuation },
      enabled: cluster.enabled ?? true,
      sortOrder: cluster.sortOrder ?? 0,
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
        await updateAdminCluster({ id: editingId, ...payload });
      } else {
        await createAdminCluster(payload);
      }
      setSlideOpen(false);
      await fetchClusters();
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || 'Could not save this cluster.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cluster? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteAdminCluster({ id });
      await fetchClusters();
    } catch (err) {
      console.error(err);
      alert('Could not delete this cluster.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEnabled = async (cluster) => {
    try {
      await updateAdminClusterStatus({ id: cluster.id, enabled: !cluster.enabled });
      await fetchClusters();
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Clusters</h1>
              <p className="mt-2 text-gray-500">Investment sectors shown on your homepage and Clusters page.</p>
            </div>
            <button onClick={openCreate} className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
              + Add Cluster
            </button>
          </div>

          {error && <p className="px-4 pb-4 text-sm text-red-600 sm:px-6 lg:px-0">{error}</p>}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                    <th className="px-6 py-3 font-semibold">Valuation</th>
                    <th className="px-6 py-3 font-semibold">Companies</th>
                    <th className="px-6 py-3 font-semibold">Enabled</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : clusters.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No clusters found</td></tr>
                  ) : (
                    clusters.map((cluster) => (
                      <tr key={cluster.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{cluster.name}</td>
                        <td className="max-w-sm px-6 py-4 text-gray-600 truncate">{cluster.publicDescription}</td>
                        <td className="px-6 py-4 text-gray-600">{cluster.valuation?.displayText}</td>
                        <td className="px-6 py-4 text-gray-600">{cluster.companies?.length ?? 0}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleEnabled(cluster)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cluster.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {cluster.enabled ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openEdit(cluster)} className="mr-4 font-semibold text-[#0A2540] hover:text-[#003852]">Edit</button>
                          <button
                            onClick={() => handleDelete(cluster.id)}
                            disabled={deletingId === cluster.id}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === cluster.id ? 'Deleting…' : 'Delete'}
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

      <SlideOver open={slideOpen} title={editingId ? 'Edit Cluster' : 'Add Cluster'} onClose={() => setSlideOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Icon</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Internal Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Public Description (marketing blurb)</label>
            <textarea value={form.publicDescription} onChange={(e) => setForm({ ...form, publicDescription: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
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

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Companies</label>
            <CompaniesEditor companies={form.companies} onChange={(next) => setForm({ ...form, companies: next })} />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button type="submit" disabled={saving} className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
};

export default AdminClusters;