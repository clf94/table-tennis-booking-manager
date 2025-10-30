import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import { Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isAdmin() ? 'monthly' : 'trainer');
  const [monthlyData, setMonthlyData] = useState(null);
  const [trainerData, setTrainerData] = useState(null);
  const [aboData, setAboData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyReport();
    } else if (activeTab === 'trainer') {
      fetchTrainerReport();
    } else if (activeTab === 'abo') {
      fetchAboReport();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    try {
      const response = await client.get(`/reports/monthly?year=${selectedYear}&month=${selectedMonth}`);
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Failed to fetch monthly report:', error);
    }
  };

  const fetchTrainerReport = async () => {
    try {
      const response = await client.get(`/reports/trainers?year=${selectedYear}&month=${selectedMonth}`);
      setTrainerData(response.data);
    } catch (error) {
      console.error('Failed to fetch trainer report:', error);
    }
  };

  const fetchAboReport = async () => {
    try {
      const response = await client.get(`/reports/abo?year=${selectedYear}`);
      setAboData(response.data);
    } catch (error) {
      console.error('Failed to fetch ABO report:', error);
    }
  };

  const handleDownload = async (type, format) => {
    try {
      const response = await client.get(
        `/reports/download?type=${type}&format=${format}&year=${selectedYear}&month=${selectedMonth}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${selectedYear}_${selectedMonth}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const tabs = [
    ...(isAdmin() ? [
      { id: 'monthly', label: t('monthlyReport') },
      { id: 'abo', label: t('aboReport') }
    ] : []),
    { id: 'trainer', label: t('trainerBilling') }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('reports')}</h1>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 items-center">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        >
          {[2023, 2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        >
          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>
              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 border-b-2 font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Monthly Report */}
      {activeTab === 'monthly' && monthlyData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{monthlyData.total_bookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Table Earnings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${monthlyData.total_earnings.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">${monthlyData.total_revenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Earnings by Table</h2>
              <button
                onClick={() => handleDownload('monthly', 'csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                {t('download')} CSV
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(monthlyData.table_earnings || {}).map(([name, earnings]) => ({ name, earnings }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">ABO Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Subscriptions Sold</p>
                <p className="text-2xl font-bold text-gray-800">{monthlyData.abo_subscriptions_sold}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ABO Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${monthlyData.abo_revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Report */}
      {activeTab === 'trainer' && trainerData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hourly Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainerData.trainers.map((trainer) => (
                <tr key={trainer.trainer_id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{trainer.trainer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${trainer.hourly_rate.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trainer.total_hours.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                    ${trainer.total_earnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABO Report */}
      {activeTab === 'abo' && aboData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{aboData.active_abo_count}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Monthly Rate</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${aboData.monthly_rate.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Sales {selectedYear}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aboData.monthly_sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Subscriptions Sold" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Active ABO Holders</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aboData.active_abos.map((abo) => (
                  <tr key={abo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{abo.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{abo.abo_start}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{abo.abo_end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}