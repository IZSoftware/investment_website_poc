import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SlideOver from '../../components/admin/SlideOver';
import { useAdminCrud } from '../../hooks/useAdminCrud';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminClusters,
  createAdminCluster,
  updateAdminCluster,
  deleteAdminCluster,
  updateAdminClusterStatus,
  uploadFile,
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

const emptyForm = () => ({
  name: '',
  icon: '',
  description: '',
  publicDescription: '',
  valuation: parseValuation(null),
  enabled: true,
  sortOrder: '',
  companies: [],
});

const fromCluster = (cluster) => ({
  name: cluster.name ?? '',
  icon: cluster.icon ?? '',
  description: cluster.description ?? '',
  publicDescription: cluster.publicDescription ?? '',
  valuation: parseValuation(cluster.valuation),
  enabled: cluster.enabled ?? true,
  sortOrder: cluster.sortOrder ?? '',
  // Echo each existing company id so identity survives the whole-list replace.
  companies: (cluster.companies ?? []).map((c) => ({
    id: c.id,
    name: c.name ?? '',
    link: c.link ?? '',
    logo: c.logo ?? '',
  })),
});

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

const AdminClusters = () => {
  const { userRole } = useAuth();
  const canWrite = CAN_WRITE_ROLES.includes(userRole);
  const canDelete = CAN_DELETE_ROLES.includes(userRole);

  const { items, loading, error, fetchItems, saveItem, removeItem } = useAdminCrud({
    list: getAdminClusters,
    create: createAdminCluster,
    update: updateAdminCluster,
    remove: deleteAdminCluster,
  });

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [logoUploading, setLogoUploading] = useState({});
  const [logoErrors, setLogoErrors] = useState({});
  const [actionError, setActionError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const setValuationField = (key, value) =>
    setForm((prev) => ({ ...prev, valuation: { ...prev.valuation, [key]: value } }));

  const matchesField = (field, name) =>
    field === name || field?.startsWith(`${name}.`) || field?.startsWith(`${name}[`);
  const errorFor = (name) => fieldErrors.find((e) => matchesField(e?.field, name))?.message;
  const unmatchedErrors = fieldErrors.filter(
    (e) => !['name', 'icon', 'description', 'publicDescription', 'valuation', 'enabled', 'sortOrder', 'companies'].some((n) =>
      matchesField(e?.field, n)
    )
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setFieldErrors([]);
    setLogoErrors({});
    setSlideOpen(true);
  };

  const openEdit = (cluster) => {
    setEditingId(cluster.id);
    setForm(fromCluster(cluster));
    setFormError(null);
    setFieldErrors([]);
    setLogoErrors({});
    setSlideOpen(true);
  };

  const addCompanyRow = () =>
    setForm((prev) => ({ ...prev, companies: [...prev.companies, { name: '', link: '', logo: '' }] }));

  const updateCompanyRow = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      companies: prev.companies.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }));

  const removeCompanyRow = (index) =>
    setForm((prev) => ({ ...prev, companies: prev.companies.filter((_, i) => i !== index) }));

  const handleLogoUpload = async (index, file) => {
    if (!file) return;
    setLogoUploading((prev) => ({ ...prev, [index]: true }));
    setLogoErrors((prev) => ({ ...prev, [index]: null }));
    try {
      const envelope = await uploadFile({ file, folder: 'clusters' });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Upload failed.');
      const url = envelope?.data?.url;
      if (!url) throw new Error('Upload did not return a file URL.');
      updateCompanyRow(index, 'logo', url);
    } catch (err) {
      console.error(err);
      setLogoErrors((prev) => ({
        ...prev,
        [index]: err.response?.data?.message || err.message || 'Upload failed.',
      }));
    } finally {
      setLogoUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      const payload = {
        name: form.name,
        icon: form.icon,
        description: form.description,
        publicDescription: form.publicDescription,
        valuation: buildValuation({
          currency: form.valuation?.currency,
          amount: form.valuation?.amount,
          unit: form.valuation?.unit,
          allocationPercent: form.valuation?.allocationPercent,
          asAtDate: formatAsAtDate(form.valuation?.asAtDate),
        }),
        enabled: !!form.enabled,
        sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder),
        // Whole-list replace: existing rows keep their id, new rows omit it,
        // dropped rows are deleted server-side.
        companies: form.companies
          .filter((c) => (c.name ?? '').trim() !== '')
          .map((c) => ({
            ...(c.id ? { id: c.id } : {}),
            name: c.name.trim(),
            link: c.link || '',
            logo: c.logo || '',
          })),
      };
      await saveItem(payload, editingId);
      setSlideOpen(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Could not save this cluster.');
      setFieldErrors(err.fieldErrors ?? []);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cluster) => {
    setTogglingId(cluster.id);
    setActionError(null);
    try {
      const envelope = await updateAdminClusterStatus({ id: cluster.id, enabled: !cluster.enabled });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Could not change the status.');
      await fetchItems();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || 'Could not change the status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await removeItem(confirmTarget.id);
      setConfirmTarget(null);
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Could not delete this cluster.');
    } finally {
      setDeleting(false);
    }
  };

  const columnCount = 6 + (canWrite ? 1 : 0);
  const uploadsInFlight = Object.values(logoUploading).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Clusters</h1>
              <p className="mt-2 text-gray-500">
                Investment clusters and their portfolio companies, shown on the homepage and Clusters page.
              </p>
            </div>
            {canWrite && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Cluster
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
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Icon</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Valuation</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Companies</th>
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
                    ) : items.length === 0 ? (
                      <tr><td colSpan={columnCount} className="px-6 py-10 text-center text-gray-400">No clusters yet</td></tr>
                    ) : (
                      items.map((cluster) => (
                        <tr key={cluster.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{cluster.name}</td>
                          <td className="px-6 py-4 text-gray-600">{cluster.icon || '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{cluster.valuation?.displayText ?? '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{cluster.companies?.length ?? 0}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                cluster.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {cluster.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{cluster.sortOrder ?? 0}</td>
                          {canWrite && (
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggle(cluster)}
                                disabled={togglingId === cluster.id}
                                title={cluster.enabled ? 'Disable' : 'Enable'}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full align-middle mr-3 transition-colors disabled:opacity-50 ${
                                  cluster.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                    cluster.enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => openEdit(cluster)}
                                title="Edit"
                                className="p-2 mr-1 text-[#0A2540] hover:bg-gray-100 rounded-lg align-middle"
                              >
                                <Edit2 size={16} />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => setConfirmTarget(cluster)}
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
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      <SlideOver
        open={slideOpen}
        width="lg"
        title={editingId ? 'Edit Cluster' : 'Add Cluster'}
        onClose={() => setSlideOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Name<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              className={`${INPUT_CLASS} ${errorFor('name') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errorFor('name') && <p className="mt-1 text-xs text-red-600">{errorFor('name')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Icon</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setField('icon', e.target.value)}
              placeholder="Emoji or short icon key"
              className={`${INPUT_CLASS} ${errorFor('icon') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errorFor('icon') && <p className="mt-1 text-xs text-red-600">{errorFor('icon')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Internal description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className={`${INPUT_CLASS} ${errorFor('description') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errorFor('description') && <p className="mt-1 text-xs text-red-600">{errorFor('description')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Public description</label>
            <textarea
              rows={3}
              value={form.publicDescription}
              onChange={(e) => setField('publicDescription', e.target.value)}
              className={`${INPUT_CLASS} ${errorFor('publicDescription') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errorFor('publicDescription') && (
              <p className="mt-1 text-xs text-red-600">{errorFor('publicDescription')}</p>
            )}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Valuation</label>
            <div className="grid grid-cols-12 gap-2">
              <select
                value={form.valuation?.currency ?? 'USD'}
                onChange={(e) => setValuationField('currency', e.target.value)}
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
                value={form.valuation?.amount ?? ''}
                onChange={(e) => setValuationField('amount', e.target.value)}
                className={`col-span-5 ${INPUT_CLASS} ${errorFor('valuation') ? 'border-red-500' : 'border-gray-300'}`}
              />
              <select
                value={form.valuation?.unit ?? 'BILLIONS'}
                onChange={(e) => setValuationField('unit', e.target.value)}
                className={`col-span-4 ${INPUT_CLASS} border-gray-300`}
              >
                {VALUATION_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            {errorFor('valuation') && <p className="mt-1 text-xs text-red-600">{errorFor('valuation')}</p>}
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
              value={form.valuation?.allocationPercent ?? ''}
              onChange={(e) => setValuationField('allocationPercent', e.target.value)}
              className={`${INPUT_CLASS} border-gray-300`}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">As at date</label>
            <DatePicker
              selected={form.valuation?.asAtDate ?? null}
              onChange={(date) => setValuationField('asAtDate', date)}
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

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Companies</label>
              <button
                type="button"
                onClick={addCompanyRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A2540] border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus size={14} />
                Add company
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {form.companies.length === 0 && (
                <p className="text-xs text-gray-400">No companies on this cluster yet.</p>
              )}
              {form.companies.map((company, index) => (
                <div key={company.id ?? `new-${index}`} className="p-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={company.name}
                        onChange={(e) => updateCompanyRow(index, 'name', e.target.value)}
                        placeholder="Company name *"
                        className={`${INPUT_CLASS} bg-white border-gray-300`}
                      />
                      <input
                        type="text"
                        value={company.link}
                        onChange={(e) => updateCompanyRow(index, 'link', e.target.value)}
                        placeholder="Website link"
                        className={`${INPUT_CLASS} bg-white border-gray-300`}
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={company.logo}
                          onChange={(e) => updateCompanyRow(index, 'logo', e.target.value)}
                          placeholder="Logo URL"
                          className={`${INPUT_CLASS} bg-white border-gray-300`}
                        />
                        <label
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-lg cursor-pointer ${
                            logoUploading[index]
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-[#0A2540] hover:bg-[#003852] text-white'
                          }`}
                        >
                          <Upload size={14} />
                          {logoUploading[index] ? 'Uploading…' : 'Upload'}
                          <input
                            type="file"
                            className="hidden"
                            disabled={!!logoUploading[index]}
                            onChange={(e) => {
                              handleLogoUpload(index, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      {company.logo && (
                        <div className="flex items-center gap-2">
                          <img src={company.logo} alt="" className="object-contain w-8 h-8 bg-white rounded" />
                          <span className="flex-1 text-xs text-gray-500 truncate">{company.logo}</span>
                          <button
                            type="button"
                            onClick={() => updateCompanyRow(index, 'logo', '')}
                            className="text-gray-400 hover:text-red-600"
                            title="Clear logo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      {logoErrors[index] && <p className="text-xs text-red-600">{logoErrors[index]}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCompanyRow(index)}
                      title="Remove company"
                      className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Companies are saved as a complete list: rows you remove here are deleted on the server when you save,
              and rows without a name are skipped.
            </p>
            {errorFor('companies') && <p className="mt-1 text-xs text-red-600">{errorFor('companies')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setField('sortOrder', e.target.value)}
              className={`${INPUT_CLASS} ${errorFor('sortOrder') ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errorFor('sortOrder') && <p className="mt-1 text-xs text-red-600">{errorFor('sortOrder')}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={!!form.enabled} onChange={(e) => setField('enabled', e.target.checked)} />
            Enabled
          </label>

          {formError && (
            <p className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">{formError}</p>
          )}
          {unmatchedErrors.length > 0 && (
            <ul className="text-xs text-red-600 list-disc list-inside">
              {unmatchedErrors.map((e, i) => (
                <li key={`${e?.field ?? 'error'}-${i}`}>{e?.field ? `${e.field}: ${e.message}` : e?.message}</li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={saving || uploadsInFlight}
            className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete cluster"
        message={`Delete "${confirmTarget?.name ?? ''}"? Its companies are removed with it. This cannot be undone.`}
        confirmLabel="Delete cluster"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default AdminClusters;
