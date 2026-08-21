import { useState, useEffect } from 'react';
import { X, Power, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateAdminCountry, deleteAdminCountry } from '../../api/services';
import {
  VALUATION_UNITS,
  CURRENCY_OPTIONS,
  buildValuation,
  parseValuation,
  formatAsAtDate,
} from '../../utils/valuation';

const CUSTOM_NAME = '__custom__';

// Maps server validation errors[] = [{field, message}] onto local field keys.
// Anything that doesn't match a known field is surfaced in the general error line.
function mapServerErrors(list) {
  const mapped = {};
  const unmatched = [];
  (list || []).forEach((e) => {
    const field = e?.field || '';
    if (field === 'name') mapped.name = e.message;
    else if (field === 'sortOrder') mapped.sortOrder = e.message;
    else if (field.startsWith('valuation')) mapped.valuation = e.message;
    else if (e?.message) unmatched.push(e.message);
  });
  return { mapped, unmatched };
}

// NOTE on the status toggle: it does NOT call the API itself — it delegates to
// the `onToggleStatus` prop, same as the card's own toggle button. This keeps
// the actual PATCH call in exactly one place (the parent page) so it never
// fires twice for the same click.
export default function EditCountryModal({
  isOpen,
  onClose,
  country,
  onSave,
  onDelete,
  onToggleStatus,
  supportedCountries = [],
}) {
  const [formData, setFormData] = useState({
    name: '',
    currency: 'USD',
    amount: '',
    unit: 'BILLIONS',
    allocationPercent: '',
    selectedDate: null,
    enabled: true,
    sortOrder: 0,
  });
  const [useCustomName, setUseCustomName] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (country) {
      const parsedVal = parseValuation(country.valuation);
      setFormData({
        name: country.name || '',
        currency: parsedVal.currency,
        amount: parsedVal.amount,
        unit: parsedVal.unit,
        allocationPercent: parsedVal.allocationPercent,
        selectedDate: parsedVal.asAtDate,
        enabled: country.enabled ?? true,
        sortOrder: country.sortOrder ?? 0,
      });
      setUseCustomName(Boolean(country.name) && !supportedCountries.includes(country.name));
      setErrors({});
      setSubmitError(null);
      setShowDeleteConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  if (!isOpen || !country) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleNameSelect = (value) => {
    if (value === CUSTOM_NAME) {
      setUseCustomName(true);
      handleChange('name', '');
    } else {
      handleChange('name', value);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = !formData.enabled;
    setFormData((prev) => ({ ...prev, enabled: newStatus }));
    if (onToggleStatus) onToggleStatus(country.id, newStatus);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Country name is required' }));
      return;
    }

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
      setErrors({});

      const response = await updateAdminCountry({
        id: country.id,
        name: formData.name.trim(),
        valuation,
        enabled: formData.enabled,
        sortOrder: Number(formData.sortOrder) || 0,
      });

      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        const { mapped, unmatched } = mapServerErrors(response.errors);
        setErrors(mapped);
        setSubmitError([response.message || 'Failed to save changes', ...unmatched].join(' — '));
      }
    } catch (err) {
      const { mapped, unmatched } = mapServerErrors(err.response?.data?.errors);
      setErrors(mapped);
      setSubmitError(
        [err.response?.data?.message || 'Failed to save changes', ...unmatched].join(' — ')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = await deleteAdminCountry({ id: country.id });
      if (response.success) {
        onDelete(country.id);
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to delete');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7] flex-shrink-0">
          <h3 className="text-xl font-semibold text-[#1D1D1F]">Edit Country</h3>
          <button
            onClick={onClose}
            className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="p-4 bg-[#F5F5F7] rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">
                  <div className="flex items-center gap-2">
                    <Power size={16} className={formData.enabled ? 'text-emerald-500' : 'text-[#6E6E73]'} />
                    Country Status
                  </div>
                </label>
                <p className="text-xs text-[#6E6E73]">
                  {formData.enabled
                    ? 'Country is currently enabled and visible'
                    : 'Country is currently disabled and hidden'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.enabled ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.enabled ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Country Name <span className="text-red-500">*</span>
            </label>
            {!useCustomName ? (
              <select
                value={supportedCountries.includes(formData.name) ? formData.name : ''}
                onChange={(e) => handleNameSelect(e.target.value)}
                className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
              >
                <option value="">Select Country</option>
                {supportedCountries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value={CUSTOM_NAME}>Other (enter manually)…</option>
              </select>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter country name"
                  className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomName(false);
                    handleChange('name', '');
                  }}
                  className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] font-medium transition-colors"
                >
                  Choose from list instead
                </button>
              </div>
            )}
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Valuation</label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-5">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full bg-white border ${errors.valuation ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
                />
              </div>
              <div className="col-span-4">
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent"
                >
                  {VALUATION_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {errors.valuation && <p className="mt-1 text-xs text-red-500">{errors.valuation}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Allocation %</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.allocationPercent}
              onChange={(e) => handleChange('allocationPercent', e.target.value)}
              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
            />
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Sort Order</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.sortOrder}
              onChange={(e) => handleChange('sortOrder', e.target.value)}
              className={`w-full bg-white border ${errors.sortOrder ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
            />
            {errors.sortOrder && <p className="mt-1 text-xs text-red-500">{errors.sortOrder}</p>}
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7] flex-shrink-0">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={16} />
              Delete Country
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6E6E73]">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all disabled:opacity-50"
            >
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
