import React from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Trainers from './pages/Trainers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/calendar" />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <PrivateRoute adminOnly>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="calendar" element={
          <PrivateRoute>
            <CalendarView />
          </PrivateRoute>
        } />
        <Route path="bookings" element={
          <PrivateRoute adminOnly>
            <Bookings />
          </PrivateRoute>
        } />
        <Route path="customers" element={
          <PrivateRoute adminOnly>
            <Customers />
          </PrivateRoute>
        } />
        <Route path="trainers" element={
          <PrivateRoute adminOnly>
            <Trainers />
          </PrivateRoute>
        } />
        <Route path="reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
        <Route path="settings" element={
          <PrivateRoute adminOnly>
            <Settings />
          </PrivateRoute>
        } />
		<Route path="users" element={
          <PrivateRoute adminOnly>
            <Users />
          </PrivateRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}