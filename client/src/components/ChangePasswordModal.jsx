import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import EmblemLogo from './EmblemLogo';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { user, updateUser, refreshUser } = useAuth();

  const [step, setStep] = useState('REQUEST_OTP'); // 'REQUEST_OTP' | 'VERIFY_OTP' | 'SUCCESS'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [maskedEmail, setMaskedEmail] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const [timerActive, setTimerActive] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('REQUEST_OTP');
      setError('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setTimerSeconds(600);
      setTimerActive(false);

      if (user?.email) {
        const [namePart, domainPart] = user.email.split('@');
        const maskedName = namePart.length <= 2 
          ? namePart[0] + '***' 
          : namePart[0] + '***' + namePart.slice(-1);
        setMaskedEmail(`${maskedName}@${domainPart}`);
      }
    }
  }, [isOpen, user]);

  // Countdown timer for 10-minute OTP validity
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

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await authApi.sendPasswordOtp({
        channel: 'email'
      });

      if (res.data?.success) {
        setDestinationLabel(res.data.destinationLabel || user?.email || 'Registered Email');
        setStep('VERIFY_OTP');
        setTimerSeconds(600);
        setTimerActive(true);
      } else {
        setError(res.data?.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to authorization service.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('New password must contain at least one numeric digit (0-9).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please retype carefully.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.changePasswordWithOtp({
        otp: otp.trim(),
        newPassword
      });

      if (res.data?.success) {
        setStep('SUCCESS');
        if (updateUser) {
          updateUser({ isFirstLogin: false });
        }
        if (refreshUser) {
          refreshUser();
        }
      } else {
        setError(res.data?.message || 'Verification failed. Please check the OTP code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed. Code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0b2545] p-4 text-white flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded">
              <EmblemLogo className="h-7 w-auto" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Government of India • JanSahayata (CPGRAMS)
              </div>
              <h3 className="text-sm font-bold">Secure Password Reset & Verification</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'REQUEST_OTP' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 text-[#0b2545] rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Email OTP Verification</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  For account security, a 6-digit one-time password (OTP) will be dispatched to your registered email:
                </p>
              </div>

              {/* Registered Email Card */}
              <div className="p-4 rounded-xl border border-[#0b2545]/20 bg-blue-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Registered Email Address
                  </span>
                  <p className="font-mono text-xs font-bold text-[#0b2545] truncate">
                    {maskedEmail || user?.email || 'citizen@gmail.com'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  The 6-digit verification code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="bg-[#0b2545] hover:bg-[#123663] text-amber-300 hover:text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Dispatching Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'VERIFY_OTP' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">OTP sent to <strong>{destinationLabel}</strong></span>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1 shrink-0 ml-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
              </div>

              {/* 6-Digit OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Enter 6-Digit Verification Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="gov-input pl-9 font-mono font-bold tracking-widest text-center text-sm py-2 w-full"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 chars with 1 number"
                    className="gov-input pl-9 pr-9 text-xs py-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Retype Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Retype New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="gov-input pl-9 pr-9 text-xs py-2 w-full"
                  />
                </div>
              </div>

              {/* Resend OTP button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || timerSeconds > 540}
                  className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || !newPassword}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Password Updated Successfully</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  Your credentials have been updated securely in the central registry.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#0b2545] hover:bg-[#123663] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm"
              >
                Close & Continue
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
