import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { getPublicPortfolio } from '../../api/services';

const AdminPortfolio = () => {
  const [assetClasses, setAssetClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPortfolio = async () => {
      try {
        const res = await getPublicPortfolio();
        if (isMounted && Array.isArray(res?.data)) {
          setAssetClasses(res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError('Failed to load portfolio.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPortfolio();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Portfolio</h1>
            <p className="mt-2 text-gray-500">Asset classes shown on your Total Portfolio and About pages.</p>
          </div>

          <div className="px-4 pb-16 sm:px-6 lg:px-0">

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-semibold">Asset Class</th>
                    <th className="px-6 py-3 font-semibold">Valuation</th>
                    <th className="px-6 py-3 font-semibold">Allocation %</th>
                    <th className="px-6 py-3 font-semibold">Sub-entities</th>
                    <th className="px-6 py-3 font-semibold">Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
                  ) : assetClasses.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No asset classes found</td></tr>
                  ) : (
                    assetClasses.map((asset) => (
                      <tr key={asset.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                        <td className="px-6 py-4 text-gray-600">{asset.valuation?.displayText}</td>
                        <td className="px-6 py-4 text-gray-600">{asset.valuation?.allocationPercent}%</td>
                        <td className="px-6 py-4 text-gray-600">{asset.subEntities?.length ?? 0}</td>
                        <td className="px-6 py-4 text-gray-600">{asset.sortOrder}</td>
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
    </div>
  );
};

export default AdminPortfolio;