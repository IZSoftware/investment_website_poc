import { useState } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createAdminAsset } from '../../api/services';
import { VALUATION_UNITS, CURRENCY_OPTIONS, buildValuation, formatAsAtDate } from '../../utils/valuation';

export default function AddAssetModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'USD',
    amount: '',
    unit: 'BILLIONS',
    allocationPercent: '',
    selectedDate: null,
    subclassesVisible: true,
    allowsSubclasses: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Asset name is required';
    if (!formData.amount) newErrors.amount = 'Valuation number is required';
    if (!formData.selectedDate) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleInputChange = (field, value) => {
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

  const resetForm = () => {
    setFormData({
      name: '', description: '', currency: 'USD', amount: '', unit: 'BILLIONS',
      allocationPercent: '', selectedDate: null, subclassesVisible: true, allowsSubclasses: true,
    });
    setErrors({});
    setSubmitError(null);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const valuation = buildValuation({
      currency: formData.currency,
      amount: formData.amount,
      unit: formData.unit,
      allocationPercent: formData.allocationPercent,
      asAtDate: formatAsAtDate(formData.selectedDate),
    });

    const payload = {
      name: formData.name,
      description: formData.description,
      valuation,
      enabled: true,
      subclassesVisible: formData.subclassesVisible,
      allowsSubclasses: formData.allowsSubclasses,
      sortOrder: 0,
    };

    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = await createAdminAsset(payload);
      if (response.success) {
        // "Fund of Funds" assets come back with allowsSubclasses forced false —
        // the parent stores what the server echoed, not what was requested.
        onSave(response.data);
        resetForm();
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to create asset');
      }
    } catch (err) {
      applyServerError(err, 'Failed to create asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} onClick={handleCancel} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7] flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F]">Add Asset</h3>
            <p className="text-sm text-[#6E6E73] mt-1">Add a new asset to your portfolio</p>
          </div>
          <button onClick={handleCancel} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Asset Name"
                className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Valuation <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <select value={formData.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all">
                    {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="col-span-5">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full bg-white border ${errors.amount ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
                  />
                </div>
                <div className="col-span-4">
                  <select value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all">
                    {VALUATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Allocation %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.allocationPercent}
                onChange={(e) => handleInputChange('allocationPercent', e.target.value)}
                placeholder="Enter allocation percentage"
                className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description"
                className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                As At Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={formData.selectedDate}
                onChange={(date) => handleInputChange('selectedDate', date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select date"
                className={`w-full bg-white border ${errors.date ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
                wrapperClassName="w-full"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={15}
                scrollableYearDropdown
                maxDate={new Date()}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-xl">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Subclasses Visible</label>
                <p className="text-xs text-[#6E6E73]">Show the subclasses section for this asset</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('subclassesVisible', !formData.subclassesVisible)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.subclassesVisible ? 'bg-blue-500' : 'bg-[#D2D2D7]'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.subclassesVisible ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-xl">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Allows Subclasses</label>
                <p className="text-xs text-[#6E6E73]">Can this asset hold subclasses at all?</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('allowsSubclasses', !formData.allowsSubclasses)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.allowsSubclasses ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.allowsSubclasses ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {submitError && (
              <p className="px-4 py-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">{submitError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D2D2D7] flex-shrink-0">
          <button onClick={handleCancel} className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all disabled:opacity-50">
            {submitting ? 'Adding…' : 'Add Asset'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container { width: 100%; }
        .react-datepicker { font-family: 'Inter', sans-serif; border: 1px solid #D2D2D7; border-radius: 0.75rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
        .react-datepicker__header { background-color: #F5F5F7; border-bottom: 1px solid #D2D2D7; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; padding-top: 0.75rem; }
        .react-datepicker__current-month { color: #1D1D1F; font-weight: 600; }
        .react-datepicker__day-name { color: #6E6E73; }
        .react-datepicker__day--selected { background-color: #1D1D1F; border-radius: 0.5rem; }
        .react-datepicker__day--keyboard-selected { background-color: #F5F5F7; color: #1D1D1F; }
        .react-datepicker__day:hover { background-color: #F5F5F7; border-radius: 0.5rem; }
        .react-datepicker__navigation { top: 0.75rem; }
      `}</style>
    </div>
  );
}
