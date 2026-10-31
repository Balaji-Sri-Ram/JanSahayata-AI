import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmblemLogo from '../../components/EmblemLogo';
import { User, Lock, ArrowRight, AlertCircle, Loader2, ShieldCheck, Phone } from 'lucide-react';

export default function CitizenLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/citizen/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your registered email or mobile number, and password.');
      return;
    }

    const cleanIdentifier = email.trim();
    const isEmail = cleanIdentifier.includes('@');
    if (isEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanIdentifier)) {
        setError('Please enter a valid email address format.');
        return;
      }
    } else {
      const digits = cleanIdentifier.replace(/^(\+91|\+0|0)/, '').replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Please enter a valid 10-digit mobile number or registered email address.');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      await login(cleanIdentifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 pb-16 space-y-6">
      
      <div className="gov-card p-6 sm:p-8 space-y-6 border-t-4 border-t-[#0b2545]">
        <div className="text-center space-y-2">
          <div className="w-12 h-14 mx-auto text-[#0b2545] flex items-center justify-center mb-1">
            <EmblemLogo size="md" />
          </div>
          <span className="text-[11px] font-bold text-[#e86100] uppercase tracking-wider block">
            Citizen Access
          </span>
          <h1 className="text-xl font-bold text-[#0b2545]">
            Citizen Account Login
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to track your grievances, inspect officer completion proof, and verify resolutions.
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
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@gmail.com"
                className="gov-input pl-9 text-xs py-2.5"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="password"
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
            className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Citizen Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Don't have a citizen account?{' '}
            <Link to="/register" className="font-semibold text-blue-700 hover:underline">
              Register here
            </Link>
          </p>

          <div className="pt-2 text-[11px] text-slate-400">
            Are you a government official or administrator?{' '}
            <Link to="/staff/login" className="text-slate-600 font-medium hover:underline">
              Official Portal Login →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
