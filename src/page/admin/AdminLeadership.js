import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { getAdminLeadership, createAdminLeadership, updateAdminLeadership, deleteAdminLeadership } from '../../api/services';

const AdminLeadership = () => (
  <AdminContentManager
    title="Leadership"
    description="Leadership quote and photo shown on your homepage."
    api={{ list: getAdminLeadership, create: createAdminLeadership, update: updateAdminLeadership, remove: deleteAdminLeadership }}
    columns={[
      { key: 'personName', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'sortOrder', label: 'Order' },
      { key: 'enabled', label: 'Enabled', render: (item) => (item.enabled ? 'Yes' : 'No') },
    ]}
    fields={[
      { name: 'personName', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true },
      { name: 'photoUrl', label: 'Photo URL', type: 'text' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox' },
    ]}
  />
);

export default AdminLeadership;