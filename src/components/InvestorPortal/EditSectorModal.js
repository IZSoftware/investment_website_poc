import { useState, useEffect } from 'react';
import { X, Power, Trash2, Plus as PlusIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateAdminSector, deleteAdminSector } from '../../api/services';
import { VALUATION_UNITS, CURRENCY_OPTIONS, buildValuation, parseValuation, formatAsAtDate } from '../../utils/valuation';

const ICON_OPTIONS = [
  { icon: '🏭', name: 'Manufacturing' },
  { icon: '📊', name: 'Investment' },
  { icon: '🏥', name: 'Healthcare' },
  { icon: '🌾', name: 'Agriculture' },
  { icon: '🎓', name: 'Education' },
  { icon: '💻', name: 'Technology' },
  { icon: '⚡', name: 'Energy' },
  { icon: '🔋', name: 'Power' },
  { icon: '💰', name: 'Finance' },
  { icon: '🏨', name: 'Hospitality' },
  { icon: '🏢', name: 'Real Estate' },
];

export default function EditSectorModal({ isOpen, onClose, sector, onSave, onDelete, onToggleStatus }) {
  const [formData, setFormData] = useState({
    name: '', icon: '🏭', description: '', publicDescription: '', companies: [],
    currency: 'USD', amount: '', unit: 'BILLIONS', allocationPercent: '', selectedDate: null, enabled: true,
  });
  const [companyInput, setCompanyInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (sector) {
      const parsedVal = parseValuation(sector.valuation);
      setFormData({
        name: sector.name || '',
        icon: sector.icon || '🏭',
        description: sector.description || '',
        publicDescription: sector.publicDescription || '',
        companies: sector.companies || [],
        currency: parsedVal.currency,
        amount: parsedVal.amount,
        unit: parsedVal.unit,
        allocationPercent: parsedVal.allocationPercent,
        selectedDate: parsedVal.asAtDate,
        enabled: sector.enabled ?? true,
      });
      setSubmitError(null);
      setShowDeleteConfirm(false);
    }
  }, [sector]);

  if (!isOpen || !sector) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const addCompany = () => {
    const trimmed = companyInput.trim();
    if (trimmed && !formData.companies.includes(trimmed)) {
      handleInputChange('companies', [...formData.companies, trimmed]);
    }
    setCompanyInput('');
  };

  const removeCompany = (company) => {
    handleInputChange('companies', formData.companies.filter((c) => c !== company));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Sector name is required';
    if (!formData.amount) newErrors.amount = 'Valuation number is required';
    if (!formData.selectedDate) newErrors.date = 'Date is required';
    return newErrors;
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
      const response = await updateAdminSector({
        id: sector.id,
        name: formData.name,
        icon: formData.icon,
        description: formData.description,
        publicDescription: formData.publicDescription,
        companies: formData.companies,
        valuation,
        enabled: formData.enabled,
        sortOrder: sector.sortOrder ?? 0,
      });

      if (response.success) {
        onSave(response.data);
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
      const response = await deleteAdminSector({ id: sector.id });
      if (response.success) {
        onDelete(sector.id);
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
    if (onToggleStatus) onToggleStatus(sector.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7] flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F]">Edit Sector</h3>
            <p className="text-sm text-[#6E6E73] mt-1">Edit sector information</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-xl">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">
                  <div className="flex items-center gap-2">
                    <Power size={16} className={formData.enabled ? 'text-emerald-500' : 'text-[#6E6E73]'} />
                    Sector Status
                  </div>
                </label>
                <p className="text-xs text-[#6E6E73]">
                  {formData.enabled ? 'Sector is currently enabled and visible' : 'Sector is currently disabled and hidden'}
                </p>
              </div>
              <button type="button" onClick={handleToggleStatus} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${formData.enabled ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}`}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Sector Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Sector Name"
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
              <textarea rows={3} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Internal notes" className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Public Description</label>
              <textarea rows={3} value={formData.publicDescription} onChange={(e) => handleInputChange('publicDescription', e.target.value)} placeholder="Shown to investors" className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">Companies</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }}
                  placeholder="Company name"
                  className="flex-1 bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
                <button type="button" onClick={addCompany} className="px-4 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all">
                  <PlusIcon size={18} />
                </button>
              </div>
              {formData.companies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.companies.map((company) => (
                    <span key={company} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] rounded-full text-sm text-[#1D1D1F]">
                      {company}
                      <button type="button" onClick={() => removeCompany(company)} className="text-[#6E6E73] hover:text-red-600">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7] flex-shrink-0">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl">
              <Trash2 size={16} />
              Delete Sector
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