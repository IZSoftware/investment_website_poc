import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { getAdminValues, createAdminValue, updateAdminValue, deleteAdminValue } from '../../api/services';

const AdminValues = () => (
  <AdminContentManager
    title="Values"
    description="Core values shown on your About page."
    api={{ list: getAdminValues, create: createAdminValue, update: updateAdminValue, remove: deleteAdminValue }}
    columns={[
      { key: 'number', label: '#' },
      { key: 'title', label: 'Title' },
      { key: 'sortOrder', label: 'Order' },
      { key: 'enabled', label: 'Enabled', render: (item) => (item.enabled ? 'Yes' : 'No') },
    ]}
    fields={[
      { name: 'number', label: 'Number (e.g. 01)', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox' },
    ]}
  />
);

export default AdminValues;