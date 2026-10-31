import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import EmblemLogo from './EmblemLogo';
import {
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Phone,
  HelpCircle,
  FileText,
  UserCheck,
  Loader2
} from 'lucide-react';

export default function CitizenEmailChangeModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();

  // Mode: 'DUAL_OTP' | 'LOST_ACCESS'
  const [activeTab, setActiveTab] = useState('DUAL_OTP');

  // Dual OTP Steps:
  // Step 1: Send OTP to current email & verify
  // Step 2: Enter new email & send OTP to new email
  // Step 3: Verify new email OTP & complete update
  const [dualStep, setDualStep] = useState(1);

  // Form Fields
  const [currentOtp, setCurrentOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');

  // Lost Access Form Fields
  const [lostNewEmail, setLostNewEmail] = useState('');
  const [lostNewEmailOtp, setLostNewEmailOtp] = useState('');
  const [lostContactPhone, setLostContactPhone] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [lostOtpSent, setLostOtpSent] = useState(false);

  // Loading & State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [existingRequest, setExistingRequest] = useState(null);
  const [fetchingStatus, setFetchingStatus] = useState(false);

  // Timers
  const [currentCooldown, setCurrentCooldown] = useState(0);
  const [newCooldown, setNewCooldown] = useState(0);

  // Countdown timers
  useEffect(() => {
    let t1, t2;
    if (currentCooldown > 0) {
      t1 = setInterval(() => setCurrentCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    }
    if (newCooldown > 0) {
      t2 = setInterval(() => setNewCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    }
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [currentCooldown, newCooldown]);

  // Reset and load existing ticket on open
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setDualStep(1);
      setCurrentOtp('');
      setNewEmail('');
      setConfirmNewEmail('');
      setNewEmailOtp('');
      setLostNewEmail('');
      setLostNewEmailOtp('');
      setLostContactPhone(user?.phone || '');
      setLostReason('');
      setLostOtpSent(false);
      checkExistingAdminRequest();
    }
  }, [isOpen, user]);

  const checkExistingAdminRequest = async () => {
    try {
      setFetchingStatus(true);
      const res = await authApi.getCitizenEmailChangeStatus();
      if (res.data?.success && res.data.data) {
        setExistingRequest(res.data.data);
      } else {
        setExistingRequest(null);
      }
    } catch {
      // Ignore
    } finally {
      setFetchingStatus(false);
    }
  };

  if (!isOpen) return null;

  // ==========================================
  // DUAL OTP HANDLERS
  // ==========================================

  // Step 1A: Send OTP to Current Email
  const handleSendCurrentOtp = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authApi.sendCurrentEmailOtp();
      if (res.data?.success) {
        setCurrentCooldown(60);
        setSuccessMsg(res.data.message || 'Verification code sent to your current email.');
      } else {
        setError(res.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending code to current email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1B: Verify Current Email OTP
  const handleVerifyCurrentOtp = async (e) => {
    e.preventDefault();
    if (currentOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await authApi.verifyCurrentEmailOtp({ otp: currentOtp.trim() });
      if (res.data?.success) {
        setDualStep(2);
        setSuccessMsg('Current email verified successfully. Now enter your new email address.');
      } else {
        setError(res.data?.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP to New Email
  const handleSendNewOtp = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanNew = newEmail.trim().toLowerCase();

    if (!emailRegex.test(cleanNew)) {
      setError('Please enter a valid new email address.');
      return;
    }
    if (cleanNew === user?.email?.toLowerCase()) {
      setError('New email address cannot be the same as your current email.');
      return;
    }
    if (cleanNew !== confirmNewEmail.trim().toLowerCase()) {
      setError('New email and confirmation email do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await authApi.sendNewEmailOtp({ newEmail: cleanNew });
      if (res.data?.success) {
        setDualStep(3);
        setNewCooldown(60);
        setSuccessMsg(res.data.message || `Verification code sent to ${cleanNew}.`);
      } else {
        setError(res.data?.message || 'Failed to send OTP to new email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify New Email OTP & Finalize
  const handleConfirmNewEmail = async (e) => {
    e.preventDefault();
    if (newEmailOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await authApi.confirmNewEmail({ otp: newEmailOtp.trim() });
      if (res.data?.success) {
        setSuccessMsg('Your email address has been successfully updated! Dual confirmation emails have been dispatched.');
        if (res.data.user) {
          updateUser(res.data.user);
        }
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(res.data?.message || 'Failed to confirm new email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOST ACCESS (ADMIN ASSISTANCE) HANDLERS
  // ==========================================

  const handleSendLostNewEmailOtp = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanNew = lostNewEmail.trim().toLowerCase();

    if (!emailRegex.test(cleanNew)) {
      setError('Please enter a valid new email address.');
      return;
    }
    if (cleanNew === user?.email?.toLowerCase()) {
      setError('New email address cannot be the same as your current email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await authApi.sendNewEmailOtp({ newEmail: cleanNew });
      if (res.data?.success) {
        setLostOtpSent(true);
        setNewCooldown(60);
        setSuccessMsg(`Verification code sent to ${cleanNew}. Please verify ownership.`);
      } else {
        setError(res.data?.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error dispatching verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLostAccessRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!lostOtpSent) {
      setError('Please click "Send Code" to verify ownership of your new email first.');
      return;
    }
    if (lostNewEmailOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your new email.');
      return;
    }
    if (lostReason.trim().length < 10) {
      setError('Please provide a reason explaining why old email is inaccessible (minimum 10 characters).');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.requestAdminEmailChange({
        newEmail: lostNewEmail.trim().toLowerCase(),
        otp: lostNewEmailOtp.trim(),
        contactPhone: lostContactPhone.trim(),
        reason: lostReason.trim()
      });

      if (res.data?.success) {
        setSuccessMsg('Your email change request has been submitted to the Super Administrator for review.');
        checkExistingAdminRequest();
      } else {
        setError(res.data?.message || 'Failed to submit request.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please check the OTP or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="gov-card max-w-lg w-full max-h-[92vh] overflow-y-auto border-t-4 border-t-[#0b2545] shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b2545] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#e86100] uppercase tracking-wider block">
                Security & Identity
              </span>
              <h2 className="text-base font-bold text-[#0b2545]">
                Change Registered Email Address
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('DUAL_OTP');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'DUAL_OTP'
                ? 'bg-[#0b2545] text-white border-[#0b2545] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Self-Service (Dual OTP)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('LOST_ACCESS');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOST_ACCESS'
                ? 'bg-[#0b2545] text-white border-[#0b2545] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Lost Access to Old Email</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          
          {/* Notifications */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: DUAL OTP SELF-SERVICE */}
          {/* ==================================================== */}
          {activeTab === 'DUAL_OTP' && (
            <div className="space-y-4">
              
              {/* Stepper Header */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                <div className={`p-2 rounded border ${dualStep === 1 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : dualStep > 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  1. Current Email OTP
                </div>
                <div className={`p-2 rounded border ${dualStep === 2 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : dualStep > 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  2. New Email
                </div>
                <div className={`p-2 rounded border ${dualStep === 3 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  3. New Email OTP
                </div>
              </div>

              {/* STEP 1: Verify Current Email */}
              {dualStep === 1 && (
                <form onSubmit={handleVerifyCurrentOtp} className="space-y-3.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Currently Registered Email
                    </span>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {user?.email}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      To safeguard your account, an authorization code must be sent to your existing inbox.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendCurrentOtp}
                      disabled={loading || currentCooldown > 0}
                      className="gov-btn-secondary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>
                        {currentCooldown > 0 ? `Resend Code in ${currentCooldown}s` : 'Send OTP to Current Email'}
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Enter 6-Digit Current Email Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={currentOtp}
                        onChange={(e) => setCurrentOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="gov-input pl-9 font-mono font-bold tracking-widest text-center text-sm py-2"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || currentOtp.trim().length !== 6}
                    className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Authorize & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Enter New Email */}
              {dualStep === 2 && (
                <form onSubmit={handleSendNewOtp} className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Current email identity confirmed. Enter your desired new email.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      New Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new.email@example.com"
                        className="gov-input pl-9 text-xs py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm New Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={confirmNewEmail}
                        onChange={(e) => setConfirmNewEmail(e.target.value)}
                        placeholder="Re-type new email address"
                        className="gov-input pl-9 text-xs py-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDualStep(1)}
                      className="gov-btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !newEmail || !confirmNewEmail}
                      className="flex-1 gov-btn-primary py-2 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Code to New Email</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Verify New Email OTP */}
              {dualStep === 3 && (
                <form onSubmit={handleConfirmNewEmail} className="space-y-3.5">
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-center space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      Code Sent to New Email
                    </span>
                    <p className="font-mono text-xs font-bold text-[#0b2545]">
                      {newEmail}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enter the 6-digit code sent to verify ownership of this inbox.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 text-center">
                      Enter 6-Digit New Email OTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={newEmailOtp}
                        onChange={(e) => setNewEmailOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="gov-input pl-9 font-mono font-bold tracking-widest text-center text-sm py-2"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || newEmailOtp.trim().length !== 6}
                    className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Email...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Update Email</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDualStep(2)}
                      className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change new email</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendNewOtp}
                      disabled={newCooldown > 0 || loading}
                      className={`font-semibold flex items-center gap-1 ${
                        newCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#0b2545] hover:text-[#e86100]'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>{newCooldown > 0 ? `Resend in ${newCooldown}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: LOST ACCESS TO OLD EMAIL (ADMIN APPROVAL) */}
          {/* ==================================================== */}
          {activeTab === 'LOST_ACCESS' && (
            <div className="space-y-4">
              {/* Existing Ticket Banner if any */}
              {existingRequest && (
                <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                  existingRequest.status === 'PENDING'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : existingRequest.status === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Existing Request: {existingRequest.status}</span>
                    </span>
                    <span className="text-[10px] font-mono">
                      {new Date(existingRequest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px]">
                    Requested change to: <strong className="font-mono">{existingRequest.requestedEmail}</strong>
                  </p>
                  {existingRequest.status === 'PENDING' && (
                    <p className="text-[11px] text-amber-800 font-medium">
                      Your request is currently awaiting Super Administrator review. You will receive an email once processed.
                    </p>
                  )}
                  {existingRequest.status === 'REJECTED' && existingRequest.rejectionReason && (
                    <p className="text-[11px] text-red-700">
                      Reason: {existingRequest.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Inaccessible Former Email Account?</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  If your old email inbox is closed, hacked, or inaccessible, you can verify your <strong>new email</strong> with a 6-digit code and request the Super Administrator to update your official records.
                </p>
              </div>

              <form onSubmit={handleSubmitLostAccessRequest} className="space-y-3">
                {/* New Email & OTP verification */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Accessible Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={lostNewEmail}
                        onChange={(e) => setLostNewEmail(e.target.value)}
                        placeholder="new.email@gmail.com"
                        className="gov-input pl-9 text-xs py-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendLostNewEmailOtp}
                      disabled={loading || newCooldown > 0 || !lostNewEmail}
                      className="gov-btn-secondary text-xs px-3 whitespace-nowrap"
                    >
                      {newCooldown > 0 ? `${newCooldown}s` : lostOtpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                </div>

                {lostOtpSent && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Enter 6-Digit Code Received at New Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={lostNewEmailOtp}
                        onChange={(e) => setLostNewEmailOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="gov-input pl-9 font-mono font-bold tracking-widest text-center text-sm py-2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={lostContactPhone}
                      onChange={(e) => setLostContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="gov-input pl-9 text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Reason / Justification for Admin Transfer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    placeholder="e.g. Lost access to old Gmail account and cannot receive OTPs."
                    className="gov-input text-xs py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !lostOtpSent || lostNewEmailOtp.length !== 6}
                  className="w-full gov-btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Submit Request to Administrator</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

