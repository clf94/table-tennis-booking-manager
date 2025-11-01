import React from 'react';
import { useState } from 'react';
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
  Shield
} from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard, adminOnly: true },
    { name: t('calendar'), path: '/calendar', icon: Calendar },
    { name: t('bookings'), path: '/bookings', icon: BookOpen, adminOnly: true },
    { name: t('customers'), path: '/customers', icon: Users, adminOnly: true },
    { name: t('trainers'), path: '/trainers', icon: UserCircle, adminOnly: true },
    { name: t('reports'), path: '/reports', icon: BarChart3 },
    { name: t('settings'), path: '/settings', icon: Settings, adminOnly: true },
    { name: t('users'), path: '/users', icon: Shield, adminOnly: true },
  ];

  const filteredNav = navigation.filter(item => !item.adminOnly || isAdmin());

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-4 lg:p-6 border-b">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">🏓 TT Booking</h1>
          <p className="text-xs lg:text-sm text-gray-600 mt-1 truncate">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 lg:px-6 py-3 text-sm lg:text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 lg:p-6 border-t mt-auto">
          {/* Language Selector */}
          <div className="mb-4">
            <div className="flex items-center mb-2 text-xs lg:text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('language')}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 lg:gap-2">
              {['en', 'de', 'ru', 'es'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`px-2 py-1 text-xs rounded ${
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
            className="flex items-center w-full px-3 lg:px-4 py-2 text-sm lg:text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">{t('logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
		
	{/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600">
              <p>© 2025 Table Tennis Booking Manager. All rights reserved.</p>
              <div className="flex gap-4">
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}