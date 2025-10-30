import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarView() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    trainer_id: '',
    table_id: '',
    date: '',
    time: '',
    duration: 60,
    info: ''
  });
  const [customers, setCustomers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
    fetchTrainers();
    fetchTables();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await client.get('/bookings');
      const calendarEvents = response.data.map(booking => ({
        id: booking.id,
        title: `${booking.customer_name} - ${booking.table_name}`,
        start: `${booking.date}T${booking.time}`,
        end: calculateEndTime(booking.date, booking.time, booking.duration),
        backgroundColor: booking.is_abo ? '#10b981' : booking.trainer_id ? '#f59e0b' : '#3b82f6',
        extendedProps: booking
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await client.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
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

  const fetchTables = async () => {
    try {
      const response = await client.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

const calculateEndTime = (date, time, duration) => {
  if (!date || !time) {
    console.warn('Invalid date or time:', date, time);
    return null;
  }

  // Ensure hours are zero-padded (2:30 → 02:30)
  let [hours, minutes] = time.split(':');
  hours = hours.padStart(2, '0');
  minutes = minutes.padStart(2, '0');

  // Construct ISO string with 'T'
  const start = new Date(`${date}T${hours}:${minutes}`);
  if (isNaN(start.getTime())) {
    console.warn('Invalid Date object for:', date, time);
    return null;
  }

  start.setMinutes(start.getMinutes() + duration);
  return start.toISOString();
};


  const handleDateClick = (info) => {
    if (!isAdmin()) return;
    
    const dateStr = info.dateStr.split('T')[0];
    const timeStr = info.dateStr.split('T')[1]?.substring(0, 5) || '09:00';
    
    setFormData({
      customer_id: '',
      trainer_id: '',
      table_id: tables[0]?.id || '',
      date: dateStr,
      time: timeStr,
      duration: 60,
      info: ''
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    if (!isAdmin()) return;
    
    const booking = info.event.extendedProps;
    setFormData({
      customer_id: booking.customer_id,
      trainer_id: booking.trainer_id || '',
      table_id: booking.table_id,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      info: booking.info || ''
    });
    setSelectedEvent(booking);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        trainer_id: formData.trainer_id || null
      };
      
      if (selectedEvent) {
        await client.put(`/bookings/${selectedEvent.id}`, data);
      } else {
        await client.post('/bookings', data);
      }
      
      setShowModal(false);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save booking');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !confirm('Delete this booking?')) return;
    
    try {
      await client.delete(`/bookings/${selectedEvent.id}`);
      setShowModal(false);
      fetchBookings();
    } catch (error) {
      alert('Failed to delete booking');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">{t('calendar')}</h1>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 overflow-x-auto">
        <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
            <span>{t('withoutTrainer')}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rounded"></div>
            <span>{t('withTrainer')}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
            <span>{t('aboHolder')}</span>
          </div>
        </div>

        <div className="w-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={isAdmin()}
            selectable={isAdmin()}
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            height="auto"
            contentHeight="auto"
            dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && isAdmin() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {selectedEvent ? t('editBooking') : t('newBooking')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('customer')}</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('trainer')}</label>
                <select
                  value={formData.trainer_id}
                  onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="">No trainer</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('table')}</label>
                <select
                  value={formData.table_id}
                  onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  required
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('time')}</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('duration')}</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  required
                >
                  <option value="30">30 {t('minutes')}</option>
                  <option value="60">60 {t('minutes')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('info')}</label>
                <textarea
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  rows="3"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                >
                  {t('cancel')}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}