import React from 'react';

const Reports = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Reports & Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Attendance Reports</h3>
          <p className="text-gray-600">View team attendance statistics and trends</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
          <p className="text-gray-600">Track player and team performance data</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Financial Reports</h3>
          <p className="text-gray-600">Monitor club finances and revenue</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;

