import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmblemLogo from '../../components/EmblemLogo';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function CitizenRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateField = (fieldName, value) => {
    let err = '';
    if (fieldName === 'name') {
      if (!value || value.trim().length < 3) {
        err = 'Full name must be at least 3 characters long.';
      } else if (!/^[a-zA-Z\s.]+$/.test(value.trim())) {
        err = 'Name can only contain alphabets, dots, and spaces.';
      }
    } else if (fieldName === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value || !emailRegex.test(value.trim())) {
        err = 'Please enter a valid email address (e.g. citizen@example.com).';
      }
    } else if (fieldName === 'phone') {
      if (value && value.trim()) {
        const digits = value.replace(/\D/g, '').replace(/^(91|0)/, '');
        if (digits.length !== 10) {
          err = 'Mobile number must be exactly 10 digits.';
        } else if (!/^[6-9]/.test(digits)) {
          err = 'Indian mobile numbers must begin with 6, 7, 8, or 9.';
        }
      }
    } else if (fieldName === 'password') {
      if (!value || value.length < 8) {
        err = 'Password must be at least 8 characters long.';
      } else if (!/\d/.test(value)) {
        err = 'Password must include at least one numeric digit (0-9).';
      }
    } else if (fieldName === 'confirmPassword') {
      if (value !== password) {
        err = 'Passwords do not match.';
      }
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: err }));
    return !err;
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^\d\s+]/g, '');
    if (val.length > 14) return;
    setPhone(val);
    validateField('phone', val);
  };

  const validateAll = () => {
    const errors = {};
    if (!name || name.trim().length < 3 || !/^[a-zA-Z\s.]+$/.test(name.trim())) {
      errors.name = 'Full name must be at least 3 characters and contain only letters.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (phone && phone.trim()) {
      const digits = phone.replace(/\D/g, '').replace(/^(91|0)/, '');
      if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
        errors.phone = 'Mobile number must be a valid 10-digit Indian number.';
      }
    }
    if (!password || password.length < 8 || !/\d/.test(password)) {
      errors.password = 'Password must be at least 8 characters with at least one number.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateAll()) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword
      });
      navigate('/citizen/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
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
            New Citizen Registration
          </span>
          <h1 className="text-xl font-bold text-[#0b2545]">
            Create Citizen Account
          </h1>
          <p className="text-xs text-slate-500">
            Create an official citizen profile to file grievances, receive real-time notifications, and verify resolutions.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="fullName"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  validateField('name', e.target.value);
                }}
                placeholder="e.g. Ramesh Chandra"
                className={`gov-input pl-9 text-xs py-2 ${fieldErrors.name ? 'border-red-500 bg-red-50/20' : ''}`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="emailAddress"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateField('email', e.target.value);
                }}
                placeholder="citizen@example.com"
                className={`gov-input pl-9 text-xs py-2 ${fieldErrors.email ? 'border-red-500 bg-red-50/20' : ''}`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="phoneNumber"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+91 98765 43210"
                className={`gov-input pl-9 text-xs py-2 ${fieldErrors.phone ? 'border-red-500 bg-red-50/20' : ''}`}
              />
            </div>
            {fieldErrors.phone ? (
              <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.phone}</p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-0.5">10-digit Indian mobile number</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validateField('password', e.target.value);
                }}
                placeholder="At least 8 characters (with a number)"
                className={`gov-input pl-9 text-xs py-2 ${fieldErrors.password ? 'border-red-500 bg-red-50/20' : ''}`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateField('confirmPassword', e.target.value);
                }}
                placeholder="Re-type password"
                className={`gov-input pl-9 text-xs py-2 ${fieldErrors.confirmPassword ? 'border-red-500 bg-red-50/20' : ''}`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Citizen Account...</span>
              </>
            ) : (
              <>
                <span>Register Citizen Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-700 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
