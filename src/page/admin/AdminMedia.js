import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { getAdminMedia, createAdminMedia, updateAdminMedia, deleteAdminMedia } from '../../api/services';

const AdminMedia = () => (
  <AdminContentManager
    title="Media"
    description="Video content shown on your homepage."
    api={{ list: getAdminMedia, create: createAdminMedia, update: updateAdminMedia, remove: deleteAdminMedia }}
    columns={[
      { key: 'title', label: 'Title' },
      { key: 'durationLabel', label: 'Duration' },
      { key: 'sortOrder', label: 'Order' },
      { key: 'enabled', label: 'Enabled', render: (item) => (item.enabled ? 'Yes' : 'No') },
    ]}
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'videoUrl', label: 'Video URL', type: 'text', required: true },
      { name: 'thumbnailUrl', label: 'Thumbnail URL', type: 'text' },
      { name: 'durationLabel', label: 'Duration Label (e.g. 2:45 min)', type: 'text' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox' },
    ]}
  />
);

export default AdminMedia;