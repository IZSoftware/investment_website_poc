import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getInvestorAssets,
  getAdminAssets,
  getInvestorDashboardNetAssets,
  updateAdminAssetStatus,
} from '../api/services';
import { useAuth } from '../context/AuthContext';
import AssetCard from '../components/InvestorPortal/AssetCard';
import EditAssetModal from '../components/InvestorPortal/EditAssetModal';
import AddAssetModal from '../components/InvestorPortal/AddAssetModal';

export default function NetAssets() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const canEdit = userRole !== 'DEV';

  const [assets, setAssets] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Editors list from the admin endpoint: /api/investor/** hides disabled
        // records, which would strand a disabled asset out of reach.
        const [assetsRes, dashboardRes] = await Promise.all([
          canEdit ? getAdminAssets() : getInvestorAssets(),
          getInvestorDashboardNetAssets(),
        ]);

        if (assetsRes.success) {
          setAssets(assetsRes.data || []);
        } else {
          setError(assetsRes.message || 'Failed to load assets');
        }

        if (dashboardRes.success) {
          setPageInfo(dashboardRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err?.message || 'Failed to load assets');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canEdit]);

  // Drill-down only exists for assets the backend says can hold subclasses.
  const handleCardClick = (asset) => {
    if (asset.enabled && asset.allowsSubclasses) {
      navigate(`/investor-portal/net-assets/${asset.id}`);
    }
  };

  const handleEdit = (asset) => {
    if (!canEdit) return;
    setEditingAsset({ ...asset, type: 'asset' });
    setShowEditModal(true);
  };

  // EditAssetModal already called updateAdminAsset and succeeded — this just
  // merges the server's response into local state.
  const handleSaveEdit = (updatedAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
  };

  // EditAssetModal already called deleteAdminAsset and succeeded.
  const handleDelete = (assetId) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  // Single source of truth for the status PATCH call — both AssetCard's quick
  // "Enable" button and EditAssetModal's toggle switch call this same handler
  // (via the onToggleStatus prop) instead of making their own API calls.
  const handleToggleStatus = async (assetId, enabledStatus) => {
    try {
      setStatusError(null);
      const response = await updateAdminAssetStatus({ id: assetId, enabled: enabledStatus });
      if (response.success) {
        setAssets((prev) => prev.map((a) => (a.id === assetId ? response.data : a)));
      } else {
        setStatusError(response.message || 'Failed to update asset status');
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || err?.message || 'Failed to update asset status');
    }
  };

  // AddAssetModal already called createAdminAsset and succeeded.
  const handleAddAsset = (newAsset) => {
    setAssets((prev) => [...prev, newAsset]);
  };

  const handleBack = () => {
    navigate('/investor-portal/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">
        Loading assets…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8 sm:py-10 lg:py-12">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 lg:gap-2 mb-6 lg:mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-medium sm:text-sm">Back to Dashboard</span>
            </button>

            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center lg:mb-12">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-1 lg:mb-2">
                  {pageInfo?.title || 'NET ASSETS'}
                </h1>
                <p className="text-xs sm:text-sm text-[#6E6E73]">Asset Classes Overview</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                  <span className="font-medium">Add Asset Class</span>
                </button>
              )}
            </div>

            {pageInfo?.introText && (
              <div className="max-w-4xl mb-12 lg:mb-16">
                <p className="text-sm sm:text-base lg:text-lg text-[#6E6E73] leading-relaxed">
                  {pageInfo.introText}
                </p>
              </div>
            )}

            {statusError && (
              <div className="max-w-4xl px-4 py-3 mb-8 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
                {statusError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={canEdit ? handleEdit : undefined}
                  onClick={handleCardClick}
                  showNavigationIcon={asset.enabled}
                  onToggleStatus={canEdit ? handleToggleStatus : undefined}
                />
              ))}
            </div>

            <div className="max-w-4xl p-4 sm:p-5 lg:p-6 bg-[#F5F5F7] rounded-xl lg:rounded-2xl">
              <div className="flex items-start gap-2 lg:gap-3">
                <div className="flex-shrink-0 w-0.5 h-0.5 lg:w-1 lg:h-1 mt-1.5 lg:mt-2 bg-[#1D1D1F] rounded-full" />
                <div>
                  <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
                    <span className="font-medium text-[#1D1D1F]">Note:</span> Click on any enabled asset class that
                    allows subclasses to view its subclasses.
                    {canEdit && ' Disabled assets appear grayed out with a toggle switch — flip it to re-enable.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>

      {canEdit && (
        <>
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
        </>
      )}
    </div>
  );
}
