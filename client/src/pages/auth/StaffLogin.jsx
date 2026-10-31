import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmblemLogo from '../../components/EmblemLogo';
import { Building2, ShieldCheck, Lock, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function StaffLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { staffLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setError('Please enter Official Email or Employee ID, and Password.');
      return;
    }

    if (cleanId.includes('@')) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanId)) {
        setError('Please enter a valid official email address format.');
        return;
      }
    } else if (cleanId.length < 4) {
      setError('Employee ID must be at least 4 characters long (e.g. RLY-EMP-1001).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await staffLogin(cleanId, password);
      
      if (res.user?.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user?.role === 'EMPLOYEE') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/citizen/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Staff authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (emailVal, passVal) => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 pb-16 space-y-6">
      
      <div className="gov-card p-6 sm:p-8 space-y-6 border-slate-300 border-t-4 border-t-[#0b2545]">
        
        {/* Official Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-14 mx-auto text-[#0b2545] flex items-center justify-center mb-1">
            <EmblemLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Authorized Government Personnel Only</span>
          </div>
          <h1 className="text-xl font-bold text-[#0b2545]">
            Official Redressal Portal Login
          </h1>
          <p className="text-xs text-slate-500">
            Secure single-sign-on for Department Nodal Officers, Engineers, and Super Administrators.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="staffEmail" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Email or Employee ID
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="staffEmail"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. officer.railway@jansahayata.gov.in or RLY-EMP-1001"
                className="gov-input pl-9 text-xs py-2.5"
              />
            </div>
          </div>

          <div>
            <label htmlFor="staffPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="staffPassword"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="gov-input pl-9 text-xs py-2.5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gov-btn-primary bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-semibold shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validating Official Role...</span>
              </>
            ) : (
              <>
                <span>Sign In to Official Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Panel for Capstone Evaluators */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-blue-700" />
            <span>Capstone Test Accounts (Click to Fill):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillQuickDemo('phaniswarjanyavula@gmail.com', 'Admin@JanSahayata2026!')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left text-amber-900 transition-colors"
            >
              <strong className="block font-bold">1. Super Admin</strong>
              <span className="text-[10px] text-amber-700">phaniswarjanyavula@gmail.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('officer.railway@jansahayata.gov.in', 'Officer@2026!')}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left text-blue-900 transition-colors"
            >
              <strong className="block font-bold">2. Railway Officer</strong>
              <span className="text-[10px] text-blue-700">Station Superintendent</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('officer.water@jansahayata.gov.in', 'Officer@2026!')}
              className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left text-sky-900 transition-colors"
            >
              <strong className="block font-bold">3. Water Board</strong>
              <span className="text-[10px] text-sky-700">Assistant Exec Engineer</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('officer.muni@jansahayata.gov.in', 'Officer@2026!')}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left text-emerald-900 transition-colors"
            >
              <strong className="block font-bold">4. Municipal Officer</strong>
              <span className="text-[10px] text-emerald-700">Chief Sanitary Inspector</span>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          Citizen user?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:underline">
            Switch to Public Citizen Login
          </Link>
        </div>

      </div>

    </div>
  );
}
