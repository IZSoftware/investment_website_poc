import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import {
  getAdminAssets, createAdminAsset, updateAdminAsset, deleteAdminAsset, updateAdminAssetStatus,
  getAdminAssetSubclasses, createAdminAssetSubclass, updateAdminAssetSubclass, deleteAdminAssetSubclass,
} from '../../api/services';

const emptyValuation = { currency: 'USD', amount: 0, unit: 'MILLIONS', allocationPercent: 0 };

const AdminPortfolio = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // asset form
  const [assetSlideOpen, setAssetSlideOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [assetForm, setAssetForm] = useState({ name: '', description: '', valuation: emptyValuation, enabled: true, subclassesVisible: true, allowsSubclasses: true, sortOrder: 0 });
  const [savingAsset, setSavingAsset] = useState(false);
  const [assetFormError, setAssetFormError] = useState(null);
  const [deletingAssetId, setDeletingAssetId] = useState(null);

  // expanded subclasses per asset
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [subclasses, setSubclasses] = useState([]);
  const [subclassesLoading, setSubclassesLoading] = useState(false);

  // subclass form
  const [subSlideOpen, setSubSlideOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', description: '', valuation: emptyValuation, enabled: true, sortOrder: 0 });
  const [savingSub, setSavingSub] = useState(false);
  const [subFormError, setSubFormError] = useState(null);
  const [deletingSubId, setDeletingSubId] = useState(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminAssets();
      setAssets(Array.isArray(res?.data) ? res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  // ---- Asset form handlers ----
  const openCreateAsset = () => {
    setEditingAssetId(null);
    setAssetForm({ name: '', description: '', valuation: emptyValuation, enabled: true, subclassesVisible: true, allowsSubclasses: true, sortOrder: 0 });
    setAssetFormError(null);
    setAssetSlideOpen(true);
  };

  const openEditAsset = (asset) => {
    setEditingAssetId(asset.id);
    setAssetForm({
      name: asset.name ?? '',
      description: asset.description ?? '',
      valuation: { ...emptyValuation, ...asset.valuation },
      enabled: asset.enabled ?? true,
      subclassesVisible: asset.subclassesVisible ?? true,
      allowsSubclasses: asset.allowsSubclasses ?? true,
      sortOrder: asset.sortOrder ?? 0,
    });
    setAssetFormError(null);
    setAssetSlideOpen(true);
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    setSavingAsset(true);
    setAssetFormError(null);
    try {
      const payload = { ...assetForm, sortOrder: Number(assetForm.sortOrder) || 0 };
      if (editingAssetId) {
        await updateAdminAsset({ id: editingAssetId, ...payload });
      } else {
        await createAdminAsset(payload);
      }
      setAssetSlideOpen(false);
      await fetchAssets();
    } catch (err) {
      console.error(err);
      // "Fund of Funds" forces allowsSubclasses=false server-side — not an error, just reflect it
      setAssetFormError(err?.response?.data?.message || 'Could not save this asset.');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Delete this asset class? This also removes its subclasses. This cannot be undone.')) return;
    setDeletingAssetId(id);
    try {
      await deleteAdminAsset({ id });
      if (expandedAssetId === id) setExpandedAssetId(null);
      await fetchAssets();
    } catch (err) {
      console.error(err);
      alert('Could not delete this asset.');
    } finally {
      setDeletingAssetId(null);
    }
  };

  const toggleAssetEnabled = async (asset) => {
    try {
      await updateAdminAssetStatus({ id: asset.id, enabled: !asset.enabled });
      await fetchAssets();
    } catch (err) {
      console.error(err);
      alert('Could not update status.');
    }
  };

  // ---- Subclass handlers ----
  const toggleExpand = async (asset) => {
    if (expandedAssetId === asset.id) {
      setExpandedAssetId(null);
      return;
    }
    setExpandedAssetId(asset.id);
    setSubclassesLoading(true);
    try {
      const res = await getAdminAssetSubclasses({ assetId: asset.id });
      setSubclasses(Array.isArray(res?.data) ? res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
    } catch (err) {
      console.error(err);
      setSubclasses([]);
    } finally {
      setSubclassesLoading(false);
    }
  };

  const refreshSubclasses = async (assetId) => {
    const res = await getAdminAssetSubclasses({ assetId });
    setSubclasses(Array.isArray(res?.data) ? res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
  };

  const openCreateSub = () => {
    setEditingSubId(null);
    setSubForm({ name: '', description: '', valuation: emptyValuation, enabled: true, sortOrder: 0 });
    setSubFormError(null);
    setSubSlideOpen(true);
  };

  const openEditSub = (sub) => {
    setEditingSubId(sub.id);
    setSubForm({
      name: sub.name ?? '',
      description: sub.description ?? '',
      valuation: { ...emptyValuation, ...sub.valuation },
      enabled: sub.enabled ?? true,
      sortOrder: sub.sortOrder ?? 0,
    });
    setSubFormError(null);
    setSubSlideOpen(true);
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    setSavingSub(true);
    setSubFormError(null);
    try {
      const payload = { ...subForm, sortOrder: Number(subForm.sortOrder) || 0 };
      if (editingSubId) {
        await updateAdminAssetSubclass({ id: editingSubId, ...payload });
      } else {
        await createAdminAssetSubclass({ assetId: expandedAssetId, ...payload });
      }
      setSubSlideOpen(false);
      await refreshSubclasses(expandedAssetId);
    } catch (err) {
      console.error(err);
      // 400 here likely means allowsSubclasses is false on the parent asset
      setSubFormError(err?.response?.data?.message || 'Could not save this subclass.');
    } finally {
      setSavingSub(false);
    }
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Delete this subclass? This cannot be undone.')) return;
    setDeletingSubId(id);
    try {
      await deleteAdminAssetSubclass({ id });
      await refreshSubclasses(expandedAssetId);
    } catch (err) {
      console.error(err);
      alert('Could not delete this subclass.');
    } finally {
      setDeletingSubId(null);
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Portfolio</h1>
              <p className="mt-2 text-gray-500">Asset classes shown on your Total Portfolio and About pages.</p>
            </div>
            <button onClick={openCreateAsset} className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
              + Add Asset
            </button>
          </div>

          {error && <p className="px-4 pb-4 text-sm text-red-600 sm:px-6 lg:px-0">{error}</p>}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold">Asset Class</th>
                    <th className="px-6 py-3 font-semibold">Valuation</th>
                    <th className="px-6 py-3 font-semibold">Allocation %</th>
                    <th className="px-6 py-3 font-semibold">Enabled</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : assets.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No asset classes found</td></tr>
                  ) : (
                    assets.map((asset) => (
                      <React.Fragment key={asset.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <button onClick={() => toggleExpand(asset)} className="flex items-center gap-2 hover:text-[#0A2540]">
                              <span className={`transition-transform ${expandedAssetId === asset.id ? 'rotate-90' : ''}`}>▶</span>
                              {asset.name}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{asset.valuation?.displayText}</td>
                          <td className="px-6 py-4 text-gray-600">{asset.valuation?.allocationPercent}%</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleAssetEnabled(asset)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${asset.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {asset.enabled ? 'Yes' : 'No'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button onClick={() => openEditAsset(asset)} className="mr-4 font-semibold text-[#0A2540] hover:text-[#003852]">Edit</button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              disabled={deletingAssetId === asset.id}
                              className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {deletingAssetId === asset.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </td>
                        </tr>

                        {expandedAssetId === asset.id && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-700">Subclasses</h4>
                                {asset.allowsSubclasses ? (
                                  <button onClick={openCreateSub} className="text-xs font-semibold text-[#0A2540] hover:text-[#003852]">
                                    + Add Subclass
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">Subclasses disabled for this asset</span>
                                )}
                              </div>

                              {subclassesLoading ? (
                                <p className="text-xs text-gray-400">Loading…</p>
                              ) : subclasses.length === 0 ? (
                                <p className="text-xs text-gray-400">No subclasses yet.</p>
                              ) : (
                                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-2 font-semibold">Name</th>
                                        <th className="px-4 py-2 font-semibold">Valuation</th>
                                        <th className="px-4 py-2 font-semibold">Enabled</th>
                                        <th className="px-4 py-2 font-semibold text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {subclasses.map((sub) => (
                                        <tr key={sub.id}>
                                          <td className="px-4 py-2 font-medium text-gray-900">{sub.name}</td>
                                          <td className="px-4 py-2 text-gray-600">{sub.valuation?.displayText}</td>
                                          <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded-full font-semibold ${sub.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                              {sub.enabled ? 'Yes' : 'No'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-right whitespace-nowrap">
                                            <button onClick={() => openEditSub(sub)} className="mr-3 font-semibold text-[#0A2540] hover:text-[#003852]">Edit</button>
                                            <button
                                              onClick={() => handleDeleteSub(sub.id)}
                                              disabled={deletingSubId === sub.id}
                                              className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                                            >
                                              {deletingSubId === sub.id ? 'Deleting…' : 'Delete'}
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {/* Asset form */}
      <SlideOver open={assetSlideOpen} title={editingAssetId ? 'Edit Asset' : 'Add Asset'} onClose={() => setAssetSlideOpen(false)}>
        <form onSubmit={handleAssetSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
            <input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Description</label>
            <textarea value={assetForm.description} onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Amount</label>
              <input type="number" value={assetForm.valuation.amount} onChange={(e) => setAssetForm({ ...assetForm, valuation: { ...assetForm.valuation, amount: Number(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Unit</label>
              <select value={assetForm.valuation.unit} onChange={(e) => setAssetForm({ ...assetForm, valuation: { ...assetForm.valuation, unit: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
                <option value="THOUSANDS">Thousands</option>
                <option value="MILLIONS">Millions</option>
                <option value="BILLIONS">Billions</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Allocation %</label>
            <input type="number" value={assetForm.valuation.allocationPercent} onChange={(e) => setAssetForm({ ...assetForm, valuation: { ...assetForm.valuation, allocationPercent: Number(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Sort Order</label>
            <input type="number" value={assetForm.sortOrder} onChange={(e) => setAssetForm({ ...assetForm, sortOrder: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={assetForm.enabled} onChange={(e) => setAssetForm({ ...assetForm, enabled: e.target.checked })} />
            Enabled
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={assetForm.subclassesVisible} onChange={(e) => setAssetForm({ ...assetForm, subclassesVisible: e.target.checked })} />
            Subclasses Visible (on public site)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={assetForm.allowsSubclasses} onChange={(e) => setAssetForm({ ...assetForm, allowsSubclasses: e.target.checked })} />
            Allows Subclasses
          </label>
          <p className="text-xs text-gray-400">Note: an asset named "Fund of Funds" is forced to disallow subclasses by the server regardless of this setting.</p>

          {assetFormError && <p className="text-sm text-red-600">{assetFormError}</p>}

          <button type="submit" disabled={savingAsset} className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
            {savingAsset ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>

      {/* Subclass form */}
      <SlideOver open={subSlideOpen} title={editingSubId ? 'Edit Subclass' : 'Add Subclass'} onClose={() => setSubSlideOpen(false)}>
        <form onSubmit={handleSubSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
            <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Description</label>
            <textarea value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Amount</label>
              <input type="number" value={subForm.valuation.amount} onChange={(e) => setSubForm({ ...subForm, valuation: { ...subForm.valuation, amount: Number(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Unit</label>
              <select value={subForm.valuation.unit} onChange={(e) => setSubForm({ ...subForm, valuation: { ...subForm.valuation, unit: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
                <option value="THOUSANDS">Thousands</option>
                <option value="MILLIONS">Millions</option>
                <option value="BILLIONS">Billions</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Sort Order</label>
            <input type="number" value={subForm.sortOrder} onChange={(e) => setSubForm({ ...subForm, sortOrder: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={subForm.enabled} onChange={(e) => setSubForm({ ...subForm, enabled: e.target.checked })} />
            Enabled
          </label>

          {subFormError && <p className="text-sm text-red-600">{subFormError}</p>}

          <button type="submit" disabled={savingSub} className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
            {savingSub ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
};

export default AdminPortfolio;