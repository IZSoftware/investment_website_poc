import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default function EditSectorModal({ isOpen, onClose, sector, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    icon: '🏭',
    valuationNumber: '',
    valuationCurrency: '$',
    valuationType: 'B',
    percentage: '',
    description: '',
    selectedDate: null
  });

  const [errors, setErrors] = useState({});

  // Combined icon list – old + new sectors
  const iconOnlySectors = [
    // Original ones
    { id: 'manufacturing', icon: '🏭', name: 'Manufacturing' },
    { id: 'investment',    icon: '📊', name: 'Investment (Diversified)' },
    { id: 'healthcare',    icon: '🏥', name: 'Healthcare' },
    { id: 'agriculture',   icon: '🌾', name: 'Agriculture' },
    { id: 'education',     icon: '🎓', name: 'Education' },
    // New ones you provided
    { id: 'technology',    icon: '💻', name: 'Technology' },
    { id: 'energy',        icon: '⚡',  name: 'Energy' },
    { id: 'power',         icon: '🔋',  name: 'Power' },
    { id: 'finance',       icon: '💰',  name: 'Finance' },
    { id: 'hospitality',   icon: '🏨',  name: 'Hospitality' },
    { id: 'real-estate',   icon: '🏢',  name: 'Real Estate' },
  ];

  // Parse existing value to extract currency, number and type
  const parseValue = (valueStr) => {
    if (!valueStr) return { currency: '$', number: '', type: 'B' };
    
    const currency = valueStr.startsWith('KES') ? 'KES' : '$';
    const match = valueStr.match(/[\d,.]+/);
    const number = match ? match[0] : '';
    const type = valueStr.includes('B') ? 'B' : valueStr.includes('M') ? 'M' : valueStr.includes('Th') ? 'Th' : 'B';
    
    return { currency, number, type };
  };

  // Parse date string to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const datePart = dateStr.replace('AS AT ', '');
    return moment(datePart, 'MMMM D, YYYY').toDate();
  };

  useEffect(() => {
    if (sector) {
      const parsed = parseValue(sector.value);
      setFormData({
        title: sector.title || '',
        icon: sector.icon || '🏭',
        valuationNumber: parsed.number,
        valuationCurrency: parsed.currency,
        valuationType: parsed.type,
        percentage: '',
        description: sector.description || '',
        selectedDate: parseDate(sector.date)
      });
    }
  }, [sector]);

  if (!isOpen || !sector) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Sector name is required';
    if (!formData.valuationNumber) newErrors.valuationNumber = 'Valuation number is required';
    if (!formData.selectedDate) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let typeSuffix = '';
    if (formData.valuationType === 'B') typeSuffix = 'B';
    else if (formData.valuationType === 'M') typeSuffix = 'M';
    else if (formData.valuationType === 'Th') typeSuffix = 'Th';
    
    const formattedValue = `${formData.valuationCurrency} ${formData.valuationNumber} ${typeSuffix}`.trim();
    
    const formattedDate = formData.selectedDate 
      ? `AS AT ${moment(formData.selectedDate).format('MMMM D, YYYY').toUpperCase()}`
      : '';

    const updatedSector = {
      ...sector,
      title: formData.title,
      icon: formData.icon,
      description: formData.description,
      value: formattedValue,
      date: formattedDate,
      valueDescription: 'Total Value'
    };

    onSave(updatedSector);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${sector.title}"?`)) {
      onDelete(sector.id);
      onClose();
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
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F]">Edit Sector</h3>
            <p className="text-sm text-[#6E6E73] mt-1">Edit sector information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Sector Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Sector Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Sector Name"
                className={`w-full bg-white border ${errors.title ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Choose Icon <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-3 p-4 bg-[#F5F5F7] rounded-xl">
                {iconOnlySectors.map((sectorIcon) => (
                  <button
                    key={sectorIcon.id}
                    onClick={() => handleInputChange('icon', sectorIcon.icon)}
                    className={`
                      aspect-square flex flex-col items-center justify-center p-2 rounded-xl transition-all
                      ${formData.icon === sectorIcon.icon 
                        ? 'bg-[#1D1D1F] text-white ring-2 ring-[#1D1D1F]' 
                        : 'bg-white hover:bg-[#E5E5E7] text-[#1D1D1F]'
                      }
                    `}
                    title={sectorIcon.name}
                    type="button"
                  >
                    <span className="mb-1 text-2xl">{sectorIcon.icon}</span>
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {sectorIcon.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#6E6E73] mt-1">
                Selected icon: {formData.icon || '(none)'}
              </p>
            </div>

            {/* Valuation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">
                Valuation <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <select
                    value={formData.valuationCurrency}
                    onChange={(e) => handleInputChange('valuationCurrency', e.target.value)}
                    className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236E6E73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="$">USD ($)</option>
                    <option value="KES">KES</option>
                  </select>
                </div>

                <div className="col-span-5">
                  <input
                    type="number"
                    value={formData.valuationNumber}
                    onChange={(e) => handleInputChange('valuationNumber', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full bg-white border ${errors.valuationNumber ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
                  />
                </div>

                <div className="col-span-4">
                  <select
                    value={formData.valuationType}
                    onChange={(e) => handleInputChange('valuationType', e.target.value)}
                    className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236E6E73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="Th">Thousands (Th)</option>
                    <option value="M">Millions (M)</option>
                    <option value="B">Billions (B)</option>
                  </select>
                </div>
              </div>
              {errors.valuationNumber && <p className="mt-1 text-xs text-red-500">{errors.valuationNumber}</p>}
            </div>

            {/* Percentage */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F] block">% / Shares</label>
              <input
                type="text"
                value={formData.percentage}
                onChange={(e) => handleInputChange('percentage', e.target.value)}
                placeholder="Enter The % per share"
                className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
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

            {/* Date */}
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
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7] flex-shrink-0">
          <button
            onClick={handleDelete}
            className="px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl"
          >
            Delete Sector
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        /* DatePicker styles remain unchanged */
      `}</style>
    </div>
  );
}