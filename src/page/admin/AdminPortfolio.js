import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { useAdminCrud } from '../../hooks/useAdminCrud';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminAssets,
  createAdminAsset,
  updateAdminAsset,
  deleteAdminAsset,
  updateAdminAssetStatus,
  getAdminAssetSubclasses,
  createAdminAssetSubclass,
  updateAdminAssetSubclass,
  deleteAdminAssetSubclass,
  updateAdminAssetSubclassStatus,
} from '../../api/services';
import {
  VALUATION_UNITS,
  CURRENCY_OPTIONS,
  parseValuation,
  buildValuation,
  formatAsAtDate,
} from '../../utils/valuation';

const INPUT_CLASS =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]';

// Portfolio writes: everyone but DEV. Deletes exclude FINANCIAL_ADMIN (README §8.1).
const CAN_WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'INVESTOR'];
const CAN_DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'INVESTOR'];

const emptyAssetForm = () => ({
  name: '',
  description: '',
  valuation: parseValuation(null),
  enabled: true,
  subclassesVisible: true,
  allowsSubclasses: true,
  sortOrder: '',
});

const fromAsset = (asset) => ({
  name: asset.name ?? '',
  description: asset.description ?? '',
  valuation: parseValuation(asset.valuation),
  enabled: asset.enabled ?? true,
  subclassesVisible: asset.subclassesVisible ?? true,
  allowsSubclasses: asset.allowsSubclasses ?? true,
  sortOrder: asset.sortOrder ?? '',
});

const emptySubclassForm = () => ({
  name: '',
  description: '',
  valuation: parseValuation(null),
  enabled: true,
  sortOrder: '',
});

const fromSubclass = (subclass) => ({
  name: subclass.name ?? '',
  description: subclass.description ?? '',
  valuation: parseValuation(subclass.valuation),
  enabled: subclass.enabled ?? true,
  sortOrder: subclass.sortOrder ?? '',
});

const matchesField = (field, name) =>
  field === name || field?.startsWith(`${name}.`) || field?.startsWith(`${name}[`);

const badgeClass = (on) =>
  `text-xs font-semibold px-2.5 py-1 rounded-full ${on ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`;

const Toggle = ({ on, disabled, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`relative inline-flex h-6 w-11 items-center rounded-full align-middle transition-colors disabled:opacity-50 ${
      on ? 'bg-emerald-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        on ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const ConfirmDialog = ({ open, title, message, confirmLabel, busy, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Shared valuation editor for both the asset and the subclass form.
const ValuationFields = ({ value, onChange, amountError }) => (
  <>
    <div>
      <label className="block mb-1.5 text-sm font-medium text-gray-700">Valuation</label>
      <div className="grid grid-cols-12 gap-2">
        <select
          value={value?.currency ?? 'USD'}
          onChange={(e) => onChange('currency', e.target.value)}
          className={`col-span-3 ${INPUT_CLASS} border-gray-300`}
        >
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={value?.amount ?? ''}
          onChange={(e) => onChange('amount', e.target.value)}
          className={`col-span-5 ${INPUT_CLASS} ${amountError ? 'border-red-500' : 'border-gray-300'}`}
        />
        <select
          value={value?.unit ?? 'BILLIONS'}
          onChange={(e) => onChange('unit', e.target.value)}
          className={`col-span-4 ${INPUT_CLASS} border-gray-300`}
        >
          {VALUATION_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>
      {amountError && <p className="mt-1 text-xs text-red-600">{amountError}</p>}
      <p className="mt-1 text-xs text-gray-400">
        The formatted valuation label is generated by the server after saving.
      </p>
    </div>

    <div>
      <label className="block mb-1.5 text-sm font-medium text-gray-700">Allocation %</label>
      <input
        type="number"
        min="0"
        max="100"
        step="0.01"
        value={value?.allocationPercent ?? ''}
        onChange={(e) => onChange('allocationPercent', e.target.value)}
        className={`${INPUT_CLASS} border-gray-300`}
      />
    </div>

    <div>
      <label className="block mb-1.5 text-sm font-medium text-gray-700">As at date</label>
      <DatePicker
        selected={value?.asAtDate ?? null}
        onChange={(date) => onChange('asAtDate', date)}
        dateFormat="MMMM d, yyyy"
        placeholderText="Select date"
        className={`${INPUT_CLASS} border-gray-300`}
        wrapperClassName="w-full"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={15}
        scrollableYearDropdown
        maxDate={new Date()}
      />
    </div>
  </>
);

const AdminPortfolio = () => {
  const { userRole } = useAuth();
  const canWrite = CAN_WRITE_ROLES.includes(userRole);
  const canDelete = CAN_DELETE_ROLES.includes(userRole);

  const { items: assets, loading, error, fetchItems, saveItem, removeItem } = useAdminCrud({
    list: getAdminAssets,
    create: createAdminAsset,
    update: updateAdminAsset,
    remove: deleteAdminAsset,
  });

  const [actionError, setActionError] = useState(null);
  const [serverNotice, setServerNotice] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Asset form
  const [assetSlideOpen, setAssetSlideOpen] = useState(false);
  const [assetEditingId, setAssetEditingId] = useState(null);
  const [assetForm, setAssetForm] = useState(emptyAssetForm());
  const [assetSaving, setAssetSaving] = useState(false);
  const [assetFormError, setAssetFormError] = useState(null);
  const [assetFieldErrors, setAssetFieldErrors] = useState([]);

  // Subclass drill-down: { [assetId]: { loading, error, items } }
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [subclassState, setSubclassState] = useState({});

  // Subclass form
  const [subclassSlideOpen, setSubclassSlideOpen] = useState(false);
  const [subclassAssetId, setSubclassAssetId] = useState(null);
  const [subclassEditingId, setSubclassEditingId] = useState(null);
  const [subclassForm, setSubclassForm] = useState(emptySubclassForm());
  const [subclassSaving, setSubclassSaving] = useState(false);
  const [subclassFormError, setSubclassFormError] = useState(null);
  const [subclassFieldErrors, setSubclassFieldErrors] = useState([]);

  // Delete confirmations
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [subclassToDelete, setSubclassToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const assetErrorFor = (name) => assetFieldErrors.find((e) => matchesField(e?.field, name))?.message;
  const subclassErrorFor = (name) => subclassFieldErrors.find((e) => matchesField(e?.field, name))?.message;

  const loadSubclasses = async (assetId) => {
    setSubclassState((prev) => ({
      ...prev,
      [assetId]: { loading: true, error: null, items: prev[assetId]?.items ?? [] },
    }));
    try {
      const envelope = await getAdminAssetSubclasses({ assetId });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Failed to load subclasses.');
      setSubclassState((prev) => ({
        ...prev,
        [assetId]: { loading: false, error: null, items: Array.isArray(envelope?.data) ? envelope.data : [] },
      }));
    } catch (err) {
      console.error(err);
      setSubclassState((prev) => ({
        ...prev,
        [assetId]: {
          loading: false,
          error: err.response?.data?.message || err.message || 'Failed to load subclasses.',
          items: prev[assetId]?.items ?? [],
        },
      }));
    }
  };

  const toggleExpand = (asset) => {
    if (expandedAssetId === asset.id) {
      setExpandedAssetId(null);
      return;
    }
    setExpandedAssetId(asset.id);
    if (!subclassState[asset.id]) loadSubclasses(asset.id);
  };

  /* ---------------- asset CRUD ---------------- */

  const openAssetCreate = () => {
    setAssetEditingId(null);
    setAssetForm(emptyAssetForm());
    setAssetFormError(null);
    setAssetFieldErrors([]);
    setAssetSlideOpen(true);
  };

  const openAssetEdit = (asset) => {
    setAssetEditingId(asset.id);
    setAssetForm(fromAsset(asset));
    setAssetFormError(null);
    setAssetFieldErrors([]);
    setAssetSlideOpen(true);
  };

  const setAssetField = (name, value) => setAssetForm((prev) => ({ ...prev, [name]: value }));
  const setAssetValuation = (key, value) =>
    setAssetForm((prev) => ({ ...prev, valuation: { ...prev.valuation, [key]: value } }));

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    setAssetSaving(true);
    setAssetFormError(null);
    setAssetFieldErrors([]);
    setServerNotice(null);
    try {
      const payload = {
        name: assetForm.name,
        description: assetForm.description,
        valuation: buildValuation({
          currency: assetForm.valuation?.currency,
          amount: assetForm.valuation?.amount,
          unit: assetForm.valuation?.unit,
          allocationPercent: assetForm.valuation?.allocationPercent,
          asAtDate: formatAsAtDate(assetForm.valuation?.asAtDate),
        }),
        enabled: !!assetForm.enabled,
        subclassesVisible: !!assetForm.subclassesVisible,
        allowsSubclasses: !!assetForm.allowsSubclasses,
        sortOrder: assetForm.sortOrder === '' ? 0 : Number(assetForm.sortOrder),
      };
      const envelope = await saveItem(payload, assetEditingId);
      const saved = envelope?.data;
      // The server forces allowsSubclasses:false on "Fund of Funds" assets —
      // show what came back, never the request.
      if (saved && payload.allowsSubclasses && saved.allowsSubclasses === false) {
        setServerNotice(
          `Saved: the server disabled subclasses on "${saved.name ?? payload.name}". Assets named “Fund of Funds” can never have subclasses.`
        );
      } else if (saved && payload.subclassesVisible !== saved.subclassesVisible) {
        setServerNotice(
          `Saved: the server set “subclasses visible” to ${saved.subclassesVisible ? 'on' : 'off'} on "${saved.name ?? payload.name}".`
        );
      }
      if (saved?.id && subclassState[saved.id]) loadSubclasses(saved.id);
      setAssetSlideOpen(false);
    } catch (err) {
      console.error(err);
      setAssetFormError(err.message || 'Could not save this asset.');
      setAssetFieldErrors(err.fieldErrors ?? []);
    } finally {
      setAssetSaving(false);
    }
  };

  const handleAssetToggle = async (asset) => {
    setTogglingId(asset.id);
    setActionError(null);
    try {
      const envelope = await updateAdminAssetStatus({ id: asset.id, enabled: !asset.enabled });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Could not change the status.');
      await fetchItems();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || 'Could not change the status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAssetDelete = async () => {
    if (!assetToDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await removeItem(assetToDelete.id);
      setSubclassState((prev) => {
        const next = { ...prev };
        delete next[assetToDelete.id];
        return next;
      });
      if (expandedAssetId === assetToDelete.id) setExpandedAssetId(null);
      setAssetToDelete(null);
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Could not delete this asset.');
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- subclass CRUD ---------------- */

  const openSubclassCreate = (asset) => {
    setSubclassAssetId(asset.id);
    setSubclassEditingId(null);
    setSubclassForm(emptySubclassForm());
    setSubclassFormError(null);
    setSubclassFieldErrors([]);
    setSubclassSlideOpen(true);
  };

  const openSubclassEdit = (asset, subclass) => {
    setSubclassAssetId(asset.id);
    setSubclassEditingId(subclass.id);
    setSubclassForm(fromSubclass(subclass));
    setSubclassFormError(null);
    setSubclassFieldErrors([]);
    setSubclassSlideOpen(true);
  };

  const setSubclassField = (name, value) => setSubclassForm((prev) => ({ ...prev, [name]: value }));
  const setSubclassValuation = (key, value) =>
    setSubclassForm((prev) => ({ ...prev, valuation: { ...prev.valuation, [key]: value } }));

  const handleSubclassSubmit = async (e) => {
    e.preventDefault();
    setSubclassSaving(true);
    setSubclassFormError(null);
    setSubclassFieldErrors([]);
    try {
      const payload = {
        name: subclassForm.name,
        description: subclassForm.description,
        valuation: buildValuation({
          currency: subclassForm.valuation?.currency,
          amount: subclassForm.valuation?.amount,
          unit: subclassForm.valuation?.unit,
          allocationPercent: subclassForm.valuation?.allocationPercent,
          asAtDate: formatAsAtDate(subclassForm.valuation?.asAtDate),
        }),
        enabled: !!subclassForm.enabled,
        sortOrder: subclassForm.sortOrder === '' ? 0 : Number(subclassForm.sortOrder),
      };
      const envelope = subclassEditingId
        ? await updateAdminAssetSubclass({ id: subclassEditingId, ...payload })
        : await createAdminAssetSubclass({ assetId: subclassAssetId, ...payload });
      if (envelope?.success === false) {
        const failure = new Error(envelope?.message || 'Could not save this subclass.');
        failure.fieldErrors = envelope?.errors ?? [];
        throw failure;
      }
      await loadSubclasses(subclassAssetId);
      setSubclassSlideOpen(false);
    } catch (err) {
      console.error(err);
      setSubclassFormError(err.response?.data?.message || err.message || 'Could not save this subclass.');
      setSubclassFieldErrors(err.response?.data?.errors ?? err.fieldErrors ?? []);
    } finally {
      setSubclassSaving(false);
    }
  };

  const handleSubclassToggle = async (assetId, subclass) => {
    setTogglingId(subclass.id);
    setActionError(null);
    try {
      const envelope = await updateAdminAssetSubclassStatus({ id: subclass.id, enabled: !subclass.enabled });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Could not change the status.');
      await loadSubclasses(assetId);
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || 'Could not change the status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubclassDelete = async () => {
    if (!subclassToDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      const envelope = await deleteAdminAssetSubclass({ id: subclassToDelete.subclass.id });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Could not delete this subclass.');
      await loadSubclasses(subclassToDelete.assetId);
      setSubclassToDelete(null);
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || 'Could not delete this subclass.');
    } finally {
      setDeleting(false);
    }
  };

  const subclassCount = (asset) => asset.subclasses?.length ?? subclassState[asset.id]?.items?.length;
  const columnCount = 7 + (canWrite ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Portfolio</h1>
              <p className="mt-2 text-gray-500">
                Asset classes and their subclasses. Expand an asset to manage its subclasses — nesting stops there.
              </p>
            </div>
            {canWrite && (
              <button
                onClick={openAssetCreate}
                className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Asset
              </button>
            )}
          </div>

          {(error || actionError) && (
            <div className="px-4 pb-4 sm:px-6 lg:px-0">
              <p className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
                {error || actionError}
              </p>
            </div>
          )}

          {serverNotice && (
            <div className="px-4 pb-4 sm:px-6 lg:px-0">
              <p className="px-4 py-3 text-sm text-yellow-800 border border-yellow-200 rounded-xl bg-yellow-50">
                {serverNotice}
              </p>
            </div>
          )}

          {!canWrite && (
            <div className="px-4 pb-4 sm:px-6 lg:px-0">
              <p className="text-sm text-gray-500">Read-only access — you cannot change these records.</p>
            </div>
          )}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 bg-gray-50">
                      <th className="w-10 px-4 py-3" />
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Asset</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Valuation</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Allocation %</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Subclasses</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Enabled</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Order</th>
                      {canWrite && (
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={columnCount} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                    ) : assets.length === 0 ? (
                      <tr><td colSpan={columnCount} className="px-6 py-10 text-center text-gray-400">No assets yet</td></tr>
                    ) : (
                      assets.map((asset) => {
                        const expanded = expandedAssetId === asset.id;
                        const panel = subclassState[asset.id];
                        const count = subclassCount(asset);
                        return (
                          <React.Fragment key={asset.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(asset)}
                                  title={expanded ? 'Hide subclasses' : 'Show subclasses'}
                                  className="p-1 text-gray-400 rounded hover:text-gray-700 hover:bg-gray-100"
                                >
                                  {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                              <td className="px-6 py-4 text-gray-600">{asset.valuation?.displayText ?? '—'}</td>
                              <td className="px-6 py-4 text-gray-600">
                                {asset.valuation?.allocationPercent === undefined
                                  ? '—'
                                  : `${asset.valuation.allocationPercent}%`}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">{count === undefined ? '—' : count}</span>
                                  <span className={badgeClass(!!asset.subclassesVisible)}>
                                    {asset.subclassesVisible ? 'Visible' : 'Hidden'}
                                  </span>
                                  {!asset.allowsSubclasses && (
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                      Not allowed
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={badgeClass(!!asset.enabled)}>
                                  {asset.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{asset.sortOrder ?? 0}</td>
                              {canWrite && (
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <span className="mr-3">
                                    <Toggle
                                      on={!!asset.enabled}
                                      disabled={togglingId === asset.id}
                                      onClick={() => handleAssetToggle(asset)}
                                      title={asset.enabled ? 'Disable' : 'Enable'}
                                    />
                                  </span>
                                  <button
                                    onClick={() => openAssetEdit(asset)}
                                    title="Edit"
                                    className="p-2 mr-1 text-[#0A2540] hover:bg-gray-100 rounded-lg align-middle"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  {canDelete && (
                                    <button
                                      onClick={() => setAssetToDelete(asset)}
                                      title="Delete"
                                      className="p-2 text-red-600 align-middle rounded-lg hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>

                            {expanded && (
                              <tr className="bg-gray-50">
                                <td colSpan={columnCount} className="px-6 py-5">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900">
                                        Subclasses of {asset.name}
                                      </h4>
                                      {!asset.allowsSubclasses && (
                                        <p className="mt-1 text-xs text-gray-500">
                                          This asset does not allow subclasses, so new ones cannot be added.
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => loadSubclasses(asset.id)}
                                        title="Reload subclasses"
                                        className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                                      >
                                        <RefreshCw size={14} />
                                      </button>
                                      {canWrite && asset.allowsSubclasses && (
                                        <button
                                          type="button"
                                          onClick={() => openSubclassCreate(asset)}
                                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0A2540] hover:bg-[#003852] rounded-lg"
                                        >
                                          <Plus size={14} />
                                          Add subclass
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {panel?.error && (
                                    <p className="px-4 py-3 mb-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
                                      {panel.error}
                                    </p>
                                  )}

                                  <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-left border-b border-gray-200 bg-gray-50">
                                          <th className="px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Name</th>
                                          <th className="px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Valuation</th>
                                          <th className="px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Allocation %</th>
                                          <th className="px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Enabled</th>
                                          <th className="px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Order</th>
                                          {canWrite && (
                                            <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                              Actions
                                            </th>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {panel?.loading ? (
                                          <tr>
                                            <td colSpan={canWrite ? 6 : 5} className="px-4 py-8 text-center text-gray-400">
                                              Loading…
                                            </td>
                                          </tr>
                                        ) : (panel?.items ?? []).length === 0 ? (
                                          <tr>
                                            <td colSpan={canWrite ? 6 : 5} className="px-4 py-8 text-center text-gray-400">
                                              No subclasses yet
                                            </td>
                                          </tr>
                                        ) : (
                                          panel.items.map((subclass) => (
                                            <tr key={subclass.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 font-medium text-gray-900">{subclass.name}</td>
                                              <td className="px-4 py-3 text-gray-600">
                                                {subclass.valuation?.displayText ?? '—'}
                                              </td>
                                              <td className="px-4 py-3 text-gray-600">
                                                {subclass.valuation?.allocationPercent === undefined
                                                  ? '—'
                                                  : `${subclass.valuation.allocationPercent}%`}
                                              </td>
                                              <td className="px-4 py-3">
                                                <span className={badgeClass(!!subclass.enabled)}>
                                                  {subclass.enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-gray-600">{subclass.sortOrder ?? 0}</td>
                                              {canWrite && (
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                  <span className="mr-3">
                                                    <Toggle
                                                      on={!!subclass.enabled}
                                                      disabled={togglingId === subclass.id}
                                                      onClick={() => handleSubclassToggle(asset.id, subclass)}
                                                      title={subclass.enabled ? 'Disable' : 'Enable'}
                                                    />
                                                  </span>
                                                  <button
                                                    onClick={() => openSubclassEdit(asset, subclass)}
                                                    title="Edit"
                                                    className="p-2 mr-1 text-[#0A2540] hover:bg-gray-100 rounded-lg align-middle"
                                                  >
                                                    <Edit2 size={16} />
                                                  </button>
                                                  {canDelete && (
                                                    <button
                                                      onClick={() => setSubclassToDelete({ assetId: asset.id, subclass })}
                                                      title="Delete"
                                                      className="p-2 text-red-600 align-middle rounded-lg hover:bg-red-50"
                                                    >
                                                      <Trash2 size={16} />
                                                    </button>
                                                  )}
                                                </td>
                                              )}
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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

      {/* Asset form */}
      <SlideOver
        open={assetSlideOpen}
        width="lg"
        title={assetEditingId ? 'Edit Asset' : 'Add Asset'}
        onClose={() => setAssetSlideOpen(false)}
      >
        <form onSubmit={handleAssetSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Name<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={assetForm.name}
              onChange={(e) => setAssetField('name', e.target.value)}
              required
              className={`${INPUT_CLASS} ${assetErrorFor('name') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {assetErrorFor('name') && <p className="mt-1 text-xs text-red-600">{assetErrorFor('name')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={assetForm.description}
              onChange={(e) => setAssetField('description', e.target.value)}
              className={`${INPUT_CLASS} ${assetErrorFor('description') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          <ValuationFields
            value={assetForm.valuation}
            onChange={setAssetValuation}
            amountError={assetErrorFor('valuation')}
          />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Sort order</label>
            <input
              type="number"
              value={assetForm.sortOrder}
              onChange={(e) => setAssetField('sortOrder', e.target.value)}
              className={`${INPUT_CLASS} ${assetErrorFor('sortOrder') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={!!assetForm.enabled}
              onChange={(e) => setAssetField('enabled', e.target.checked)}
            />
            Enabled
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={!!assetForm.subclassesVisible}
              onChange={(e) => setAssetField('subclassesVisible', e.target.checked)}
            />
            Subclasses visible on the public site
          </label>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={!!assetForm.allowsSubclasses}
                onChange={(e) => setAssetField('allowsSubclasses', e.target.checked)}
              />
              Allows subclasses
            </label>
            <p className="mt-1 text-xs text-gray-400">
              Assets named “Fund of Funds” are always saved without subclasses, whatever you pick here.
            </p>
          </div>

          {assetFormError && (
            <p className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">{assetFormError}</p>
          )}

          <button
            type="submit"
            disabled={assetSaving}
            className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {assetSaving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>

      {/* Subclass form */}
      <SlideOver
        open={subclassSlideOpen}
        width="lg"
        title={subclassEditingId ? 'Edit Subclass' : 'Add Subclass'}
        onClose={() => setSubclassSlideOpen(false)}
      >
        <form onSubmit={handleSubclassSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Name<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={subclassForm.name}
              onChange={(e) => setSubclassField('name', e.target.value)}
              required
              className={`${INPUT_CLASS} ${subclassErrorFor('name') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {subclassErrorFor('name') && <p className="mt-1 text-xs text-red-600">{subclassErrorFor('name')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={subclassForm.description}
              onChange={(e) => setSubclassField('description', e.target.value)}
              className={`${INPUT_CLASS} border-gray-300`}
            />
          </div>

          <ValuationFields
            value={subclassForm.valuation}
            onChange={setSubclassValuation}
            amountError={subclassErrorFor('valuation')}
          />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Sort order</label>
            <input
              type="number"
              value={subclassForm.sortOrder}
              onChange={(e) => setSubclassField('sortOrder', e.target.value)}
              className={`${INPUT_CLASS} border-gray-300`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={!!subclassForm.enabled}
              onChange={(e) => setSubclassField('enabled', e.target.checked)}
            />
            Enabled
          </label>

          {subclassFormError && (
            <p className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
              {subclassFormError}
            </p>
          )}

          <button
            type="submit"
            disabled={subclassSaving}
            className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {subclassSaving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={!!assetToDelete}
        title="Delete asset"
        message={`Delete "${assetToDelete?.name ?? ''}"? Every subclass under this asset is deleted with it. This cannot be undone.`}
        confirmLabel="Delete asset"
        busy={deleting}
        onConfirm={handleAssetDelete}
        onCancel={() => setAssetToDelete(null)}
      />

      <ConfirmDialog
        open={!!subclassToDelete}
        title="Delete subclass"
        message={`Delete "${subclassToDelete?.subclass?.name ?? ''}"? This cannot be undone.`}
        confirmLabel="Delete subclass"
        busy={deleting}
        onConfirm={handleSubclassDelete}
        onCancel={() => setSubclassToDelete(null)}
      />
    </div>
  );
};

export default AdminPortfolio;
