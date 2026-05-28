import React, { Component } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import FloatingTeethBackground from './components/layout/FloatingTeethBackground';
import SiteLayout from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminQrVerificationPage from './pages/AdminQrVerificationPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import PatientBookingsPage from './pages/PatientBookingsPage';
import CaseFollowUpPage from './pages/CaseFollowUpPage';
import NotificationsPage from './pages/NotificationsPage';
import { getAdminToken } from './utils/auth';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center px-4">
          <div className="premium-card max-w-2xl p-8 text-center">
            <h1 className="font-display text-4xl text-[#f2d38d]">App Error</h1>
            <p className="mt-4 text-white/75">{String(this.state.error.message || this.state.error)}</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  return getAdminToken() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <CustomerAuthProvider>
          <NotificationsProvider>
            <SiteSettingsProvider>
              <FloatingTeethBackground />
              <BrowserRouter>
                <Toaster position="top-center" />
                <Routes>
                  <Route element={<SiteLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/doctors/:doctorId" element={<DoctorDetailsPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/account/auth" element={<AuthPage />} />
                    <Route path="/account" element={<ProfilePage />} />
                    <Route path="/account/bookings" element={<PatientBookingsPage />} />
                    <Route path="/account/case-follow-up" element={<CaseFollowUpPage />} />
                    <Route path="/account/notifications" element={<NotificationsPage />} />
                  </Route>
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/verify"
                    element={
                      <ProtectedRoute>
                        <AdminQrVerificationPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </SiteSettingsProvider>
          </NotificationsProvider>
        </CustomerAuthProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
