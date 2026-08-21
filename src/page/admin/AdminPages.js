import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { getAdminPages, createAdminPage, updateAdminPage, deleteAdminPage } from '../../api/services';

const AdminPages = () => (
  <AdminContentManager
    title="Pages"
    description="Section content for pages like About Us and Investment Approach."
    api={{ list: getAdminPages, create: createAdminPage, update: updateAdminPage, remove: deleteAdminPage }}
    columns={[
      { key: 'pageKey', label: 'Page' },
      { key: 'sectionKey', label: 'Section' },
      { key: 'title', label: 'Title' },
      { key: 'sortOrder', label: 'Order' },
    ]}
    fields={[
      { name: 'pageKey', label: 'Page Key (e.g. about-us)', type: 'text', required: true },
      { name: 'sectionKey', label: 'Section Key (e.g. hero)', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'body', label: 'Body Text', type: 'textarea' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox' },
    ]}
  />
);

export default AdminPages;