import { useState, useEffect } from 'react';
import { X, Power, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  updateAdminAsset,
  deleteAdminAsset,
  updateAdminAssetSubclass,
  deleteAdminAssetSubclass,
} from '../../api/services';
import {
  VALUATION_UNITS,
  CURRENCY_OPTIONS,
  buildValuation,
  parseValuation,
  formatAsAtDate,
} from '../../utils/valuation';

// NOTE: this modal edits both top-level assets AND asset subclasses,
// distinguished by `asset.type` set by the parent page: `{ ...asset, type:
// 'asset' }` from NetAssets, `{ ...subclass, type: 'subclass' }` from the
// subclasses page. Subclasses have no visibility flags of their own — the
// portfolio tree is only two levels deep.
//
// NOTE on the status toggle: it does NOT call the API itself — it delegates to
// the `onToggleStatus` prop, same as the card's own Enable button. This keeps
// the actual PATCH call in exactly one place (the parent page) so it never
// fires twice for the same click.
export default function EditAssetModal({ isOpen, onClose, asset, onSave, onDelete, onToggleStatus }) {
  const isSubclass = asset?.type === 'subclass';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'USD',
    amount: '',
    unit: 'BILLIONS',
    allocationPercent: '',
    selectedDate: null,
    enabled: true,
    subclassesVisible: true,
    allowsSubclasses: true,
  });
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (asset) {
      const parsedVal = parseValuation(asset.valuation);
      setFormData({
        name: asset.name || '',
        description: asset.description || '',
        currency: parsedVal.currency,
        amount: parsedVal.amount,
        unit: parsedVal.unit,
        allocationPercent: parsedVal.allocationPercent,
        selectedDate: parsedVal.asAtDate,
        enabled: asset.enabled ?? true,
        subclassesVisible: asset.subclassesVisible ?? true,
        allowsSubclasses: asset.allowsSubclasses ?? true,
      });
      setErrors({});
      setSubmitError(null);
      setShowDeleteConfirm(false);
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const label = isSubclass ? 'Subclass' : 'Asset';

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Server validation errors arrive as errors[] = [{field, message}].
  const applyServerError = (err, fallback) => {
    const list = err?.response?.data?.errors;
    if (Array.isArray(list) && list.length > 0) {
      const mapped = {};
      list.forEach((item) => {
        if (item?.field) mapped[item.field] = item.message;
      });
      setErrors((prev) => ({ ...prev, ...mapped }));
    }
    setSubmitError(err?.response?.data?.message || err?.message || fallback);
  };

  const handleSubmit = async () => {
    const valuation = buildValuation({
      currency: formData.currency,
      amount: formData.amount,
      unit: formData.unit,
      allocationPercent: formData.allocationPercent,
      asAtDate: formatAsAtDate(formData.selectedDate),
    });

    try {
      setSubmitting(true);
      setSubmitError(null);

      let response;
      if (isSubclass) {
        response = await updateAdminAssetSubclass({
          id: asset.id,
          name: formData.name,
          description: formData.description,
          valuation,
          enabled: formData.enabled,
          sortOrder: asset.sortOrder ?? 0,
        });
      } else {
        response = await updateAdminAsset({
          id: asset.id,
          name: formData.name,
          description: formData.description,
          valuation,
          enabled: formData.enabled,
          subclassesVisible: formData.subclassesVisible,
          allowsSubclasses: formData.allowsSubclasses,
          sortOrder: asset.sortOrder ?? 0,
        });
      }

      if (response.success) {
        onSave({ ...response.data, type: asset.type });
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to save changes');
      }
    } catch (err) {
      applyServerError(err, 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = isSubclass
        ? await deleteAdminAssetSubclass({ id: asset.id })
        : await deleteAdminAsset({ id: asset.id });

      if (response.success) {
        onDelete(asset.id);
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to delete');
      }
    } catch (err) {
      applyServerError(err, 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = !formData.enabled;
    setFormData((prev) => ({ ...prev, enabled: newStatus }));
    if (onToggleStatus) onToggleStatus(asset.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7] flex-shrink-0">
          <h3 className="text-xl font-semibold text-[#1D1D1F]">Edit {label}</h3>
          <button onClick={onClose} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="space-y-4 p-4 bg-[#F5F5F7] rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">
                  <div className="flex items-center gap-2">
                    <Power size={16} className={formData.enabled ? 'text-emerald-500' : 'text-[#6E6E73]'} />
                    {label} Status
                  </div>
                </label>
                <p className="text-xs text-[#6E6E73]">
                  {formData.enabled
                    ? `${label} is currently enabled and visible`
                    : `${label} is currently disabled and hidden`}
                </p>
              </div>
              <button type="button" onClick={handleToggleStatus} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.enabled ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Subclasses flags belong to assets only — a subclass has no children. */}
            {!isSubclass && (
              <div className="flex items-center justify-between pt-4 border-t border-[#D2D2D7]/50">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Allows Subclasses</label>
                  <p className="text-xs text-[#6E6E73]">Can this asset hold subclasses at all?</p>
                </div>
                <button type="button" onClick={() => handleChange('allowsSubclasses', !formData.allowsSubclasses)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.allowsSubclasses ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.allowsSubclasses ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            )}

            {!isSubclass && (
              <div className="flex items-center justify-between pt-4 border-t border-[#D2D2D7]/50">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Subclasses Visibility</label>
                  <p className="text-xs text-[#6E6E73]">
                    {!formData.allowsSubclasses
                      ? 'This asset does not allow subclasses'
                      : formData.subclassesVisible
                        ? 'Subclasses are visible under this asset'
                        : 'Subclasses are hidden for this asset'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!formData.allowsSubclasses}
                  onClick={() => handleChange('subclassesVisible', !formData.subclassesVisible)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${formData.subclassesVisible && formData.allowsSubclasses ? 'bg-blue-500' : 'bg-[#D2D2D7]'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.subclassesVisible && formData.allowsSubclasses ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">{label} Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={`${label} Name`}
              className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description"
              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Valuation</label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
                  {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="col-span-5">
                <input type="number" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" className={`w-full bg-white border ${errors.amount ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`} />
              </div>
              <div className="col-span-4">
                <select value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
                  {VALUATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Allocation %</label>
            <input type="number" min="0" max="100" step="0.01" value={formData.allocationPercent} onChange={(e) => handleChange('allocationPercent', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">As At Date</label>
            <DatePicker
              selected={formData.selectedDate}
              onChange={(date) => handleChange('selectedDate', date)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select date"
              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent"
              wrapperClassName="w-full"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={15}
              scrollableYearDropdown
              maxDate={new Date()}
            />
          </div>

          {submitError && (
            <p className="px-4 py-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">{submitError}</p>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7] flex-shrink-0">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl">
              <Trash2 size={16} />
              Delete {label}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6E6E73]">Are you sure?</span>
              <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                Yes, Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container { width: 100%; }
      `}</style>
    </div>
  );
}
