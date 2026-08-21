import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar';
import SlideOver from './SlideOver';
import { useAdminCrud } from '../../hooks/useAdminCrud';
import { uploadFile, deleteFile } from '../../api/services';

const ImageField = ({ label, url, objectName, onChange, folder }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadFile({ file, folder });
      onChange({ url: res.data.url, objectName: res.data.objectName });
    } catch (err) {
      console.error(err);
      setError('Upload failed. Max size is 5MB.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (objectName) {
      try {
        await deleteFile({ objectName });
      } catch (err) {
        console.error(err);
      }
    }
    onChange({ url: '', objectName: '' });
  };

  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
      {url ? (
        <div className="flex items-center gap-3">
          <img src={url} alt="" className="object-cover w-16 h-16 border border-gray-200 rounded-lg" />
          <button type="button" onClick={handleRemove} className="text-sm font-semibold text-red-600 hover:text-red-800">
            Remove
          </button>
        </div>
      ) : (
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="w-full text-sm" />
      )}
      {uploading && <p className="mt-1 text-xs text-gray-400">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

const AdminContentManager = ({ title, description, api, fields, columns, extractList, uploadFolder }) => {
  const { items, loading, error, saveItem, removeItem } = useAdminCrud({
    list: api.list,
    create: api.create,
    update: api.update,
    remove: api.remove,
    extractList,
  });

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [imageMeta, setImageMeta] = useState({}); // { [fieldName]: objectName } — kept out of the submit payload
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const emptyForm = () => Object.fromEntries(fields.map((f) => [f.name, f.type === 'checkbox' ? true : '']));

  const openCreate = () => {
    setEditingId(null);
    setFormValues(emptyForm());
    setImageMeta({});
    setFormError(null);
    setSlideOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormValues(Object.fromEntries(fields.map((f) => [f.name, item[f.name] ?? (f.type === 'checkbox' ? true : '')])));
    setImageMeta({}); // objectName for existing images isn't returned by list/detail endpoints — only known after a fresh upload in this session
    setFormError(null);
    setSlideOpen(true);
  };

  const handleChange = (name, value) => setFormValues((prev) => ({ ...prev, [name]: value }));

  const handleImageChange = (name, { url, objectName }) => {
    setFormValues((prev) => ({ ...prev, [name]: url }));
    setImageMeta((prev) => ({ ...prev, [name]: objectName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...formValues };
      fields.forEach((f) => {
        if (f.type === 'number') payload[f.name] = payload[f.name] === '' ? 0 : Number(payload[f.name]);
      });
      // imageMeta (objectName) is a client-side-only detail for delete-on-replace; never send it to the backend
      await saveItem(payload, editingId);
      setSlideOpen(false);
    } catch (err) {
      console.error(err);
      setFormError('Could not save. Please check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await removeItem(id);
    } catch (err) {
      console.error(err);
      alert('Could not delete this item.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex items-center justify-between px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
              {description && <p className="mt-2 text-gray-500">{description}</p>}
            </div>
            <button
              onClick={openCreate}
              className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              + Add New
            </button>
          </div>

          {error && <div className="px-4 pb-4 text-sm text-red-600 sm:px-6 lg:px-0">{error}</div>}

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    {columns.map((col) => (
                      <th key={col.key} className="px-6 py-3 font-semibold">{col.label}</th>
                    ))}
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-400">No items yet</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        {columns.map((col) => (
                          <td key={col.key} className="max-w-xs px-6 py-4 truncate">
                            {col.render ? col.render(item) : String(item[col.key] ?? '')}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openEdit(item)} className="mr-4 font-semibold text-[#0A2540] hover:text-[#003852]">Edit</button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === item.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      <SlideOver open={slideOpen} title={editingId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`} onClose={() => setSlideOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((f) => (
            <div key={f.name}>
              {f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!formValues[f.name]}
                    onChange={(e) => handleChange(f.name, e.target.checked)}
                  />
                  {f.label}
                </label>
              ) : f.type === 'image' ? (
                <ImageField
                  label={f.label}
                  url={formValues[f.name]}
                  objectName={imageMeta[f.name]}
                  onChange={(val) => handleImageChange(f.name, val)}
                  folder={uploadFolder}
                />
              ) : (
                <>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={formValues[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      required={f.required}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  ) : (
                    <input
                      type={f.type ?? 'text'}
                      value={formValues[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      required={f.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  )}
                </>
              )}
            </div>
          ))}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0A2540] hover:bg-[#003852] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
};

export default AdminContentManager;