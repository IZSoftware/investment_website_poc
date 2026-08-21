import { useState } from 'react';
import { X, Plus as PlusIcon, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createAdminCluster } from '../../api/services';
import { VALUATION_UNITS, CURRENCY_OPTIONS, buildValuation, formatAsAtDate } from '../../utils/valuation';
import { ICON_OPTIONS } from './clusterIcons';

let rowSeq = 0;
const newCompanyRow = () => ({ key: `row-${rowSeq++}`, name: '', link: '', logo: '' });

// The backend replaces the whole companies list on every write, so the editor
// always sends every row it holds; rows without a name are dropped.
const buildCompanies = (rows) =>
  rows
    .filter((row) => row.name.trim())
    .map((row) => {
      const company = { name: row.name.trim() };
      if (row.link.trim()) company.link = row.link.trim();
      if (row.logo.trim()) company.logo = row.logo.trim();
      return company;
    });

export default function AddSectorModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏭',
    description: '',
    publicDescription: '',
    currency: 'USD',
    amount: '',
    unit: 'BILLIONS',
    allocationPercent: '',
    selectedDate: null,
  });
  const [companyRows, setCompanyRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Cluster name is required';
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

  const addCompanyRow = () => setCompanyRows((prev) => [...prev, newCompanyRow()]);

  const updateCompanyRow = (key, field, value) => {
    setCompanyRows((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  };

  const removeCompanyRow = (key) => {
    setCompanyRows((prev) => prev.filter((row) => row.key !== key));
  };

  const resetForm = () => {
    setFormData({
      name: '', icon: '🏭', description: '', publicDescription: '',
      currency: 'USD', amount: '', unit: 'BILLIONS', allocationPercent: '', selectedDate: null,
    });
    setCompanyRows([]);
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

    try {
      setSubmitting(true);
      setSubmitError(null);
      const response = await createAdminCluster({
        name: formData.name,
        icon: formData.icon,
        description: formData.description,
        publicDescription: formData.publicDescription,
        companies: buildCompanies(companyRows),
        valuation,
        enabled: true,
        sortOrder: 0,
      });
      if (response.success) {
        onSave(response.data);
        resetForm();
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to create cluster');
      }
    } catch (err) {
      applyServerError(err, 'Failed to create cluster');
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
            <h3 className="text-xl font-semibold text-[#1D1D1F]">Add Cluster</h3>
            <p className="text-sm text-[#6E6E73] mt-1">Add a new cluster to your portfolio</p>
          </div>
          <button onClick={handleCancel} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Cluster Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Cluster Name"
                className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Choose Icon</label>
              <div className="grid grid-cols-5 gap-3 p-4 bg-[#F5F5F7] rounded-xl">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.icon}
                    onClick={() => handleInputChange('icon', opt.icon)}
                    type="button"
                    title={opt.name}
                    className={`aspect-square flex flex-col items-center justify-center p-2 rounded-xl transition-all ${formData.icon === opt.icon ? 'bg-[#1D1D1F] text-white ring-2 ring-[#1D1D1F]' : 'bg-white hover:bg-[#E5E5E7] text-[#1D1D1F]'}`}
                  >
                    <span className="mb-1 text-2xl">{opt.icon}</span>
                    <span className="text-[10px] font-medium truncate w-full text-center">{opt.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
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
                  <input type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" className={`w-full bg-white border ${errors.amount ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`} />
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
              <label className="text-sm font-medium text-[#1D1D1F] block">Internal Description</label>
              <textarea rows={3} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Internal notes (not shown to investors)" className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Public Description</label>
              <textarea rows={3} value={formData.publicDescription} onChange={(e) => handleInputChange('publicDescription', e.target.value)} placeholder="Shown to investors on the portal" className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Companies</label>
              {errors.companies && <p className="mt-1 text-xs text-red-500">{errors.companies}</p>}
              <div className="space-y-3">
                {companyRows.map((row) => (
                  <div key={row.key} className="p-3 space-y-2 bg-[#F5F5F7] rounded-xl">
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateCompanyRow(row.key, 'name', e.target.value)}
                        placeholder="Company name"
                        className="flex-1 bg-white border border-[#D2D2D7] rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeCompanyRow(row.key)}
                        title="Remove company"
                        className="p-2.5 text-red-600 transition-all rounded-xl hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={row.link}
                      onChange={(e) => updateCompanyRow(row.key, 'link', e.target.value)}
                      placeholder="Website (optional)"
                      className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                    />
                    <input
                      type="url"
                      value={row.logo}
                      onChange={(e) => updateCompanyRow(row.key, 'logo', e.target.value)}
                      placeholder="Logo URL (optional)"
                      className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addCompanyRow}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1D1D1F] border border-[#D2D2D7] rounded-xl hover:bg-[#F5F5F7] transition-all"
              >
                <PlusIcon size={16} />
                Add Company
              </button>
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
            {submitting ? 'Adding…' : 'Add Cluster'}
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
        .react-datepicker__day:hover { background-color: #F5F5F7; border-radius: 0.5rem; }
        .react-datepicker__navigation { top: 0.75rem; }
      `}</style>
    </div>
  );
}
