import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import EmblemLogo from './EmblemLogo';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound, Building2 } from 'lucide-react';

export default function FirstTimePasswordResetModal() {
  const { user, updateUser } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasMinLength && hasNumber && hasMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError('Please ensure your new password satisfies all security criteria below.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.firstTimeResetPassword({ newPassword, confirmPassword });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          updateUser({ mustResetPassword: false });
        }, 1200);
      } else {
        setError(res.data?.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0b2545] p-5 text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded">
              <EmblemLogo className="h-9 w-auto" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Government of India • DARPG
              </div>
              <h2 className="text-base font-extrabold tracking-tight">
                Mandatory First-Time Password Reset
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Officer Details Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0b2545]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">
                Welcome, {user?.name || 'Department Officer'}
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Official ID: <strong className="font-mono text-[#0b2545]">{user?.employeeId || 'OFFICER'}</strong> • {user?.department?.name || 'Department'}
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                As per Indian Government Information Security Standards, you must change your initial temporary password before continuing to the grievance portal.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Password Updated Successfully!</h3>
              <p className="text-xs text-slate-500">
                Unlocking your grievance management console...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Set New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="gov-input pl-9 pr-9 text-xs py-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype new password"
                    className="gov-input pl-9 pr-9 text-xs py-2 w-full"
                  />
                </div>
              </div>

              {/* Password Quality Criteria */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1.5">
                <p className="font-bold text-slate-700">Security Requirements:</p>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                    ✓
                  </span>
                  <span>Minimum 8 characters in length</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                    ✓
                  </span>
                  <span>Includes at least one numeric digit (0-9)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasMatch ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                    ✓
                  </span>
                  <span>Passwords match exactly</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full bg-[#0b2545] hover:bg-[#123663] text-amber-300 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Save Password & Enter Portal'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

