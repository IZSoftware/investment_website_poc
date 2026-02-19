import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTopLevelAssets } from '../data/assetData';
import AssetCard from '../components/InvestorPortal/AssetCard';
import EditAssetModal from '../components/InvestorPortal/EditAssetModal';
import AddAssetModal from '../components/InvestorPortal/AddAssetModal';

export default function NetAssets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState(getTopLevelAssets());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const handleCardClick = (asset) => {
    // Only navigate if enabled and has sub-entities
    if (asset.enabled && asset.subEntities && asset.subEntities.length > 0) {
      navigate(`/investor-portal/net-assets/${asset.id}`);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset({ ...asset, type: 'asset' });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedAsset) => {
    setAssets(assets.map(a => 
      a.id === updatedAsset.id ? updatedAsset : a
    ));
  };

  const handleDelete = (assetId) => {
    setAssets(assets.filter(a => a.id !== assetId));
  };

  const handleToggleStatus = (assetId, enabledStatus) => {
    setAssets(assets.map(asset => {
      if (asset.id === assetId) {
        return { ...asset, enabled: enabledStatus };
      }
      return asset;
    }));
  };

  const handleAddAsset = (newAssetData) => {
    const newAsset = {
      id: newAssetData.title.toLowerCase().replace(/\s+/g, '-'),
      ...newAssetData,
      enabled: true,
      subEntities: []
    };
    setAssets([...assets, newAsset]);
  };

  const handleBack = () => {
    navigate('/investor-portal/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-12 sm:px-6 lg:px-8">
            
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
                  NET ASSETS
                </h1>
                <p className="text-sm text-[#6E6E73]">
                  Asset Classes Overview
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                <span className="font-medium">Add Asset Class</span>
              </button>
            </div>

            {/* Description Text */}
            <div className="max-w-4xl mb-16">
              <p className="text-lg text-[#6E6E73] leading-relaxed">
                We enable our depositors to allocate their funds to specialized portfolios that hold securities of the same type. 
                The vast majority of these portfolios is managed actively, primarily internally.
              </p>
            </div>

            {/* Assets Grid - show ALL assets, enabled or disabled */}
            <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={handleEdit}
                  onClick={handleCardClick}
                  showNavigationIcon={asset.enabled} // only show arrow if enabled
                  onToggleStatus={handleToggleStatus} // ← NEW: pass toggle handler
                />
              ))}
            </div>

            {/* Info Box - updated text to explain re-enabling */}
            <div className="max-w-4xl p-6 bg-[#F5F5F7] rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-1 h-1 mt-2 bg-[#1D1D1F] rounded-full" />
                <div>
                  <p className="text-sm text-[#6E6E73] leading-relaxed">
                    <span className="font-medium text-[#1D1D1F]">Note:</span> Click on any enabled asset class to view its sub-entities. 
                    Disabled assets appear grayed out with a toggle switch — flip it to re-enable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>

      <EditAssetModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        asset={editingAsset}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAsset}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>
    </div>
  );
}