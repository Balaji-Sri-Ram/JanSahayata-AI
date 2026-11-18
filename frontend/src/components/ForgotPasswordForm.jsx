import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import EmblemLogo from './EmblemLogo';
import OtpInput from './OtpInput';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react';

export default function ForgotPasswordForm({ 
  initialEmail = '', 
  portalType = 'citizen',
  onBackToLogin,
  onSuccess 
}) {
  const toast = useToast();

  // Steps: 'EMAIL' | 'OTP' | 'PASSWORD'
  const [step, setStep] = useState('EMAIL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState(initialEmail || '');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timers
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes OTP expiration
  const [timerActive, setTimerActive] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // OTP 10-Minute Countdown Timer
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Resend Cooldown Timer (60s)
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 1. Send OTP to entered email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address or official ID.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await authApi.forgotPasswordSendOtp({ email: cleanEmail });
      if (res.data?.success) {
        setMaskedEmail(res.data.destinationLabel || cleanEmail);
        setStep('OTP');
        setTimerSeconds(600);
        setTimerActive(true);
        setResendCooldown(60);
        toast.info('Verification code dispatched to your registered email.');
      } else {
        setError(res.data?.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No registered account found matching this email or ID.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    try {
      setLoading(true);
      setError('');
      const res = await authApi.forgotPasswordSendOtp({ email: email.trim() });
      if (res.data?.success) {
        setTimerSeconds(600);
        setTimerActive(true);
        setResendCooldown(60);
        setOtp('');
        toast.info('A fresh 6-digit verification code has been dispatched.');
      } else {
        setError(res.data?.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP step
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authApi.forgotPasswordVerifyOtp({
        email: email.trim(),
        otp: cleanOtp
      });
      if (res.data?.success) {
        setStep('PASSWORD');
      } else {
        setError(res.data?.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('New password must contain at least one numeric digit (0-9).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPasswordReset({
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.data?.success) {
        toast.success('Successfully changed the password', {
          duration: 3000
        });
        if (onSuccess) {
          onSuccess(email.trim());
        }
      } else {
        setError(res.data?.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed. Verification code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Live password validation checks
  const isLengthValid = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Form Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-14 mx-auto text-[#0b2545] flex items-center justify-center mb-1">
          <EmblemLogo size="md" />
        </div>
        <span className="text-[11px] font-bold text-[#e86100] uppercase tracking-wider block">
          {portalType === 'official' ? 'Official Credential Recovery' : 'Citizen Password Recovery'}
        </span>
        <h1 className="text-xl font-bold text-[#0b2545]">
          Reset Account Password
        </h1>
        <p className="text-xs text-slate-500">
          {step === 'EMAIL' && "Enter your registered email address or official ID to verify your account."}
          {step === 'OTP' && "Enter the 6-digit OTP code dispatched to your registered email."}
          {step === 'PASSWORD' && "Enter a new secure password to restore access to your account."}
        </p>
      </div>

      {/* Step Tracker Indicator */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
        <div className={`flex items-center gap-1.5 ${step === 'EMAIL' ? 'text-[#0b2545] font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'EMAIL' ? 'bg-[#0b2545] text-white' : 'bg-emerald-600 text-white'}`}>
            {step === 'EMAIL' ? '1' : <Check className="w-3 h-3" />}
          </span>
          <span>Email</span>
        </div>

        <div className="h-0.5 w-6 bg-slate-200" />

        <div className={`flex items-center gap-1.5 ${step === 'OTP' ? 'text-[#0b2545] font-bold' : step === 'PASSWORD' ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'OTP' ? 'bg-[#0b2545] text-white' : step === 'PASSWORD' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {step === 'PASSWORD' ? <Check className="w-3 h-3" /> : '2'}
          </span>
          <span>OTP Code</span>
        </div>

        <div className="h-0.5 w-6 bg-slate-200" />

        <div className={`flex items-center gap-1.5 ${step === 'PASSWORD' ? 'text-[#0b2545] font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'PASSWORD' ? 'bg-[#0b2545] text-white' : 'bg-slate-200 text-slate-500'}`}>
            3
          </span>
          <span>New Password</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          STEP 1: ENTER REGISTERED EMAIL OR OFFICIAL ID
      ─────────────────────────────────────────────────────────── */}
      {step === 'EMAIL' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="recovery-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Registered Email Address {portalType === 'official' ? '/ Employee ID' : ''}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="recovery-email"
                type="text"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={portalType === 'official' ? 'officer.railway@jansahayata.gov.in' : 'citizen@gmail.com'}
                className="gov-input pl-9 text-xs py-2.5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Verification OTP...</span>
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

      {/* ───────────────────────────────────────────────────────────
          STEP 2: ENTER 6-DIGIT OTP
      ─────────────────────────────────────────────────────────── */}
      {step === 'OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center space-y-1.5 pb-1">
            <p className="text-xs text-slate-500">
              A 6-digit code has been dispatched to:
            </p>
            <div className="inline-block px-3 py-1 bg-slate-100 rounded-md text-xs font-mono font-bold text-[#0b2545]">
              {maskedEmail}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                6-Digit Security OTP
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            <div className="py-2 flex justify-center">
              <OtpInput
                length={6}
                value={otp}
                onChange={setOtp}
                onComplete={() => {}}
                disabled={loading}
                hasError={Boolean(error)}
                autoFocus={true}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <button
              type="button"
              onClick={() => { setStep('EMAIL'); setError(''); }}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email</span>
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className={`flex items-center gap-1 font-semibold ${
                resendCooldown > 0 
                  ? 'text-slate-400 cursor-not-allowed' 
                  : 'text-blue-700 hover:text-blue-900 hover:underline'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
            </button>
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
                <span>Verify Code & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────
          STEP 3: ENTER NEW PASSWORD & CONFIRM
      ─────────────────────────────────────────────────────────── */}
      {step === 'PASSWORD' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                className="gov-input pl-9 pr-9 text-xs py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype new password"
                className="gov-input pl-9 pr-9 text-xs py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Requirement Checklist */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-[11px]">
            <span className="font-semibold text-slate-700 block mb-1">Password Requirements:</span>
            <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isLengthValid ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>At least 8 characters in length</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Contains at least one numeric digit (0-9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isLengthValid || !hasNumber || !isMatch}
            className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reset Password & Complete</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Return to Login link */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Remember your password? Return to Sign In</span>
        </button>
      </div>

    </div>
  );
}
