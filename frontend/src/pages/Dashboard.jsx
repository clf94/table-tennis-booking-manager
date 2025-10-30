import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Calendar, Users, TrendingUp, Euro } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayEarnings: 0,
    monthlyEarnings: 0,
    todayBookings: 0,
    activeSubscriptions: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Fetch today's report
      const dailyReport = await client.get(`/reports/daily?date=${today}`);
      
      // Fetch monthly report
      const monthlyReport = await client.get(`/reports/monthly?year=${currentYear}&month=${currentMonth}`);
      
      // Fetch ABO report
      const aboReport = await client.get('/reports/abo');

      setStats({
        todayEarnings: dailyReport.data.total_earnings,
        monthlyEarnings: monthlyReport.data.total_revenue,
        todayBookings: dailyReport.data.total_bookings,
        activeSubscriptions: aboReport.data.active_abo_count
      });

      // Prepare chart data
      const chartData = Object.entries(monthlyReport.data.table_earnings || {}).map(([table, earnings]) => ({
        name: table,
        earnings: earnings
      }));
      setMonthlyData(chartData);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('dashboard')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('todayBookings')}
          value={stats.todayBookings}
          icon={Calendar}
          color="bg-blue-500"
        />
        <StatCard
          title={t('totalEarnings') + ' (Today)'}
          value={`$${stats.todayEarnings.toFixed(2)}`}
          icon={Euro}
          color="bg-green-500"
        />
        <StatCard
          title={t('earningsThisMonth')}
          value={`$eur{stats.monthlyEarnings.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title={t('activeSubscriptions')}
          value={stats.activeSubscriptions}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {t('earningsThisMonth')} by Table
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="earnings" fill="#3b82f6" name="Earnings (€)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}