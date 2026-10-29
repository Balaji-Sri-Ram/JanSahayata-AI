import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Building2,
  ArrowRight,
  User,
  Phone,
  FileText,
  Send,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function AdminEmailRequestsTab({ onActionComplete }) {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Approve / Reject
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getEmailChangeRequests({
        status: statusFilter,
        search: searchQuery
      });
      if (res.data?.success) {
        setRequests(res.data.data || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Error fetching email requests:', err);
      setError('Failed to fetch officer email requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const openApproveModal = (req) => {
    setSelectedRequest(req);
    setActionType('APPROVE');
    setAdminNotes('Approved per administrative review');
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setActionType('REJECT');
    setAdminNotes('Information or authorization details insufficient');
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      setError(null);

      if (actionType === 'APPROVE') {
        const res = await adminApi.approveEmailChangeRequest(selectedRequest._id, {
          adminNotes: adminNotes.trim()
        });
        if (res.data?.success) {
          setActionSuccess(res.data.message || 'Request approved successfully! Dual confirmation emails dispatched.');
          fetchRequests();
          if (onActionComplete) onActionComplete();
        }
      } else {
        const res = await adminApi.rejectEmailChangeRequest(selectedRequest._id, {
          reason: adminNotes.trim()
        });
        if (res.data?.success) {
          setActionSuccess('Request rejected successfully.');
          fetchRequests();
          if (onActionComplete) onActionComplete();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process request.');
    } finally {
      setActionLoading(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`gov-card p-4 cursor-pointer transition-all ${
            statusFilter === 'ALL' ? 'ring-2 ring-[#0b2545] shadow-md' : 'hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Requests</span>
            <Mail className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{counts.all}</div>
          <div className="text-[11px] text-slate-400 mt-1">All historical submissions</div>
        </div>

        {/* Pending Review */}
        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={`gov-card p-4 cursor-pointer transition-all ${
            statusFilter === 'PENDING' ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/30' : 'hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{counts.pending}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Requires Super Admin action</div>
        </div>

        {/* Approved */}
        <div 
          onClick={() => setStatusFilter('APPROVED')}
          className={`gov-card p-4 cursor-pointer transition-all ${
            statusFilter === 'APPROVED' ? 'ring-2 ring-emerald-600 shadow-md bg-emerald-50/30' : 'hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{counts.approved}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Dual emails delivered</div>
        </div>

        {/* Rejected */}
        <div 
          onClick={() => setStatusFilter('REJECTED')}
          className={`gov-card p-4 cursor-pointer transition-all ${
            statusFilter === 'REJECTED' ? 'ring-2 ring-red-600 shadow-md bg-red-50/30' : 'hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700">{counts.rejected}</div>
          <div className="text-[11px] text-red-600 mt-1">Declined per policy</div>
        </div>
      </div>

      {/* Success banner */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Action Successfully Executed</p>
              <p className="text-emerald-800 mt-0.5">{actionSuccess}</p>
            </div>
          </div>
          <button 
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="gov-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Requests', count: counts.all },
            { id: 'PENDING', label: 'Pending Review', count: counts.pending, alert: counts.pending > 0 },
            { id: 'APPROVED', label: 'Approved', count: counts.approved },
            { id: 'REJECTED', label: 'Rejected', count: counts.rejected }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#0b2545] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : tab.alert ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input & Refresh */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search officer or email..."
              className="gov-input pl-8 py-1.5 text-xs w-full"
            />
          </div>
          <button
            type="submit"
            className="gov-btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
          >
            Search
          </button>
          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="gov-btn-secondary text-xs py-1.5 px-2.5 text-slate-600 hover:text-slate-900"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="gov-card p-12 text-center">
          <div className="w-8 h-8 border-3 border-[#0b2545] border-t-amber-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Retrieving official email change requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="gov-card p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Email Change Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'PENDING'
              ? 'Great! There are no pending officer email update requests awaiting authorization.'
              : 'No records matching the selected status or search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isReqPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req._id}
                className={`gov-card p-5 transition-all ${
                  isReqPending 
                    ? 'border-l-4 border-l-amber-500 hover:shadow-md' 
                    : isApproved 
                    ? 'border-l-4 border-l-emerald-600 opacity-90' 
                    : 'border-l-4 border-l-red-500 opacity-80'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0b2545] flex items-center justify-center font-bold text-xs border border-blue-100">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{req.officerName}</h4>
                        <span className="font-mono text-[11px] font-bold text-[#0b2545] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {req.employeeId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{req.designation || 'Grievance Officer'}</span>
                        <span>•</span>
                        <span className="text-slate-700 font-medium">{req.department?.name || 'Department'}</span>
                        {req.contactPhone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {req.contactPhone}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Timestamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isReqPending 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : isApproved 
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}>
                      {isReqPending && <Clock className="w-3 h-3 text-amber-700" />}
                      {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                      {isRejected && <XCircle className="w-3 h-3 text-red-700" />}
                      <span>{req.status}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Lodged: {new Date(req.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>
                </div>

                {/* Email Transition Visual Diff */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Former Email */}
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Former Login Email (Old)
                      </div>
                      <div className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 truncate">
                        {req.currentEmail}
                      </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="hidden sm:flex items-center justify-center pt-3 text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Requested Email */}
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                        Requested Login Email (New)
                      </div>
                      <div className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-300 truncate">
                        {req.requestedEmail}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Officer Reason / Justification */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Officer Justification Reason:
                  </div>
                  <p className="text-slate-800 italic">"{req.reason}"</p>
                </div>

                {/* Audit & Decision Footer */}
                {isReqPending ? (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>Approving changes the DB account email & dispatches dual Gmail SMTP notices immediately.</span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openRejectModal(req)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Request</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openApproveModal(req)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Send Dual Emails</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                    <div>
                      Reviewed by: <strong className="text-slate-700">{req.reviewedByName || 'Super Admin'}</strong> on{' '}
                      <span className="font-mono text-slate-600">
                        {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                      {req.adminNotes && (
                        <span className="ml-2 italic text-slate-600">({req.adminNotes})</span>
                      )}
                    </div>
                    {isApproved && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Dual Notices Dispatched via Gmail
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Approve / Reject */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className={`p-4 text-white flex items-center justify-between ${
              actionType === 'APPROVE' ? 'bg-[#0b2545]' : 'bg-red-900'
            }`}>
              <div className="flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                )}
                <h3 className="text-sm font-bold">
                  {actionType === 'APPROVE' ? 'Authorize Official Email Change' : 'Reject Email Change Request'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedRequest(null); setActionType(null); }}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <p className="text-slate-600">
                  Officer: <strong className="text-slate-900">{selectedRequest.officerName}</strong> ({selectedRequest.employeeId})
                </p>
                <p className="text-slate-600 mt-0.5">
                  Department: <strong className="text-slate-900">{selectedRequest.department?.name || 'Department'}</strong>
                </p>
              </div>

              {actionType === 'APPROVE' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="text-[11px] text-emerald-950 font-bold">
                    Official Approval Directives:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-900 text-[11px]">
                    <li>Login email will change from <code>{selectedRequest.currentEmail}</code> to <code>{selectedRequest.requestedEmail}</code>.</li>
                    <li>Official Confirmation Notice sent to <strong>former email</strong> (<code>{selectedRequest.currentEmail}</code>).</li>
                    <li>Official Activation Notice sent to <strong>new email</strong> (<code>{selectedRequest.requestedEmail}</code>).</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-[11px]">
                  Please state the administrative reason for rejecting this change request. This reason is logged to the central audit registry.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {actionType === 'APPROVE' ? 'Super Admin Remarks (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={actionType === 'APPROVE' ? 'e.g. Verified by Nodal Directorate' : 'e.g. Incomplete verification or policy conflict'}
                  className="gov-input text-xs py-2 w-full resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setSelectedRequest(null); setActionType(null); }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={actionLoading || (actionType === 'REJECT' && !adminNotes.trim())}
                  className={`text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {actionLoading 
                      ? 'Processing & Dispatching Emails...' 
                      : actionType === 'APPROVE' 
                      ? 'Confirm & Dispatch Emails' 
                      : 'Confirm Rejection'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

