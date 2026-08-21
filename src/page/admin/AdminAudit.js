import React from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminAudit = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Audit Log</h1>
            <p className="mt-2 text-gray-500">Coming online in this release.</p>
          </div>

          <div className="px-4 pb-16 sm:px-6 lg:px-0">
            <div className="px-6 py-16 text-center text-gray-400 bg-white border border-gray-200 shadow-lg rounded-xl" />
          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default AdminAudit;
