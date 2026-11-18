import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Verifying security credentials...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    const isStaffRoute = location.pathname.startsWith('/staff') || location.pathname.startsWith('/admin');
    const redirectPath = isStaffRoute ? '/staff/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Role validation
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-xl border border-red-200 text-center shadow-sm">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-700">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">403 — Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6">
          Your account role (<span className="font-semibold text-slate-800">{user.role}</span>) does not have authorization to view this section.
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="/"
            className="gov-btn-secondary"
          >
            Return to Citizen Home
          </a>
          {user.role === 'EMPLOYEE' && (
            <a href="/staff/dashboard" className="gov-btn-primary">
              Go to Staff Dashboard
            </a>
          )}
          {user.role === 'SUPER_ADMIN' && (
            <a href="/admin/dashboard" className="gov-btn-primary">
              Go to Admin Dashboard
            </a>
          )}
        </div>
      </div>
    );
  }

  return children;
}
