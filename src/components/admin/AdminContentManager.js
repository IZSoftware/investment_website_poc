import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import SlideOver from './SlideOver';
import { useAdminCrud } from '../../hooks/useAdminCrud';
import { uploadFile } from '../../api/services';
import {
  VALUATION_UNITS,
  CURRENCY_OPTIONS,
  parseValuation,
  buildValuation,
  formatAsAtDate,
} from '../../utils/valuation';

const INPUT_CLASS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]';

const looksLikeImage = (url) => /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(url ?? '');

/**
 * Generic list + SlideOver CRUD screen for flat admin resources.
 *
 * Props
 *  title        string   – page heading (also the fallback singular noun)
 *  itemLabel    string?  – singular noun used in buttons/SlideOver titles (defaults to `title`)
 *  description  string?  – subtitle under the heading
 *  api          { list, create, update, remove } – service functions (envelope-returning)
 *  extractList  (envelope) => array   – optional list extractor for the hook
 *  fields       [{ name, label, type, required, defaultValue?, placeholder?, help?,
 *                  rows?, options?, folder? }]
 *                 type ∈ text | number | date | textarea | checkbox | select | upload | valuation
 *                 select → options: [{ value, label }]
 *                 upload → folder: uploads folder name; value stored is the returned file URL
 *                 valuation → composite {currency, amount, unit, allocationPercent, asAtDate}
 *  columns      [{ key, label, render? }]
 *  canWrite     boolean? – default true; false renders a read-only table (DEV role)
 *  canDelete    boolean? – defaults to canWrite; false keeps create/edit but hides Delete
 *                          (FINANCIAL_ADMIN may write portfolio data but not delete it)
 *  statusToggle { onToggle(id, enabled) }? – adds a per-row enable/disable switch column
 *  deleteConfirmMessage string? – overrides the delete confirmation copy
 */
const AdminContentManager = ({
  title,
  itemLabel,
  description,
  api,
  fields,
  columns,
  extractList,
  canWrite = true,
  canDelete,
  statusToggle,
  deleteConfirmMessage,
}) => {
  const { items, loading, error, fetchItems, saveItem, removeItem } = useAdminCrud({
    list: api.list,
    create: api.create,
    update: api.update,
    remove: api.remove,
    extractList,
  });

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formFieldErrors, setFormFieldErrors] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [uploading, setUploading] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const label = itemLabel || title;

  const defaultValueFor = (f) => {
    if (f.defaultValue !== undefined) return f.defaultValue;
    if (f.type === 'checkbox') return true;
    if (f.type === 'valuation') return parseValuation(null);
    return '';
  };

  const valueFromItem = (f, item) => {
    if (f.type === 'valuation') return parseValuation(item?.[f.name]);
    const raw = item?.[f.name];
    return raw ?? defaultValueFor(f);
  };

  const resetFormState = () => {
    setFormError(null);
    setFormFieldErrors([]);
    setUploadErrors({});
    setUploading({});
  };

  const openCreate = () => {
    setEditingId(null);
    setFormValues(Object.fromEntries(fields.map((f) => [f.name, defaultValueFor(f)])));
    resetFormState();
    setSlideOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormValues(Object.fromEntries(fields.map((f) => [f.name, valueFromItem(f, item)])));
    resetFormState();
    setSlideOpen(true);
  };

  const handleChange = (name, value) => setFormValues((prev) => ({ ...prev, [name]: value }));

  const handleValuationChange = (name, key, value) =>
    setFormValues((prev) => ({ ...prev, [name]: { ...(prev[name] ?? {}), [key]: value } }));

  // Server validation errors arrive as [{field, message}]; nested fields come
  // through dotted ("valuation.amount"), so match on prefix too.
  const errorFor = (name) =>
    formFieldErrors.find((e) => e?.field === name || e?.field?.startsWith(`${name}.`))?.message;

  const handleUpload = async (f, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [f.name]: true }));
    setUploadErrors((prev) => ({ ...prev, [f.name]: null }));
    try {
      const envelope = await uploadFile({ file, folder: f.folder ?? '' });
      if (envelope?.success === false) throw new Error(envelope?.message || 'Upload failed.');
      const url = envelope?.data?.url;
      if (!url) throw new Error('Upload did not return a file URL.');
      handleChange(f.name, url);
    } catch (err) {
      console.error(err);
      setUploadErrors((prev) => ({
        ...prev,
        [f.name]: err.response?.data?.message || err.message || 'Upload failed.',
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [f.name]: false }));
    }
  };

  const buildPayload = () => {
    const payload = {};
    fields.forEach((f) => {
      const value = formValues[f.name];
      if (f.type === 'number') {
        payload[f.name] = value === '' || value === null || value === undefined ? 0 : Number(value);
      } else if (f.type === 'checkbox') {
        payload[f.name] = !!value;
      } else if (f.type === 'valuation') {
        payload[f.name] = buildValuation({
          currency: value?.currency,
          amount: value?.amount,
          unit: value?.unit,
          allocationPercent: value?.allocationPercent,
          asAtDate: formatAsAtDate(value?.asAtDate),
        });
      } else {
        payload[f.name] = value;
      }
    });
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFormFieldErrors([]);
    try {
      await saveItem(buildPayload(), editingId);
      setSlideOpen(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Could not save.');
      setFormFieldErrors(err.fieldErrors ?? []);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const message = deleteConfirmMessage || `Delete this ${label.toLowerCase()}? This cannot be undone.`;
    if (!window.confirm(message)) return;
    setDeletingId(id);
    setActionError(null);
    try {
      await removeItem(id);
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Could not delete this item.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (item) => {
    if (!statusToggle?.onToggle) return;
    setTogglingId(item.id);
    setActionError(null);
    try {
      const envelope = await statusToggle.onToggle(item.id, !item.enabled);
      if (envelope?.success === false) throw new Error(envelope?.message || 'Could not change the status.');
      await fetchItems();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || 'Could not change the status.');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteAllowed = canWrite && (canDelete === undefined ? true : !!canDelete);
  const showStatusColumn = canWrite && !!statusToggle?.onToggle;
  const showActionsColumn = canWrite;
  const totalColumns = columns.length + (showStatusColumn ? 1 : 0) + (showActionsColumn ? 1 : 0);

  const renderField = (f) => {
    const fieldError = errorFor(f.name);
    const errorClass = fieldError ? 'border-red-500' : 'border-gray-300';

    if (f.type === 'checkbox') {
      return (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={!!formValues[f.name]}
            onChange={(e) => handleChange(f.name, e.target.checked)}
          />
          {f.label}
        </label>
      );
    }

    return (
      <>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          {f.label}
          {f.required && <span className="text-red-500"> *</span>}
        </label>

        {f.type === 'textarea' && (
          <textarea
            value={formValues[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            required={f.required}
            rows={f.rows ?? 4}
            placeholder={f.placeholder}
            className={`${INPUT_CLASS} ${errorClass}`}
          />
        )}

        {f.type === 'select' && (
          <select
            value={formValues[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            required={f.required}
            className={`${INPUT_CLASS} ${errorClass}`}
          >
            <option value="">{f.placeholder ?? 'Select…'}</option>
            {(f.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {f.type === 'upload' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={formValues[f.name] ?? ''}
                onChange={(e) => handleChange(f.name, e.target.value)}
                required={f.required}
                placeholder={f.placeholder ?? 'https://…'}
                className={`${INPUT_CLASS} ${errorClass}`}
              />
              <label
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap rounded-lg cursor-pointer ${
                  uploading[f.name]
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0A2540] hover:bg-[#003852] text-white'
                }`}
              >
                <Upload size={14} />
                {uploading[f.name] ? 'Uploading…' : 'Upload'}
                <input
                  type="file"
                  className="hidden"
                  disabled={!!uploading[f.name]}
                  onChange={(e) => {
                    handleUpload(f, e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {formValues[f.name] && (
              <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                {looksLikeImage(formValues[f.name]) && (
                  <img src={formValues[f.name]} alt="" className="object-cover w-10 h-10 rounded" />
                )}
                <span className="flex-1 text-xs text-gray-500 truncate">{formValues[f.name]}</span>
                <button
                  type="button"
                  onClick={() => handleChange(f.name, '')}
                  disabled={!!uploading[f.name]}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Clear"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {uploadErrors[f.name] && <p className="text-xs text-red-600">{uploadErrors[f.name]}</p>}
          </div>
        )}

        {f.type === 'valuation' && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2">
              <select
                value={formValues[f.name]?.currency ?? 'USD'}
                onChange={(e) => handleValuationChange(f.name, 'currency', e.target.value)}
                className={`col-span-3 ${INPUT_CLASS} ${errorClass}`}
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
                value={formValues[f.name]?.amount ?? ''}
                onChange={(e) => handleValuationChange(f.name, 'amount', e.target.value)}
                className={`col-span-5 ${INPUT_CLASS} ${errorClass}`}
              />
              <select
                value={formValues[f.name]?.unit ?? 'BILLIONS'}
                onChange={(e) => handleValuationChange(f.name, 'unit', e.target.value)}
                className={`col-span-4 ${INPUT_CLASS} ${errorClass}`}
              >
                {VALUATION_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-medium text-gray-500">Allocation %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formValues[f.name]?.allocationPercent ?? ''}
                onChange={(e) => handleValuationChange(f.name, 'allocationPercent', e.target.value)}
                className={`${INPUT_CLASS} border-gray-300`}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-medium text-gray-500">As at date</label>
              <DatePicker
                selected={formValues[f.name]?.asAtDate ?? null}
                onChange={(date) => handleValuationChange(f.name, 'asAtDate', date)}
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
            <p className="text-xs text-gray-400">
              The formatted valuation label is generated by the server after saving.
            </p>
          </div>
        )}

        {!['textarea', 'select', 'upload', 'valuation'].includes(f.type) && (
          <input
            type={f.type ?? 'text'}
            value={formValues[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            required={f.required}
            placeholder={f.placeholder}
            className={`${INPUT_CLASS} ${errorClass}`}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
              {description && <p className="mt-2 text-gray-500">{description}</p>}
            </div>
            {canWrite && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add {label}
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
                    <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                      {columns.map((col) => (
                        <th key={col.key} className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                          {col.label}
                        </th>
                      ))}
                      {showStatusColumn && (
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                      )}
                      {showActionsColumn && (
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={totalColumns} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                    ) : items.length === 0 ? (
                      <tr><td colSpan={totalColumns} className="px-6 py-10 text-center text-gray-400">No items yet</td></tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {columns.map((col) => (
                            <td key={col.key} className="max-w-xs px-6 py-4 truncate">
                              {col.render ? col.render(item) : String(item[col.key] ?? '')}
                            </td>
                          ))}
                          {showStatusColumn && (
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => handleToggle(item)}
                                disabled={togglingId === item.id}
                                title={item.enabled ? 'Disable' : 'Enable'}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                  item.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                    item.enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                          )}
                          {showActionsColumn && (
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => openEdit(item)}
                                title="Edit"
                                className="p-2 mr-1 text-[#0A2540] hover:bg-gray-100 rounded-lg"
                              >
                                <Edit2 size={16} />
                              </button>
                              {deleteAllowed && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  disabled={deletingId === item.id}
                                  title="Delete"
                                  className="p-2 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
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
        title={editingId ? `Edit ${label}` : `Add ${label}`}
        onClose={() => setSlideOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((f) => {
            const fieldError = errorFor(f.name);
            return (
              <div key={f.name}>
                {renderField(f)}
                {f.help && <p className="mt-1 text-xs text-gray-400">{f.help}</p>}
                {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
              </div>
            );
          })}

          {formError && (
            <p className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">{formError}</p>
          )}

          <button
            type="submit"
            disabled={saving || Object.values(uploading).some(Boolean)}
            className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
};

export default AdminContentManager;
