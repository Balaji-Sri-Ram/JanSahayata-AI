import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Citizen Pages
import CitizenHome from './pages/citizen/CitizenHome';
import ReportProblem from './pages/citizen/ReportProblem';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetails from './pages/citizen/ComplaintDetails';

// Railway Department Pages
import RailwayDashboard from './pages/railway/RailwayDashboard';
import RailwayComplaints from './pages/railway/RailwayComplaints';
import RailwayComplaintDetail from './pages/railway/RailwayComplaintDetail';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Citizen Routes */}
          <Route path="/" element={<CitizenHome />} />
          <Route path="/report-problem" element={<ReportProblem />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />

          {/* Railway Department Routes */}
          <Route path="/railway-dashboard" element={<RailwayDashboard />} />
          <Route path="/railway-dashboard/complaints" element={<RailwayComplaints />} />
          <Route path="/railway-dashboard/complaints/:id" element={<RailwayComplaintDetail />} />

          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="py-20 text-center">
              <h2 className="text-xl font-bold text-slate-800">404 - Page Not Found</h2>
              <p className="text-xs text-slate-500 mt-1">The page you requested does not exist.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
