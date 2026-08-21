import React from 'react';
import { Edit2, ChevronRight, Power } from 'lucide-react';
import { formatDisplayDate } from '../../utils/valuation';

export default function AssetCard({ asset, onEdit, onClick, showNavigationIcon = false, onToggleStatus }) {
  const handleCardClick = () => {
    if (asset.enabled && onClick) onClick(asset);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (asset.enabled && onEdit) onEdit(asset);
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (onToggleStatus) onToggleStatus(asset.id, !asset.enabled);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-[#F5F5F7] rounded-2xl p-8 relative group shadow-sm transition-all duration-200 flex flex-col h-full
        ${asset.enabled
          ? 'hover:shadow-lg cursor-pointer border-l-4 border-emerald-500'
          : 'cursor-default border-l-4 border-red-500 bg-red-50'}
      `}
    >
      <div className="absolute flex items-center gap-2 top-4 right-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${asset.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${asset.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span>{asset.enabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      <div className="absolute flex items-center gap-2 top-4 right-4">
        {asset.enabled ? (
          <button onClick={handleEditClick} className="p-2 text-white transition-all bg-[#1D1D1F] rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#2D2D2F]">
            <Edit2 size={18} />
          </button>
        ) : (
          <button onClick={handleToggleClick} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all" title="Click to re-enable this asset">
            <Power size={16} />
            Enable
          </button>
        )}
      </div>

      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-[#1D1D1F] pr-32">{asset.name}</h3>
        {showNavigationIcon && asset.enabled && asset.allowsSubEntities && (
          <ChevronRight className="flex-shrink-0 text-[#6E6E73] group-hover:text-[#1D1D1F] transition-colors" size={24} />
        )}
      </div>

      <p className="text-sm text-[#6E6E73] leading-relaxed mb-6 flex-grow">{asset.description}</p>

      <div>
        <div className="text-2xl font-semibold text-[#1D1D1F]">{asset.valuation?.displayText}</div>
        <p className="text-xs text-[#6E6E73] mt-1 tracking-wide">
          AS AT {formatDisplayDate(asset.valuation?.asAtDate).toUpperCase()}
        </p>
      </div>
    </div>
  );
}