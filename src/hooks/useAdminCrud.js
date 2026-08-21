import { useState, useEffect, useCallback } from 'react';

export const useAdminCrud = ({ list, create, update, remove, extractList }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await list();
      const data = extractList ? extractList(res) : res?.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [list, extractList]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const saveItem = async (values, editingId) => {
    if (editingId) {
      await update({ id: editingId, ...values });
    } else {
      await create(values);
    }
    await fetchItems();
  };

  const removeItem = async (id) => {
    await remove({ id });
    await fetchItems();
  };

  return { items, loading, error, fetchItems, saveItem, removeItem };
};