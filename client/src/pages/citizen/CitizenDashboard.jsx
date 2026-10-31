import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  ListFilter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  UserCheck,
  Mail
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import CitizenEmailChangeModal from '../../components/CitizenEmailChangeModal';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    fetchCitizenData();
  }, [user]);

  const fetchCitizenData = async () => {
    try {
      setLoading(true);
      const citizenId = user?._id || 'current';
      const res = await citizenApi.getMyComplaints(citizenId);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching citizen dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeComplaints = complaints.filter(c => ['Submitted', 'Under Review', 'Accepted', 'In Progress', 'Disputed', 'Escalated'].includes(c.status));
  const awaitingVerification = complaints.filter(c => c.status === 'Resolved');
  const closedComplaints = complaints.filter(c => c.status === 'Closed');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Welcome & Citizen Identity Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
            Citizen Grievance Account
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            {getTimeGreeting()}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor the status of your reported civic issues and confirm completed department work.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>Email: <strong className="font-mono text-slate-800">{user?.email}</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="text-[#0b2545] hover:text-[#e86100] font-semibold underline inline-flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-[#0b2545]" />
              <span>Change Email Address (OTP)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/report"
            className="gov-btn-saffron text-xs py-2 px-3.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lodge Grievance</span>
          </Link>
          <Link
            to="/track"
            className="gov-btn-secondary text-xs py-2 px-3"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track by ID</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gov-card p-4">
          <span className="text-slate-500 text-xs font-medium block">Total Reported</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{complaints.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Lifetime grievances</span>
        </div>

        <div className="gov-card p-4 border-blue-200 bg-blue-50/40">
          <span className="text-blue-800 text-xs font-medium block">Active in Progress</span>
          <p className="text-2xl font-bold text-blue-900 mt-1 font-mono">{activeComplaints.length}</p>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Under active investigation</span>
        </div>

        <div className="gov-card p-4 border-amber-200 bg-amber-50/40">
          <span className="text-amber-800 text-xs font-medium block">Awaiting Verification</span>
          <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">{awaitingVerification.length}</p>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Requires citizen sign-off</span>
        </div>

        <div className="gov-card p-4 border-emerald-200 bg-emerald-50/40">
          <span className="text-emerald-800 text-xs font-medium block">Resolved & Closed</span>
          <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{closedComplaints.length}</p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Satisfactorily completed</span>
        </div>
      </div>

      {/* Action Notice if Awaiting Verification */}
      {awaitingVerification.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Action Required: {awaitingVerification.length} Grievance(s) Ready for Your Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Department officials have reported work completion on your issue. Please review the proof and confirm or dispute the resolution.
              </p>
            </div>
          </div>
          <Link
            to={`/complaint/${awaitingVerification[0].complaintId}`}
            className="gov-btn-primary text-xs py-1.5 px-3 bg-amber-700 hover:bg-amber-800 shrink-0"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Recent Complaints
          </h2>
          <Link
            to="/my-complaints"
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>View all ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="gov-card p-8 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="gov-card p-8 text-center space-y-3">
            <p className="text-xs text-slate-500">You have not submitted any complaints yet.</p>
            <Link to="/report" className="gov-btn-primary text-xs">
              Report a Problem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.slice(0, 4).map((c) => (
              <div key={c._id} className="gov-card p-4 space-y-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-900">
                    {c.complaintId}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {c.category}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                    {c.generatedProblemStatement || c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>{c.department?.name}</span>
                  <Link
                    to={`/complaint/${c.complaintId}`}
                    className="font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Email Change Modal */}
      <CitizenEmailChangeModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />

    </div>
  );
}
