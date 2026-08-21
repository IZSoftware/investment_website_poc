import { useState, useEffect, useCallback } from 'react';

// Normalizes any failure (HTTP error or success:false envelope) into an Error
// carrying the SERVER's message plus the validation errors[] (README §2/§3),
// so pages surface real messages instead of generic strings.
const toApiError = (err, fallback) => {
  const data = err?.response?.data;
  const normalized = new Error(data?.message || err?.message || fallback);
  normalized.status = err?.response?.status;
  normalized.fieldErrors = data?.errors ?? [];
  return normalized;
};

export const useAdminCrud = ({ list, create, update, remove, extractList }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // [{ field, message }] from the last failed save — cleared on the next attempt.
  const [fieldErrors, setFieldErrors] = useState([]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const envelope = await list();
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load data.');
        setItems([]);
        return;
      }
      const data = extractList ? extractList(envelope) : envelope?.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [list, extractList]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const saveItem = async (values, editingId) => {
    setFieldErrors([]);
    let envelope;
    try {
      envelope = editingId
        ? await update({ id: editingId, ...values })
        : await create(values);
    } catch (err) {
      const apiError = toApiError(err, 'Could not save.');
      setFieldErrors(apiError.fieldErrors);
      throw apiError;
    }
    if (envelope?.success === false) {
      setFieldErrors(envelope?.errors ?? []);
      const apiError = new Error(envelope?.message || 'Could not save.');
      apiError.fieldErrors = envelope?.errors ?? [];
      throw apiError;
    }
    await fetchItems();
    return envelope;
  };

  const removeItem = async (id) => {
    let envelope;
    try {
      envelope = await remove({ id });
    } catch (err) {
      throw toApiError(err, 'Could not delete.');
    }
    if (envelope?.success === false) {
      throw new Error(envelope?.message || 'Could not delete.');
    }
    await fetchItems();
    return envelope;
  };

  return { items, loading, error, fieldErrors, fetchItems, saveItem, removeItem };
};

// Paged list over an endpoint whose envelope.data is a Spring Page
// { content[], totalElements, totalPages, number, ... } (README §8.10).
// fetchFn signature: ({ page, size }) => envelope. Built for the audit page.
export const useAdminPagedList = (fetchFn, { size = 20 } = {}) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (targetPage) => {
    try {
      setLoading(true);
      setError(null);
      const envelope = await fetchFn({ page: targetPage, size });
      if (envelope?.success === false) {
        setError(envelope?.message || 'Failed to load data.');
        setItems([]);
        return;
      }
      const pageData = envelope?.data ?? {};
      setItems(Array.isArray(pageData.content) ? pageData.content : []);
      setTotalPages(pageData.totalPages ?? 0);
      setTotalElements(pageData.totalElements ?? 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, size]);

  useEffect(() => { load(page); }, [load, page]);

  const refresh = useCallback(() => load(page), [load, page]);

  return { items, page, totalPages, totalElements, loading, error, setPage, refresh };
};
