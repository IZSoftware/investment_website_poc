import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminCountries,
  createAdminCountry,
  updateAdminCountry,
  deleteAdminCountry,
  updateAdminCountryStatus,
} from '../../api/services';

// Portfolio writes: everyone but DEV. Deletes exclude FINANCIAL_ADMIN (README §8.1).
const CAN_WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'INVESTOR'];
const CAN_DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'INVESTOR'];

const AdminCountries = () => {
  const { userRole } = useAuth();
  const canWrite = CAN_WRITE_ROLES.includes(userRole);
  const canDelete = CAN_DELETE_ROLES.includes(userRole);

  return (
    <AdminContentManager
      title="Countries"
      itemLabel="Country"
      description="Markets shown on your Total Portfolio page."
      api={{
        list: getAdminCountries,
        create: createAdminCountry,
        update: updateAdminCountry,
        remove: deleteAdminCountry,
      }}
      canWrite={canWrite}
      canDelete={canDelete}
      statusToggle={{ onToggle: (id, enabled) => updateAdminCountryStatus({ id, enabled }) }}
      columns={[
        { key: 'name', label: 'Country', render: (item) => <span className="font-medium text-gray-900">{item.name}</span> },
        { key: 'valuation', label: 'Valuation', render: (item) => item.valuation?.displayText ?? '—' },
        {
          key: 'allocation',
          label: 'Allocation %',
          render: (item) =>
            item.valuation?.allocationPercent === undefined ? '—' : `${item.valuation.allocationPercent}%`,
        },
        {
          key: 'enabled',
          label: 'Enabled',
          render: (item) => (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                item.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.enabled ? 'Enabled' : 'Disabled'}
            </span>
          ),
        },
        { key: 'sortOrder', label: 'Order' },
      ]}
      fields={[
        { name: 'name', label: 'Country name', type: 'text', required: true },
        { name: 'valuation', label: 'Valuation', type: 'valuation' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'enabled', label: 'Enabled', type: 'checkbox' },
      ]}
    />
  );
};

export default AdminCountries;
