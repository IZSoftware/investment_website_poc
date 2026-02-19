import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default function AddCountryModal({ isOpen, onClose, onSave, supportedCountries }) {
  const [formData, setFormData] = useState({
    name: '',
    years: '',
    valuationNumber: '',
    valuationCurrency: '$',
    valuationType: 'B',
    selectedDate: null
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        years: '',
        valuationNumber: '',
        valuationCurrency: '$',
        valuationType: 'B',
        selectedDate: null
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Country name is required';
    if (!formData.years) newErrors.years = 'Number of years is required';
    if (!formData.valuationNumber) newErrors.valuationNumber = 'Valuation number is required';
    if (!formData.selectedDate) newErrors.date = 'Date is required';
    
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    // Construct valuation string
    let typeSuffix = '';
    if (formData.valuationType === 'B') typeSuffix = 'B';
    else if (formData.valuationType === 'M') typeSuffix = 'M';
    else if (formData.valuationType === 'Th') typeSuffix = 'Th';
    
    const formattedValue = `${formData.valuationCurrency} ${formData.valuationNumber} ${typeSuffix}`.trim();
    
    // Format date with "AS AT" prefix
    const formattedDate = formData.selectedDate 
      ? `AS AT ${moment(formData.selectedDate).format('MMMM D, YYYY').toUpperCase()}`
      : '';

    const countryData = {
      name: formData.name,
      years: `${formData.years} years`,
      value: formattedValue,
      date: formattedDate
    };

    onSave(countryData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      years: '',
      valuationNumber: '',
      valuationCurrency: '$',
      valuationType: 'B',
      selectedDate: null
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={handleCancel}
      />
      
      <div 
        className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7]">
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F]">Add Country</h3>
            <p className="text-sm text-[#6E6E73] mt-1">
              Add a new country to your portfolio
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Country Name Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Country Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all appearance-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236E6E73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Select Country</option>
              {supportedCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Number of Years */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Number of Years <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.years}
              onChange={(e) => handleInputChange('years', e.target.value)}
              placeholder="Enter number of years"
              min="1"
              max="100"
              className={`w-full bg-white border ${errors.years ? 'border-red-500' : 'border-[#D2D2D7]'} rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all`}
            />
            {errors.years && (
              <p className="mt-1 text-xs text-red-500">{errors.years}</p>
            )}
          </div>

          {/* Valuation with Currency and Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Valuation <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-12 gap-3">
              {/* Currency Dropdown */}
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

              {/* Number Input */}
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

              {/* Type Dropdown */}
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
            {errors.valuationNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.valuationNumber}</p>
            )}
            <p className="text-xs text-[#6E6E73] mt-1">
              Preview: {formData.valuationCurrency} {formData.valuationNumber || '0'} {
                formData.valuationType === 'Th' ? 'Th' : 
                formData.valuationType === 'M' ? 'M' : 'B'
              }
            </p>
          </div>

          {/* Date Picker - Using react-datepicker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              As At Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
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
            </div>
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date}</p>
            )}
            
            {/* Date Preview */}
            {formData.selectedDate && (
              <p className="text-xs text-[#1D1D1F] mt-2 font-medium">
                Preview: AS AT {moment(formData.selectedDate).format('MMMM D, YYYY').toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D2D2D7]">
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all"
          >
            Add Country
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* React DatePicker custom styles */
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker__input-container {
          width: 100%;
        }
        
        .react-datepicker {
          font-family: 'Inter', sans-serif;
          border: 1px solid #D2D2D7;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .react-datepicker__header {
          background-color: #F5F5F7;
          border-bottom: 1px solid #D2D2D7;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding-top: 0.75rem;
        }
        
        .react-datepicker__current-month {
          color: #1D1D1F;
          font-weight: 600;
        }
        
        .react-datepicker__day-name {
          color: #6E6E73;
        }
        
        .react-datepicker__day--selected {
          background-color: #1D1D1F;
          border-radius: 0.5rem;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #F5F5F7;
          color: #1D1D1F;
        }
        
        .react-datepicker__day:hover {
          background-color: #F5F5F7;
          border-radius: 0.5rem;
        }
        
        .react-datepicker__navigation {
          top: 0.75rem;
        }
        
        .react-datepicker__year-dropdown-container,
        .react-datepicker__month-dropdown-container {
          margin: 0 0.25rem;
        }
        
        .react-datepicker__year-read-view--down-arrow,
        .react-datepicker__month-read-view--down-arrow {
          border-color: #6E6E73;
        }
      `}</style>
    </div>
  );
}