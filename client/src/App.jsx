import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollRestoration from './components/ScrollRestoration';
import ProtectedRoute from './components/ProtectedRoute';
import FirstTimePasswordResetModal from './components/FirstTimePasswordResetModal';

// Auth Pages
import CitizenLogin from './pages/auth/CitizenLogin';
import CitizenRegister from './pages/auth/CitizenRegister';
import StaffLogin from './pages/auth/StaffLogin';

// Citizen Pages
import CitizenHome from './pages/citizen/CitizenHome';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportProblem from './pages/citizen/ReportProblem';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import TrackComplaint from './pages/citizen/TrackComplaint';
import HelpPage from './pages/citizen/HelpPage';

// Staff / Government Employee Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffComplaints from './pages/staff/StaffComplaints';
import StaffComplaintDetail from './pages/staff/StaffComplaintDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Legacy Railway Pages (backward compatibility)
import RailwayDashboard from './pages/railway/RailwayDashboard';
import RailwayComplaints from './pages/railway/RailwayComplaints';
import RailwayComplaintDetail from './pages/railway/RailwayComplaintDetail';

function NotFound() {
  return (
    <div className="py-20 text-center space-y-3">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl font-bold text-slate-400">404</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-sm text-slate-500">The page you requested does not exist.</p>
      <a href="/" className="gov-btn-primary inline-flex mt-4 text-xs py-2 px-4">
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  const { user, loading, isSuperAdmin, isEmployee } = useAuth();
  const { currentLang } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0b2545] border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#0b2545] uppercase tracking-wider">
            Loading JanSahayata (CPGRAMS) Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div key={`app-${currentLang}`} className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      <ScrollRestoration />
      {user?.mustResetPassword && <FirstTimePasswordResetModal />}
      <Header key={`header-${currentLang}`} />
      <main key={`main-${currentLang}`} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              isSuperAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : isEmployee ? (
                <Navigate to="/staff/dashboard" replace />
              ) : (
                <CitizenHome />
              )
            }
          />
          <Route path="/login" element={<CitizenLogin />} />
          <Route path="/register" element={<CitizenRegister />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/track" element={<TrackComplaint />} />

          {/* Public Complaint Tracking (works without auth) */}
          <Route path="/complaint/:id" element={<ComplaintDetails />} />

          {/* Citizen Protected Routes */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <ReportProblem />
              </ProtectedRoute>
            }
          />
          {/* Alias for backward compat */}
          <Route path="/report-problem" element={<Navigate to="/report" replace />} />
          <Route
            path="/my-complaints"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          {/* Government Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/complaints"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN']}>
                <StaffComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN']}>
                <StaffComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Legacy Railway Routes (backward compatibility) */}
          <Route path="/railway-dashboard" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/railway-dashboard/complaints" element={<Navigate to="/staff/complaints" replace />} />
          <Route
            path="/railway-dashboard/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN']}>
                <RailwayComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer key={`footer-${currentLang}`} />
      <ScrollToTop />
    </div>
  );
}
