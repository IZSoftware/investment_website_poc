import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssetById, findSubEntity, getBreadcrumbPath } from '../data/assetData';
import AssetCard from '../components/InvestorPortal/AssetCard';
import EditAssetModal from '../components/InvestorPortal/EditAssetModal';
import AddAssetModal from '../components/InvestorPortal/AddAssetModal';

export default function AssetSubEntities() {
  const navigate = useNavigate();
  const { assetId, subId } = useParams();
  
  const [currentAsset, setCurrentAsset] = useState(null);
  const [subEntities, setSubEntities] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    let loadedAsset;
    let loadedSubs = [];

    if (subId) {
      loadedAsset = findSubEntity(assetId, subId);
      loadedSubs = loadedAsset?.subEntities || [];
    } else {
      loadedAsset = getAssetById(assetId);
      loadedSubs = loadedAsset?.subEntities || [];
    }

    setCurrentAsset(loadedAsset);
    setSubEntities(loadedSubs);
    setBreadcrumbs(getBreadcrumbPath(assetId, subId));
  }, [assetId, subId]);

  const handleCardClick = (asset) => {
    if (asset.enabled && asset.subEntities && asset.subEntities.length > 0) {
      if (subId) {
        console.log('Maximum nesting reached');
      } else {
        navigate(`/investor-portal/net-assets/${assetId}/${asset.id}`);
      }
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedAsset) => {
    setSubEntities(subEntities.map(a => 
      a.id === updatedAsset.id ? updatedAsset : a
    ));
  };

  const handleDelete = (entityId) => {
    setSubEntities(subEntities.filter(a => a.id !== entityId));
  };

  const handleToggleStatus = (entityId, enabledStatus) => {
    setSubEntities(prev => prev.map(entity => 
      entity.id === entityId ? { ...entity, enabled: enabledStatus } : entity
    ));
  };

  const handleAddSubEntity = (newEntityData) => {
    const newEntity = {
      id: newEntityData.title.toLowerCase().replace(/\s+/g, '-'),
      ...newEntityData,
      subEntities: []
    };
    setSubEntities([...subEntities, newEntity]);
  };

  const handleBack = () => {
    // Safe back: always go to main list or previous breadcrumb if valid
    if (breadcrumbs.length > 1) {
      const previous = breadcrumbs[breadcrumbs.length - 2];
      navigate(previous.path);
    } else {
      navigate('/investor-portal/net-assets');
    }
  };

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  if (!currentAsset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">Asset Not Found</h2>
          <p className="text-[#6E6E73] mb-6">The requested asset could not be found.</p>
          <button
            onClick={() => navigate('/investor-portal/net-assets')}
            className="px-6 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all"
          >
            Back to Net Assets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-12 sm:px-6 lg:px-8">
            
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-6 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2 mb-8 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.path)}
                    className={`
                      transition-colors
                      ${index === breadcrumbs.length - 1 
                        ? 'text-[#1D1D1F] font-medium' 
                        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                      }
                    `}
                  >
                    {crumb.title}
                  </button>
                  {index < breadcrumbs.length - 1 && <ChevronRight size={16} className="text-[#D2D2D7]" />}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
                  {currentAsset.title.toUpperCase()}
                </h1>
                <p className="text-sm text-[#6E6E73]">
                  {currentAsset.description}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                <span className="font-medium">Add Sub-Entity</span>
              </button>
            </div>

            <div className="mb-12 p-8 bg-[#F5F5F7] rounded-2xl border-l-4 border-[#1D1D1F]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <p className="text-xs text-[#6E6E73] uppercase tracking-wider mb-2 font-medium">
                    Total Valuation
                  </p>
                  <p className="text-3xl font-semibold text-[#1D1D1F]">
                    {currentAsset.value}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] uppercase tracking-wider mb-2 font-medium">
                    Status
                  </p>
                  <div className={`
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                    ${currentAsset.enabled 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                    }
                  `}>
                    <div className={`w-2 h-2 rounded-full ${currentAsset.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {currentAsset.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] uppercase tracking-wider mb-2 font-medium">
                    As At Date
                  </p>
                  <p className="text-sm text-[#1D1D1F] font-medium">
                    {currentAsset.date}
                  </p>
                </div>
              </div>
            </div>

            {subEntities.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
                    Sub-Entities
                  </h2>
                  <p className="text-[#6E6E73]">
                    Detailed breakdown of {currentAsset.title.toLowerCase()} NF Holding s
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-3">
                  {subEntities.map((entity) => (
                    <AssetCard
                      key={entity.id}
                      asset={entity}
                      onEdit={handleEdit}
                      onClick={handleCardClick}
                      showNavigationIcon={!subId && entity.enabled && entity.subEntities?.length > 0}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-[#6E6E73]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">
                    No Sub-Entities Yet
                  </h3>
                  <p className="text-[#6E6E73] mb-6">
                    Start by adding sub-entities to break down {currentAsset.title.toLowerCase()}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all"
                  >
                    <Plus size={20} />
                    <span>Add First Sub-Entity</span>
                  </button>
                </div>
              </div>
            )}
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
        onSave={handleAddSubEntity}
        parentTitle={currentAsset.title}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>
    </div>
  );
}