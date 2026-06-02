import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import FloatingTeethBackground from './components/layout/FloatingTeethBackground';
import SiteLayout from './components/layout/SiteLayout';
import { getAdminToken } from './utils/auth';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailsPage = lazy(() => import('./pages/ServiceDetailsPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const DoctorDetailsPage = lazy(() => import('./pages/DoctorDetailsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminQrVerificationPage = lazy(() => import('./pages/AdminQrVerificationPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PatientBookingsPage = lazy(() => import('./pages/PatientBookingsPage'));
const CaseFollowUpPage = lazy(() => import('./pages/CaseFollowUpPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const CaseDetailsPage = lazy(() => import('./pages/CaseDetailsPage'));
const TreatmentCasesPage = lazy(() => import('./pages/TreatmentCasesPage'));

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

function AppLoadingFallback() {
  return <main className="grid min-h-screen place-items-center px-4 text-white/70">Loading...</main>;
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
                <Suspense fallback={<AppLoadingFallback />}>
                  <Routes>
                    <Route element={<SiteLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
                      <Route path="/cases" element={<TreatmentCasesPage />} />
                      <Route path="/cases/:caseId" element={<CaseDetailsPage />} />
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
                </Suspense>
              </BrowserRouter>
            </SiteSettingsProvider>
          </NotificationsProvider>
        </CustomerAuthProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
