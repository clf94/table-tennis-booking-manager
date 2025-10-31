import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { Search, Filter } from 'lucide-react';

export default function Bookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterTrainer, setFilterTrainer] = useState('');
  const [tables, setTables] = useState([]);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchTables();
    fetchTrainers();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.trainer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Table filter
    if (filterTable) {
      filtered = filtered.filter(b => b.table_id === parseInt(filterTable));
    }

    // Trainer filter
    if (filterTrainer) {
      if (filterTrainer === 'none') {
        filtered = filtered.filter(b => !b.trainer_id);
      } else {
        filtered = filtered.filter(b => b.trainer_id === parseInt(filterTrainer));
      }
    }

    setFilteredBookings(filtered);
  }, [searchTerm, filterTable, filterTrainer, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await client.get('/bookings');
      // Sort by date and time descending
      const sorted = response.data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      });
      setBookings(sorted);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await client.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await client.get('/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('bookings')}</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">{t('all_tables')}</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterTrainer}
              onChange={(e) => setFilterTrainer(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">{t('all_trainers')}</option>
              <option value="none">{t('no_trainer')}</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600"> {t('total_bookings')}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{filteredBookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">{t('withTrainer')}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {filteredBookings.filter(b => b.trainer_id).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">{t('aboHolder')}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {filteredBookings.filter(b => b.is_abo).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('time')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customer')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('trainer')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('duration')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('price')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(booking.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.table_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.trainer_name ? (
                      <span className="text-amber-600">{booking.trainer_name}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                    €{booking.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.is_abo && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        ABO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {t('no_bookings_found')}
        </div>
      )}
    </div>
  );
}