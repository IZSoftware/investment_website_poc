import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getInvestorDashboardPortfolio,
  getInvestorClusters,
  getAdminClusters,
  updateAdminClusterStatus,
} from '../api/services';
import { formatDisplayDate } from '../utils/valuation';
import { useAuth } from '../context/AuthContext';
import EditSectorModal from '../components/InvestorPortal/EditSectorModal';
import AddSectorModal from '../components/InvestorPortal/AddSectorModal';

const PIE_PALETTE = ['#012060', '#2caffe', '#544fc5', '#00d4ff', '#f45b5b', '#91e8e1', '#f7a35c', '#8085e9'];

export default function InvestmentPortfolio() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const canEdit = userRole !== 'DEV';

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [pageInfo, setPageInfo] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusError, setStatusError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Editors list from the admin endpoint: /api/investor/** is filtered to
      // enabled records, so disabling a cluster there would hide it from the
      // very person who has to be able to switch it back on.
      const [portfolioRes, clustersRes] = await Promise.all([
        getInvestorDashboardPortfolio(),
        canEdit ? getAdminClusters() : getInvestorClusters(),
      ]);

      if (portfolioRes.success) {
        setPageInfo(portfolioRes.data);
      } else {
        setError(portfolioRes.message || 'Failed to load portfolio summary');
      }

      if (clustersRes.success) {
        setClusters(clustersRes.data || []);
      } else {
        setError((prev) => prev || clustersRes.message || 'Failed to load clusters');
      }
    } catch (err) {
      setError(err.response?.data?.message || err?.message || 'Failed to load investment portfolio data');
    } finally {
      setLoading(false);
    }
  }, [canEdit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (item) => {
    if (!canEdit) return;
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleAdd = () => setShowAddModal(true);

  const handleSaveEdit = async () => {
    setShowEditModal(false);
    setEditingItem(null);
    await fetchData();
  };

  const handleSaveAdd = async () => {
    setShowAddModal(false);
    await fetchData();
  };

  const handleDelete = async () => {
    setShowEditModal(false);
    setEditingItem(null);
    await fetchData();
  };

  // Single place the status PATCH is fired from — the card button and the edit
  // modal's toggle both delegate here.
  const handleToggleStatus = async (clusterId, enabledStatus) => {
    try {
      setStatusError(null);
      const response = await updateAdminClusterStatus({ id: clusterId, enabled: enabledStatus });
      if (response.success) {
        await fetchData();
      } else {
        setStatusError(response.message || 'Failed to update cluster status');
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || err?.message || 'Failed to update cluster status');
    }
  };

  const handleBack = () => navigate('/investor-portal/dashboard');

  if (loading && !pageInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 bg-white">
        Loading investment portfolio…
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

  const activeClusters = clusters.filter((c) => c.enabled);
  const pieData = activeClusters.map((c, idx) => ({
    name: c.name,
    value: c.valuation?.allocationPercent ?? 0,
    displayText: c.valuation?.displayText,
    color: PIE_PALETTE[idx % PIE_PALETTE.length],
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8 sm:py-10 lg:py-12">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 lg:gap-2 mb-6 lg:mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-medium sm:text-sm">Back to Dashboard</span>
            </button>

            <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">
                {pageInfo?.title || 'CLUSTER ALLOCATION'}
              </h1>
              {canEdit && (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-1.5 lg:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-[#1D1D1F] text-white rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                  <span className="font-medium">Add Cluster</span>
                </button>
              )}
            </div>

            {pageInfo?.introText && (
              <div className="max-w-4xl mb-8 lg:mb-12">
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

            {/* ── Cluster Allocation pie chart ── */}
            {pieData.length > 0 && (
              <div className="mb-12 lg:mb-16 bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#1D1D1F] mb-4 sm:mb-6 lg:mb-8">
                  Allocation Breakdown
                </h2>
                <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
                  <div className="w-full h-56 lg:w-1/2 xs:h-64 sm:h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius="45%"
                          outerRadius="80%"
                          paddingAngle={2}
                          dataKey="value"
                          label={({ value }) => `${value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value}% — ${props.payload.displayText ?? ''}`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full lg:w-1/2">
                    <div className="space-y-3 sm:space-y-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2.5 sm:py-3 border-b border-gray-200 last:border-0 gap-2">
                          <div className="flex items-center min-w-0 gap-2 sm:gap-3">
                            <div
                              className="flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-[#1D1D1F] text-sm sm:text-base truncate">{item.name}</span>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="block font-semibold text-[#1D1D1F] text-sm sm:text-base">{item.value}%</span>
                            <span className="block text-[10px] sm:text-xs text-[#6E6E73]">{item.displayText}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-6 lg:mb-8">
                Our Clusters Include:
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className={`bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 relative group shadow-lg hover:shadow-xl transition-shadow ${!cluster.enabled ? 'opacity-60' : ''}`}
                  >
                    <div className="absolute flex items-center gap-2 top-3 right-3 lg:top-4 lg:right-4">
                      {!cluster.enabled && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                          Disabled
                        </span>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(cluster)}
                          className="p-1.5 lg:p-2 text-white transition-all bg-black rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-800"
                        >
                          <Edit2 size={14} className="lg:w-[18px] lg:h-[18px]" />
                        </button>
                      )}
                    </div>
                    <div className="mb-3 text-3xl lg:mb-4 lg:text-4xl">{cluster.icon}</div>
                    <h3 className="text-lg lg:text-xl font-semibold text-[#1D1D1F] mb-2 lg:mb-3">
                      {cluster.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed mb-4 lg:mb-6">
                      {cluster.publicDescription}
                    </p>

                    {cluster.companies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
                        {cluster.companies.map((company, idx) => (
                          <span
                            key={company?.id || `${company?.name}-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-[11px] text-[#1D1D1F] border border-[#E5E5EA]"
                          >
                            {company?.logo && (
                              <img src={company.logo} alt="" className="object-contain w-4 h-4 rounded-full" />
                            )}
                            {company?.link ? (
                              <a
                                href={company.link}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                              >
                                {company?.name}
                              </a>
                            ) : (
                              company?.name
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    <div>
                      <div className="text-xl lg:text-2xl font-semibold text-[#1D1D1F]">
                        {cluster.valuation?.displayText}
                      </div>
                      <p className="text-xs text-[#6E6E73] mt-1">
                        {formatDisplayDate(cluster.valuation?.asAtDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {canEdit && (
        <>
          <EditSectorModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            cluster={editingItem}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
          <AddSectorModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveAdd}
          />
        </>
      )}
    </div>
  );
}
