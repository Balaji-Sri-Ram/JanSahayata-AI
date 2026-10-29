import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { staffApi } from '../services/api';
import EmblemLogo from './EmblemLogo';
import {
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Building2,
  ArrowRight,
  Send,
  Phone,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export default function OfficerEmailChangeModal({ isOpen, onClose }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [requestedEmail, setRequestedEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Fetch officer's existing request status on open
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setRequestedEmail('');
      setConfirmEmail('');
      setReason('');
      setContactPhone(user?.phone || '');
      fetchStatus();
    }
  }, [isOpen, user]);

  const fetchStatus = async () => {
    try {
      setFetchingStatus(true);
      const res = await staffApi.getEmailChangeStatus();
      if (res.data?.success) {
        setActiveRequest(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load email request status:', err);
    } finally {
      setFetchingStatus(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanRequested = requestedEmail.trim().toLowerCase();

    if (!emailRegex.test(cleanRequested)) {
      setError('Please enter a valid official email address.');
      return;
    }

    if (cleanRequested === user?.email?.toLowerCase()) {
      setError('The new email cannot be the same as your currently registered email.');
      return;
    }

    if (cleanRequested !== confirmEmail.trim().toLowerCase()) {
      setError('New email address and confirmation email do not match.');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Please provide a substantive justification for the official record (minimum 10 characters).');
      return;
    }

    try {
      setLoading(true);
      const res = await staffApi.submitEmailChangeRequest({
        requestedEmail: cleanRequested,
        reason: reason.trim(),
        contactPhone: contactPhone.trim()
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Request successfully submitted to Super Admin.');
        setActiveRequest(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to submit request.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting request.');
    } finally {
      setLoading(false);
    }
  };

  const isPending = activeRequest?.status === 'PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Tricolor Government Strip */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

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
              <h3 className="text-sm font-bold">Officer Official Email Update Request</h3>
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">Request Lodged Successfully</p>
                <p className="mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Officer Identity Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Current Registered Profile
              </span>
              <span className="font-mono text-xs font-bold text-[#0b2545] bg-blue-100 px-2 py-0.5 rounded">
                {user?.employeeId || 'OFFICER-01'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Officer Name:</span>{' '}
                <strong className="text-slate-900">{user?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Designation:</span>{' '}
                <strong className="text-slate-900">{user?.designation || 'Grievance Officer'}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Assigned Department:</span>{' '}
                <strong className="text-slate-900">{user?.department?.name || 'General Directorate'}</strong>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                <span className="text-slate-500">Current Login Email:</span>
                <span className="font-mono font-bold text-[#0b2545] bg-white px-2 py-0.5 rounded border border-slate-300">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          {/* If already has a PENDING request, show prominent pending banner */}
          {isPending ? (
            <div className="p-5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" /> PENDING SUPER ADMIN APPROVAL
                </span>
                <span className="text-[11px] text-amber-800 font-mono">
                  Submitted: {new Date(activeRequest.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-amber-950">
                <div className="flex items-center gap-2">
                  <span className="text-amber-800">Requested New Email:</span>
                  <strong className="font-mono text-sm text-[#0b2545] bg-white px-2 py-0.5 rounded border border-amber-200">
                    {activeRequest.requestedEmail}
                  </strong>
                </div>
                <div>
                  <span className="text-amber-800">Submitted Justification:</span>{' '}
                  <span className="italic">"{activeRequest.reason}"</span>
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-lg text-[11px] text-slate-600 border border-amber-200">
                <strong>Next Step:</strong> The Super Administrator reviews all credential modifications for DARPG compliance. Once approved:
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                  <li>Your login username will transition automatically to the new email.</li>
                  <li>Confirmation notices will be delivered simultaneously to both your old (<strong>{activeRequest.currentEmail}</strong>) and new address.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#0b2545] text-white rounded-lg text-xs font-bold hover:bg-[#123663]"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Submit New Email Change Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Official Protocol Directive:</strong> For audit security under CPGRAMS rules, departmental email alterations require Super Admin verification. Dual confirmation dispatches will be automatically routed upon approval.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Requested Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Requested New Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={requestedEmail}
                      onChange={(e) => setRequestedEmail(e.target.value)}
                      placeholder="e.g. officer.new@nic.in or officer@gov.in"
                      className="gov-input pl-9 text-xs py-2 w-full font-medium"
                    />
                  </div>
                </div>

                {/* Confirm Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Confirm New Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Retype new official email address"
                      className="gov-input pl-9 text-xs py-2 w-full font-medium"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Contact Mobile Number (For Status SMS/WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="gov-input pl-9 text-xs py-2 w-full"
                    />
                  </div>
                </div>

                {/* Official Justification Reason */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Official Justification Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide official reason (e.g., Transfer to state nodal division, migration to official gov.in mailbox, correction of designation domain)."
                    className="gov-input text-xs py-2 w-full resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This reason is recorded permanently in the Central Government Audit Log.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
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
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting to Admin...' : 'Submit Request for Approval'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

