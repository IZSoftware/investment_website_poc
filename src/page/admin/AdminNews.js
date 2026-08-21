import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { getAdminNews, createAdminNews, updateAdminNews, deleteAdminNews } from '../../api/services';

const AdminNews = () => (
  <AdminContentManager
    title="News"
    description="Articles shown on your public news section."
    api={{ list: getAdminNews, create: createAdminNews, update: updateAdminNews, remove: deleteAdminNews }}
    columns={[
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'publishDate', label: 'Date' },
      { key: 'published', label: 'Status', render: (item) => (item.published ? 'Published' : 'Draft') },
    ]}
    fields={[
      { name: 'slug', label: 'Slug (URL-friendly, e.g. my-article)', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'publishDate', label: 'Publish Date', type: 'date', required: true },
      { name: 'excerpt', label: 'Excerpt (short summary)', type: 'textarea' },
      { name: 'body', label: 'Full Article Body', type: 'textarea' },
      { name: 'coverImageUrl', label: 'Cover Image URL', type: 'text' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ]}
  />
);

export default AdminNews;