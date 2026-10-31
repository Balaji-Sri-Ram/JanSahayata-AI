import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import EmblemLogo from '../../components/EmblemLogo';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export default function CitizenRegister() {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // Step 1: Registration Form Details; Step 2: Email Confirmation OTP
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState('');

  // Step 2 OTP State
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

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
        err = 'Please enter a valid email address (e.g. citizen@gmail.com).';
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

  // Step 1: Send registration confirmation OTP to user's email
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo('');

    if (!validateAll()) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.registerSendOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword
      });

      if (res.data?.success) {
        setStep(2);
        setOtp('');
        setResendCooldown(60);
        setSuccessInfo(res.data.message || `A 6-digit confirmation code was sent to ${email.trim()}.`);
      } else {
        setError(res.data?.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and activate citizen account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.registerVerifyOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp
      });

      if (res.data?.success && res.data.token && res.data.user) {
        setAuthData(res.data.token, res.data.user);
        navigate('/citizen/dashboard', { replace: true });
      } else {
        setError(res.data?.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    try {
      setResending(true);
      const res = await authApi.registerSendOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword
      });
      if (res.data?.success) {
        setResendCooldown(60);
        setSuccessInfo('A new 6-digit code has been dispatched to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const maskEmail = (mail) => {
    if (!mail || !mail.includes('@')) return mail;
    const [userPart, domain] = mail.split('@');
    if (userPart.length <= 2) return `${userPart[0]}*@${domain}`;
    return `${userPart[0]}***${userPart[userPart.length - 1]}@${domain}`;
  };

  return (
    <div className="max-w-md mx-auto my-8 pb-16 space-y-6">
      
      <div className="gov-card p-6 sm:p-8 space-y-6 border-t-4 border-t-[#0b2545]">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-14 mx-auto text-[#0b2545] flex items-center justify-center mb-1">
            <EmblemLogo size="md" />
          </div>
          <span className="text-[11px] font-bold text-[#e86100] uppercase tracking-wider block">
            {step === 1 ? 'New Citizen Registration' : 'Account Verification'}
          </span>
          <h1 className="text-xl font-bold text-[#0b2545]">
            {step === 1 ? 'Create Citizen Account' : 'Confirm Your Email Address'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1 
              ? 'Create an official citizen profile to file grievances, receive real-time notifications, and verify resolutions.'
              : 'For security, enter the 6-digit verification code sent to your email to activate your account.'}
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2545]">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 1 ? 'bg-[#0b2545] text-white shadow-sm' : 'bg-emerald-600 text-white'
            }`}>
              {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className={step === 1 ? 'text-[#0b2545]' : 'text-slate-500'}>Profile Info</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 2 ? 'bg-[#0b2545] text-white shadow-sm' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <span className={step === 2 ? 'text-[#0b2545]' : 'text-slate-400'}>Email OTP</span>
          </div>
        </div>

        {/* Success Banner */}
        {successInfo && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleInitiateRegistration} className="space-y-3.5">
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
                  placeholder="citizen@gmail.com"
                  className={`gov-input pl-9 text-xs py-2 ${fieldErrors.email ? 'border-red-500 bg-red-50/20' : ''}`}
                />
              </div>
              {fieldErrors.email ? (
                <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.email}</p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-0.5">A 6-digit confirmation code will be dispatched to this address.</p>
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
              className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Email OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1 text-center">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                Verification Email Sent To
              </span>
              <p className="font-mono text-sm font-bold text-[#0b2545]">
                {email}
              </p>
              <p className="text-[11px] text-slate-500">
                Please check your inbox or spam folder. The code expires in 10 minutes.
              </p>
            </div>

            <div>
              <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 text-center">
                Enter 6-Digit Verification Code <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="otpCode"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="gov-input pl-9 text-center font-mono text-lg font-bold tracking-[0.3em] py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.trim().length !== 6}
              className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Email & Activate Account</span>
                </>
              )}
            </button>

            {/* Resend & Edit Details */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccessInfo('');
                }}
                className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit details</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resending}
                className={`font-semibold flex items-center gap-1 ${
                  resendCooldown > 0 || resending
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-[#0b2545] hover:text-[#e86100]'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
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
