import React from 'react';
import AdminContentManager from '../../components/admin/AdminContentManager';
import { useAuth } from '../../context/AuthContext';
import { getAdminNews, createAdminNews, updateAdminNews, deleteAdminNews } from '../../api/services';

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const AdminNews = () => {
  const { userRole } = useAuth();
  const canWrite = WRITE_ROLES.includes(userRole);

  return (
    <AdminContentManager
      title="News"
      itemLabel="Article"
      description="Articles shown on your public news section."
      canWrite={canWrite}
      api={{ list: getAdminNews, create: createAdminNews, update: updateAdminNews, remove: deleteAdminNews }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'publishDate', label: 'Date' },
        {
          key: 'published',
          label: 'Status',
          render: (item) => (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.published ? 'Published' : 'Draft'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'publishDate', label: 'Publish Date', type: 'date' },
        { name: 'message', label: 'Article Body', type: 'textarea' },
        { name: 'imageUrl', label: 'Article Image', type: 'upload', folder: 'news' },
        // New articles start as drafts — publishing is an explicit choice.
        { name: 'published', label: 'Published', type: 'checkbox', defaultValue: false },
        {
          // Optional by contract: the server derives a unique slug from the title when omitted.
          name: 'slug',
          label: 'Slug',
          type: 'text',
          placeholder: 'auto-generated from the title',
          help: 'Optional — leave blank and the server derives a unique URL slug from the title.',
        },
      ]}
    />
  );
};

export default AdminNews;
