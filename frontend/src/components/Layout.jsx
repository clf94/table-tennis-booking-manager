import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  UserCircle, 
  BarChart3, 
  Settings, 
  LogOut,
  Globe,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard, adminOnly: true },
    { name: t('calendar'), path: '/calendar', icon: Calendar },
    { name: t('bookings'), path: '/bookings', icon: BookOpen, adminOnly: true },
    { name: t('customers'), path: '/customers', icon: Users, adminOnly: true },
    { name: t('trainers'), path: '/trainers', icon: UserCircle, adminOnly: true },
    { name: t('reports'), path: '/reports', icon: BarChart3 },
    { name: t('settings'), path: '/settings', icon: Settings, adminOnly: true },
  ];

  const filteredNav = navigation.filter(item => !item.adminOnly || isAdmin());

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-white rounded-lg shadow"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white shadow-lg w-64 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}
      >
        <div className="p-6 flex justify-between items-center md:block">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🏓 TT Booking</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="md:hidden">
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="mt-6 flex-1 overflow-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t md:border-t mt-auto">
          {/* Language Selector */}
          <div className="mb-4">
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-2" />
              {t('language')}
            </div>
            <div className="flex gap-2">
              {['en', 'de', 'ru', 'es'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`px-3 py-1 text-xs rounded ${
                    i18n.language === lng
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-0 md:ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
