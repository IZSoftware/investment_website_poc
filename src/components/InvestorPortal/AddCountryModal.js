import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createAdminCountry } from '../../api/services';
import { VALUATION_UNITS, CURRENCY_OPTIONS, buildValuation, formatAsAtDate } from '../../utils/valuation';

export default function AddCountryModal({ isOpen, onClose, onSave, supportedCountries }) {
  const [formData, setFormData] = useState({
    countryName: '',
    numberOfYears: '',
    currency: 'USD',
    amount: '',
    unit: 'BILLIONS',
    allocationPercent: '',
    selectedDate: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        countryName: '', numberOfYears: '', currency: 'USD', amount: '',
        unit: 'BILLIONS', allocationPercent: '', selectedDate: null,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.countryName) newErrors.countryName = 'Country name is required';
    if (!formData.numberOfYears) newErrors.numberOfYears = 'Number of years is required';
    if (!formData.amount) newErrors.amount = 'Valuation number is required';
    if (!formData.selectedDate) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleCancel = () => onClose();

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
      countryName: formData.countryName,
      numberOfYears: Number(formData.numberOfYears),
      valuation,
      enabled: true,
      sortOrder: 0,
    };

    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = await createAdminCountry(payload);
      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to add country');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Failed to add country');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} onClick={handleCancel} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7]">
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F]">Add Country</h3>
            <p className="text-sm text-[#6E6E73] mt-1">Add a new country to your portfolio</p>
          </div>
          <button onClick={handleCancel} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Country Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.countryName}
              onChange={(e) => handleInputChange('countryName', e.target.value)}
              className={`w-full bg-white border ${errors.countryName ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all appearance-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236E6E73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">Select Country</option>
              {supportedCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.countryName && <p className="mt-1 text-xs text-red-500">{errors.countryName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Number of Years <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.numberOfYears}
              onChange={(e) => handleInputChange('numberOfYears', e.target.value)}
              placeholder="Enter number of years"
              min="1"
              max="100"
              className={`w-full bg-white border ${errors.numberOfYears ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
            />
            {errors.numberOfYears && <p className="mt-1 text-xs text-red-500">{errors.numberOfYears}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Valuation <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <select value={formData.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
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
                <select value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent">
                  {VALUATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">Allocation %</label>
            <input type="number" min="0" max="100" step="0.01" value={formData.allocationPercent} onChange={(e) => handleInputChange('allocationPercent', e.target.value)} className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all" />
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

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D2D2D7]">
          <button onClick={handleCancel} className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all disabled:opacity-50">
            {submitting ? 'Adding…' : 'Add Country'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}