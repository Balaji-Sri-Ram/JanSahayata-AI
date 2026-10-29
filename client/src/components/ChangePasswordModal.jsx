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
  MessageSquare,
  Smartphone,
  Sparkles
} from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { user, updateUser, refreshUser } = useAuth();

  const [step, setStep] = useState('REQUEST_OTP'); // 'REQUEST_OTP' | 'VERIFY_OTP' | 'SUCCESS'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Delivery channel: 'email' | 'whatsapp' | 'sms'
  const [channel, setChannel] = useState('email');
  const [phone, setPhone] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');
  const [liveError, setLiveError] = useState('');

  const [maskedEmail, setMaskedEmail] = useState('');
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
      setPreviewOtp('');
      setChannel('email');
      setPhone(user?.phone || '');

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

      if ((channel === 'whatsapp' || channel === 'sms') && (!phone || !phone.trim())) {
        setError('Please enter a valid 10-digit mobile number for WhatsApp / SMS OTP delivery.');
        setLoading(false);
        return;
      }

      const res = await authApi.sendPasswordOtp({
        channel,
        phone: phone.trim()
      });

      if (res.data?.success) {
        setDestinationLabel(res.data.destinationLabel || '');
        setLiveError(res.data.liveError || '');
        if (res.data.previewOtp) {
          setPreviewOtp(res.data.previewOtp);
        } else {
          setPreviewOtp('');
        }
        setStep('VERIFY_OTP');
        setTimerSeconds(600);
        setTimerActive(true);
      } else {
        setError(res.data?.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your chosen channel.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must include at least one numeric digit (0-9).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.changePasswordWithOtp({
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });

      if (res.data?.success) {
        if (res.data.user && updateUser) updateUser(res.data.user);
        if (refreshUser) refreshUser();
        setStep('SUCCESS');
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setError(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
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
                <h4 className="text-sm font-bold text-slate-900">Select Verification Channel</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Choose how you would like to receive your official 6-digit one-time password (OTP):
                </p>
              </div>

              {/* Delivery Channel Radio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Email */}
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    channel === 'email'
                      ? 'border-[#0b2545] bg-blue-50/60 ring-2 ring-[#0b2545]/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-[#0b2545]">
                      <Mail className="w-4 h-4" />
                    </div>
                    {channel === 'email' && <CheckCircle2 className="w-4 h-4 text-[#0b2545]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Gmail SMTP</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{maskedEmail || 'Registered Email'}</div>
                  </div>
                </button>

                {/* 2. WhatsApp */}
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    channel === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    {channel === 'whatsapp' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">WhatsApp</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Instant Alert</div>
                  </div>
                </button>

                {/* 3. SMS */}
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    channel === 'sms'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    {channel === 'sms' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950">Direct SMS</div>
                    <div className="text-[10px] text-indigo-700 mt-0.5">Mobile Network</div>
                  </div>
                </button>
              </div>

              {/* If WhatsApp or SMS selected, allow editing/confirming phone */}
              {(channel === 'whatsapp' || channel === 'sms') && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-700">
                    {channel === 'whatsapp' ? 'WhatsApp Mobile Number' : 'Mobile Number for SMS'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1.5 bg-slate-200 rounded-lg text-xs font-bold text-slate-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                      placeholder="e.g. 98765 43210"
                      className="gov-input text-xs py-1.5 flex-1"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Indian mobile number starting with 6, 7, 8, or 9
                  </p>
                </div>
              )}

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  The 6-digit OTP code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
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
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {loading ? 'Dispatching OTP...' : `Send OTP via ${channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'Email'}`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 'VERIFY_OTP' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">OTP dispatched to <strong>{destinationLabel}</strong></span>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1 shrink-0 ml-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
              </div>

              {/* Live Provider Notice if error occurred */}
              {liveError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Provider Notice:</span>
                    <p className="mt-0.5 text-[11px] text-amber-800">{liveError}</p>
                  </div>
                </div>
              )}

              {/* Dev Mode Preview Helper */}
              {previewOtp && (
                <div 
                  onClick={() => setOtp(previewOtp)}
                  className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-colors"
                  title="Click to auto-fill OTP code"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <strong>Dev Simulator OTP:</strong> {previewOtp}
                  </span>
                  <span className="text-[11px] underline font-bold text-purple-700">Click to autofill</span>
                </div>
              )}

              {/* OTP Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  6-Digit Verification OTP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    className="gov-input pl-9 font-mono tracking-widest text-center font-bold text-base py-2 w-full"
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
                    placeholder="Minimum 8 characters with at least 1 number"
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
                <button
                  type="button"
                  onClick={() => setStep('REQUEST_OTP')}
                  className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                >
                  Change delivery channel
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
                  disabled={loading}
                  className="bg-[#0b2545] hover:bg-[#123663] text-amber-300 hover:text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Change Password'}</span>
                </button>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="py-6 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Password Changed Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your new credentials are now active across the Government of India JanSahayata system.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
