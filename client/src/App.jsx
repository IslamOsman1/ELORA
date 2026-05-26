import React, { Component } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import FloatingTeethBackground from './components/layout/FloatingTeethBackground';
import SiteLayout from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

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
  return localStorage.getItem('elora_token') ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <FloatingTeethBackground />
        <BrowserRouter>
          <Toaster position="top-center" />
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/contact" element={<ContactPage />} />
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
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
