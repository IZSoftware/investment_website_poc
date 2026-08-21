import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getInvestorAssets, getInvestorAssetSubEntities, updateAdminSubEntityStatus } from '../api/services';
import AssetCard from '../components/InvestorPortal/AssetCard';
import EditAssetModal from '../components/InvestorPortal/EditAssetModal';
import AddSubEntityModal from '../components/InvestorPortal/AddSubEntityModal';

const formatAsAtDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `AS AT ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}`;
};

export default function AssetSubEntities() {
  const navigate = useNavigate();
  const { assetId } = useParams();

  const [parentAsset, setParentAsset] = useState(null);
  const [subEntities, setSubEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [assetsRes, subEntitiesRes] = await Promise.all([
          getInvestorAssets(),
          getInvestorAssetSubEntities({ assetId }),
        ]);

        if (assetsRes.success) {
          const found = assetsRes.data.find((a) => a.id === assetId);
          setParentAsset(found || null);
        }

        if (subEntitiesRes.success) {
          setSubEntities(subEntitiesRes.data);
        } else {
          setError(subEntitiesRes.message || 'Failed to load sub-entities');
        }
      } catch (err) {
        setError(err?.message || 'Failed to load sub-entities');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assetId]);

  const handleEdit = (subEntity) => {
    setEditingEntity({ ...subEntity, type: 'sub-entity' });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updated) => {
    setSubEntities((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDelete = (id) => {
    setSubEntities((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleStatus = async (id, enabledStatus) => {
    try {
      const response = await updateAdminSubEntityStatus({ id, enabled: enabledStatus });
      if (response.success) {
        setSubEntities((prev) => prev.map((s) => (s.id === id ? response.data : s)));
      } else {
        console.error('Failed to update sub-entity status:', response.message);
      }
    } catch (err) {
      console.error('Failed to update sub-entity status:', err);
    }
  };

  const handleAddSubEntity = (newSubEntity) => {
    setSubEntities((prev) => [...prev, newSubEntity]);
  };

  const handleBack = () => {
    navigate('/investor-portal/net-assets');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">Loading sub-entities…</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8 sm:py-10 lg:py-12">

            <div className="flex items-center gap-1.5 mb-4 text-xs sm:text-sm text-[#6E6E73]">
              <Link to="/investor-portal/net-assets" className="hover:text-[#1D1D1F] transition-colors">
                Net Assets
              </Link>
              <span>›</span>
              <span className="text-[#1D1D1F] font-medium">{parentAsset?.name}</span>
            </div>

            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 lg:gap-2 mb-6 lg:mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-medium sm:text-sm">Back to Net Assets</span>
            </button>

            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-1 lg:mb-2 uppercase">
                  {parentAsset?.name || 'ASSET'}
                </h1>
                <p className="text-xs sm:text-sm text-[#6E6E73]">{parentAsset?.description}</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                <span className="font-medium">Add Sub-Entity</span>
              </button>
            </div>

            <div className="relative p-6 mb-12 border-l-4 border-[#1D1D1F] bg-gray-50 rounded-r-xl lg:mb-16">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Total Valuation</p>
                  <p className="text-2xl font-bold text-[#1D1D1F] sm:text-3xl">
                    {parentAsset?.valuation?.displayText ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      parentAsset?.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${parentAsset?.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {parentAsset?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">As At Date</p>
                  <p className="text-sm font-medium text-[#1D1D1F] sm:text-base">
                    {formatAsAtDate(parentAsset?.valuation?.asAtDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 lg:mb-8">
              <h2 className="text-xl font-bold text-[#1D1D1F] sm:text-2xl mb-1">Sub-Entities</h2>
              <p className="text-xs sm:text-sm text-[#6E6E73]">
                Detailed breakdown of {(parentAsset?.name || 'this asset').toLowerCase()} NF Holding
              </p>
            </div>

            {subEntities.length === 0 ? (
              <p className="text-sm text-[#6E6E73]">No sub-entities yet for this asset.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16 md:grid-cols-2 lg:grid-cols-3">
                {subEntities.map((subEntity) => (
                  <AssetCard
                    key={subEntity.id}
                    asset={subEntity}
                    onEdit={handleEdit}
                    onClick={() => {}}
                    showNavigationIcon={false}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>

      <EditAssetModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        asset={editingEntity}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <AddSubEntityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSubEntity}
        assetId={assetId}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>
    </div>
  );
}