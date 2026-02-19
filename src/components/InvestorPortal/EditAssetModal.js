import { useState } from 'react';
import { X, Power, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default function EditAssetModal({ isOpen, onClose, asset, onSave, onDelete, onToggleStatus }) {
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

  const initialParsed = parseValue(asset?.value);

  const [formData, setFormData] = useState({
    title: asset?.title || '',
    description: asset?.description || '',
    valuationNumber: initialParsed.number,
    valuationCurrency: initialParsed.currency,
    valuationType: initialParsed.type,
    selectedDate: parseDate(asset?.date),
    enabled: asset?.enabled ?? true,
    showSubEntities: asset?.showSubEntities ?? true
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !asset) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const { valuationNumber, valuationCurrency, valuationType } = formData;
    let typeSuffix = '';
    
    if (valuationType === 'B') typeSuffix = 'B';
    else if (valuationType === 'M') typeSuffix = 'M';
    else if (valuationType === 'Th') typeSuffix = 'Th';
    
    const formattedValue = `${valuationCurrency} ${valuationNumber} ${typeSuffix}`.trim();
    
    const formattedDate = formData.selectedDate 
      ? `AS AT ${moment(formData.selectedDate).format('MMMM D, YYYY').toUpperCase()}`
      : '';

    // FIXED: Preserve ALL original fields first, then apply edits
    onSave({
      ...asset,                        // ← original asset first (id, subEntities, type, everything!)
      ...formData,                     // ← then apply edited fields
      value: formattedValue,
      date: formattedDate,
      id: asset.id,                    // safety net
      subEntities: asset.subEntities || [],  // safety net
      type: asset.type                 // safety net
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(asset.id);
    onClose();
  };

  const handleToggleStatus = () => {
    const newStatus = !formData.enabled;
    setFormData(prev => ({ ...prev, enabled: newStatus }));
    if (onToggleStatus) {
      onToggleStatus(asset.id, newStatus);
    }
  };

  const handleToggleSubEntities = () => {
    const newStatus = !formData.showSubEntities;
    setFormData(prev => ({ ...prev, showSubEntities: newStatus }));
    if (onToggleStatus) {
      onToggleStatus(asset.id, formData.enabled, newStatus);
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
        className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#D2D2D7]">
          <h3 className="text-xl font-semibold text-[#1D1D1F]">
            {asset.type === 'asset' ? 'Edit Asset' : 'Edit Sub-Entity'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Toggle Section */}
          <div className="space-y-4 p-4 bg-[#F5F5F7] rounded-xl">
            {/* Main Status Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">
                  <div className="flex items-center gap-2">
                    <Power size={16} className={formData.enabled ? 'text-emerald-500' : 'text-[#6E6E73]'} />
                    {asset.type === 'asset' ? 'Asset Status' : 'Sub-Entity Status'}
                  </div>
                </label>
                <p className="text-xs text-[#6E6E73]">
                  {formData.enabled 
                    ? `${asset.type === 'asset' ? 'Asset' : 'Sub-entity'} is currently enabled and visible` 
                    : `${asset.type === 'asset' ? 'Asset' : 'Sub-entity'} is currently disabled and hidden`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200
                  ${formData.enabled ? 'bg-emerald-500' : 'bg-[#D2D2D7]'}
                `}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200
                    ${formData.enabled ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Sub-Entities Visibility Toggle (only for assets) */}
            {asset.type === 'asset' && (
              <div className="flex items-center justify-between pt-4 border-t border-[#D2D2D7]/50">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#1D1D1F] block mb-1">
                    Sub-Entities Visibility
                  </label>
                  <p className="text-xs text-[#6E6E73]">
                    {formData.showSubEntities 
                      ? 'Sub-entities are visible under this asset' 
                      : 'Sub-entities are hidden for this asset'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSubEntities}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200
                    ${formData.showSubEntities ? 'bg-blue-500' : 'bg-[#D2D2D7]'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200
                      ${formData.showSubEntities ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Asset/Sub-Entity Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              {asset.type === 'asset' ? 'Asset Name' : 'Sub-Entity Name'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={asset.type === 'asset' ? 'Asset Name' : 'Sub-Entity Name'}
              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description"
              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Valuation with Currency and Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              Valuation
            </label>
            <div className="grid grid-cols-12 gap-3">
              {/* Currency Dropdown */}
              <div className="col-span-3">
                <select
                  value={formData.valuationCurrency}
                  onChange={(e) => handleChange('valuationCurrency', e.target.value)}
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent appearance-none"
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
                  onChange={(e) => handleChange('valuationNumber', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all"
                />
              </div>

              {/* Type Dropdown */}
              <div className="col-span-4">
                <select
                  value={formData.valuationType}
                  onChange={(e) => handleChange('valuationType', e.target.value)}
                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent appearance-none"
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
            <p className="text-xs text-[#6E6E73] mt-1">
              Example: $ 219.4 B, KES 150.2 M
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1D1D1F] block">
              As At Date
            </label>
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
            {formData.selectedDate && (
              <p className="text-xs text-[#1D1D1F] mt-1 font-medium">
                Preview: AS AT {moment(formData.selectedDate).format('MMMM D, YYYY').toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#D2D2D7]">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 transition-all hover:text-red-700 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={16} />
              Delete {asset.type === 'asset' ? 'Asset' : 'Sub-Entity'}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6E6E73]">Are you sure?</span>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
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
              className="px-6 py-3 bg-[#1D1D1F] text-white font-medium rounded-xl hover:bg-[#2D2D2F] transition-all"
            >
              Save Changes
            </button>
          </div>
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
      `}</style>
    </div>
  );
}