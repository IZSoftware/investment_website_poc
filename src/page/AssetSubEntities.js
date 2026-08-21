import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getInvestorAssets,
  getAdminAssets,
  getInvestorAssetSubclasses,
  getAdminAssetSubclasses,
  updateAdminAssetSubclassStatus,
} from '../api/services';
import { formatDisplayDate } from '../utils/valuation';
import { useAuth } from '../context/AuthContext';
import AssetCard from '../components/InvestorPortal/AssetCard';
import EditAssetModal from '../components/InvestorPortal/EditAssetModal';
import AddSubEntityModal from '../components/InvestorPortal/AddSubEntityModal';

// Asset subclasses are the second and LAST level of the portfolio tree — there
// is no nested subclass route, so nothing here links deeper than this page.
export default function AssetSubclasses() {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const { userRole } = useAuth();
  const canEdit = userRole !== 'DEV';

  const [parentAsset, setParentAsset] = useState(null);
  const [subclasses, setSubclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubclass, setEditingSubclass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // No single-asset endpoint exists — the parent is picked out of the list
        // response. Editors read the admin lists, which unlike /api/investor/**
        // still contain disabled records so they can be switched back on.
        const [assetsRes, subclassesRes] = await Promise.all([
          canEdit ? getAdminAssets() : getInvestorAssets(),
          canEdit ? getAdminAssetSubclasses({ assetId }) : getInvestorAssetSubclasses({ assetId }),
        ]);

        if (assetsRes.success) {
          // Route params are always strings; compare as strings so the match cannot
          // hinge on how the id happens to be serialized.
          const found = (assetsRes.data || []).find((a) => String(a.id) === String(assetId));
          setParentAsset(found || null);
        }

        if (subclassesRes.success) {
          setSubclasses(subclassesRes.data || []);
        } else {
          setError(subclassesRes.message || 'Failed to load subclasses');
        }
      } catch (err) {
        setError(err.response?.data?.message || err?.message || 'Failed to load subclasses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assetId, canEdit]);

  const handleEdit = (subclass) => {
    if (!canEdit) return;
    setEditingSubclass({ ...subclass, type: 'subclass' });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updated) => {
    setSubclasses((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDelete = (id) => {
    setSubclasses((prev) => prev.filter((s) => s.id !== id));
  };

  // Single place the subclass status PATCH is fired from.
  const handleToggleStatus = async (id, enabledStatus) => {
    try {
      setStatusError(null);
      const response = await updateAdminAssetSubclassStatus({ id, enabled: enabledStatus });
      if (response.success) {
        setSubclasses((prev) => prev.map((s) => (s.id === id ? response.data : s)));
      } else {
        setStatusError(response.message || 'Failed to update subclass status');
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || err?.message || 'Failed to update subclass status');
    }
  };

  const handleAddSubclass = (newSubclass) => {
    setSubclasses((prev) => [...prev, newSubclass]);
  };

  const handleBack = () => {
    navigate('/investor-portal/net-assets');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">Loading subclasses…</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">{error}</div>;
  }

  // The create endpoint 400s when the asset cannot hold subclasses, so the
  // control is hidden in that case rather than offered and rejected.
  const canAddSubclass = canEdit && parentAsset?.allowsSubclasses;
  const asAtDate = formatDisplayDate(parentAsset?.valuation?.asAtDate);

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
              {canAddSubclass && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                  <span className="font-medium">Add Subclass</span>
                </button>
              )}
            </div>

            {statusError && (
              <div className="max-w-4xl px-4 py-3 mb-8 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
                {statusError}
              </div>
            )}

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
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${parentAsset?.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {parentAsset?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">As At Date</p>
                  <p className="text-sm font-medium text-[#1D1D1F] sm:text-base">
                    {asAtDate ? `AS AT ${asAtDate.toUpperCase()}` : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 lg:mb-8">
              <h2 className="text-xl font-bold text-[#1D1D1F] sm:text-2xl mb-1">Subclasses</h2>
              <p className="text-xs sm:text-sm text-[#6E6E73]">
                Detailed breakdown of {(parentAsset?.name || 'this asset').toLowerCase()}
              </p>
            </div>

            {subclasses.length === 0 ? (
              <p className="text-sm text-[#6E6E73]">No subclasses yet for this asset.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-12 sm:gap-5 lg:gap-6 lg:mb-16 md:grid-cols-2 lg:grid-cols-3">
                {subclasses.map((subclass) => (
                  <AssetCard
                    key={subclass.id}
                    asset={subclass}
                    onEdit={canEdit ? handleEdit : undefined}
                    onClick={undefined}
                    showNavigationIcon={false}
                    onToggleStatus={canEdit ? handleToggleStatus : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>

      {canEdit && (
        <>
          <EditAssetModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            asset={editingSubclass}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          <AddSubEntityModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddSubclass}
            assetId={assetId}
          />
        </>
      )}
    </div>
  );
}
