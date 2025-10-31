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
    try {
      // Handle date that might already be a string or Date object
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const timeStr = typeof time === 'string' ? time : time;
      
      // Create date object
      const start = new Date(`${dateStr}T${timeStr}`);
      
      // Check if date is valid
      if (isNaN(start.getTime())) {
        return new Date().toISOString(); // Return current time as fallback
      }
      
      // Add duration
      start.setMinutes(start.getMinutes() + duration);
      return start.toISOString();
    } catch (error) {
      console.error('Error calculating end time:', error);
      return new Date().toISOString(); // Fallback
    }
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
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">{t('calendar')}</h1>

      <div className="bg-white rounded-lg shadow p-3 lg:p-6">
        <div className="mb-4 flex flex-wrap gap-2 lg:gap-4 text-xs lg:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-blue-500 rounded"></div>
            <span>{t('withoutTrainer')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-amber-500 rounded"></div>
            <span>{t('withTrainer')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded"></div>
            <span>{t('aboHolder')}</span>
          </div>
        </div>

        {/* Calendar wrapper with responsive styles */}
        <div className="calendar-wrapper">
          <style>{`
            .calendar-wrapper .fc {
              font-size: 0.75rem;
            }
            
            @media (min-width: 640px) {
              .calendar-wrapper .fc {
                font-size: 0.875rem;
              }
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc {
                font-size: 1rem;
              }
            }
            
            .calendar-wrapper .fc-toolbar {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            @media (min-width: 640px) {
              .calendar-wrapper .fc-toolbar {
                flex-direction: row;
              }
            }
            
            .calendar-wrapper .fc-toolbar-chunk {
              display: flex;
              justify-content: center;
              margin: 0.25rem 0;
            }
            
            .calendar-wrapper .fc-button {
              padding: 0.25rem 0.5rem !important;
              font-size: 0.75rem !important;
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc-button {
                padding: 0.5rem 1rem !important;
                font-size: 0.875rem !important;
              }
            }
            
            .calendar-wrapper .fc-toolbar-title {
              font-size: 1rem !important;
            }
            
            @media (min-width: 640px) {
              .calendar-wrapper .fc-toolbar-title {
                font-size: 1.25rem !important;
              }
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc-toolbar-title {
                font-size: 1.5rem !important;
              }
            }
            
            .calendar-wrapper .fc-col-header-cell {
              padding: 0.25rem !important;
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc-col-header-cell {
                padding: 0.5rem !important;
              }
            }
            
            .calendar-wrapper .fc-daygrid-day {
              min-height: 60px;
            }
            
            @media (min-width: 640px) {
              .calendar-wrapper .fc-daygrid-day {
                min-height: 80px;
              }
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc-daygrid-day {
                min-height: 100px;
              }
            }
            
            .calendar-wrapper .fc-event {
              font-size: 0.65rem;
              padding: 1px 2px;
            }
            
            @media (min-width: 640px) {
              .calendar-wrapper .fc-event {
                font-size: 0.75rem;
                padding: 2px 4px;
              }
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc-event {
                font-size: 0.875rem;
              }
            }
            
            .calendar-wrapper .fc-timegrid-slot {
              height: 2rem;
            }
            
            @media (min-width: 1024px) {
              .calendar-wrapper .fc-timegrid-slot {
                height: 3rem;
              }
            }
          `}</style>
          
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: window.innerWidth < 640 ? 'timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
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
            aspectRatio={window.innerWidth < 768 ? 1 : 1.5}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && isAdmin() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">
              {selectedEvent ? t('editBooking') : t('newBooking')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('customer')}</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
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
                  onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
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
                  onChange={(e) => setFormData({...formData, table_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  required
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('date')}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('time')}</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('duration')}</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
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
                  onChange={(e) => setFormData({...formData, info: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  rows="3"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm lg:text-base"
                >
                  {t('cancel')}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm lg:text-base"
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