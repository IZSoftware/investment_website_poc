import { useState, useEffect } from 'react';
import { X, Power, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  updateAdminAsset,
  deleteAdminAsset,
  updateAdminSubEntity,
  deleteAdminSubEntity,
} from '../../api/services';
import { VALUATION_UNITS, CURRENCY_OPTIONS, buildValuation, parseValuation } from '../../utils/valuation';

// NOTE: this modal edits both top-level assets AND sub-entities, distinguished
// by `asset.type` (set by the parent page, same convention your original
// NetAssets.jsx already used: `{ ...asset, type: 'asset' }`). For sub-entities,
// the parent should pass `{ ...subEntity, type: 'sub-entity' }`.
//
// NOTE on the status toggle: it does NOT call the API itself — it delegates to
// the `onToggleStatus` prop, same as the card's own Enable button. This keeps
// the actual PATCH call in exactly one place (the parent page) so it never
// fires twice for the same click.
export default function EditAssetModal({ isOpen, onClose, asset, onSave, onDelete, onToggleStatus }) {
  const isSubEntity = asset?.type === 'sub-entity';

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
      setSubmitError(null);
      setShowDeleteConfirm(false);
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const valuation = buildValuation({
      currency: formData.currency,
      amount: formData.amount,
      unit: formData.unit,
      allocationPercent: formData.allocationPercent,
      asAtDate: formatAsAtDateSafe(formData.selectedDate),
    });

    try {
      setSubmitting(true);
      setSubmitError(null);

      let response;
      if (isSubEntity) {
        response = await updateAdminSubEntity({
          id: asset.id,
          name: formData.name,
          description: formData.description,
          parentSubEntityId: asset.parentSubEntityId,
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
      setSubmitError(err?.message || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = isSubEntity
        ? await deleteAdminSubEntity({ id: asset.id })
        : await deleteAdminAsset({ id: asset.id });

      if (response.success) {
        onDelete(asset.id);
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to delete');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Failed to delete');
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
          <h3 className="text-xl font-semibold text-[#1D1D1F]">{isSubEntity ? 'Edit Sub-Entity' : 'Edit Asset'}</h3>
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
                    {isSubEntity ? 'Sub-Entity Status' : 'Asset Status'}
                  </div>
                </label>
                <p className="text-xs text-[#6E6E73]">
                  {formData.enabled
                    ? `${isSubEntity ? 'Sub-entity' : 'Asset'} is currently enabled and visible`
                    : `${isSubEntity ? 'Sub-entity' : 'Asset'} is currently disabled and hidden`}
                </p>
              </div>
              <button type="button" onClick={handleToggleStatus} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.enabled ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {!isSubEntity && (
              <div className="flex items-center justify-between pt-4 border-t border-[#D2D2D7]/50">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Sub-Entities Visibility</label>
                  <p className="text-xs text-[#6E6E73]">
                    {formData.subclassesVisible ? 'Sub-entities are visible under this asset' : 'Sub-entities are hidden for this asset'}
                  </p>
                </div>
                <button type="button" onClick={() => handleChange('subclassesVisible', !formData.subclassesVisible)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.subclassesVisible ? 'bg-blue-500' : 'bg-[#D2D2D7]'}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.subclassesVisible ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            )}

            {!isSubEntity && (
              <div className="flex items-center justify-between pt-4 border-t border-[#D2D2D7]/50">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Allows Sub-Entities</label>
                  <p className="text-xs text-[#6E6E73]">Can this asset have child sub-entities at all?</p>
                </div>
                <button type="button" onClick={() => handleChange('allowsSubclasses', !formData.allowsSubclasses)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.allowsSubclasses ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.allowsSubclasses ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">{isSubEntity ? 'Sub-Entity Name' : 'Asset Name'}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isSubEntity ? 'Sub-Entity Name' : 'Asset Name'}
              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
            />
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
                <input type="number" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all" />
              </div>
              <div className="col-span-4">
                <select value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
                  {VALUATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
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
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={15}
              scrollableYearDropdown
              maxDate={new Date()}
            />
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7] flex-shrink-0">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl">
              <Trash2 size={16} />
              Delete {isSubEntity ? 'Sub-Entity' : 'Asset'}
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
      `}</style>
    </div>
  );
}

// Local helper — avoids a name clash with the imported formatAsAtDate util
// in case this file is copy-pasted into a project that already has one in scope.
function formatAsAtDateSafe(date) {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}