import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { getAdminTimeline, createAdminTimeline, updateAdminTimeline, deleteAdminTimeline } from '../../api/services';

const AdminTimeline = () => (
  <AdminContentManager
    title="Timeline"
    description="Milestones shown on your About page's company journey."
    api={{ list: getAdminTimeline, create: createAdminTimeline, update: updateAdminTimeline, remove: deleteAdminTimeline }}
    columns={[
      { key: 'year', label: 'Year' },
      { key: 'title', label: 'Title' },
      { key: 'sortOrder', label: 'Order' },
      { key: 'enabled', label: 'Enabled', render: (item) => (item.enabled ? 'Yes' : 'No') },
    ]}
    fields={[
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox' },
    ]}
  />
);

export default AdminTimeline;