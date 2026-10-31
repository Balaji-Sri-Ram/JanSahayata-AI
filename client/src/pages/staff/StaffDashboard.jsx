import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ArrowRight,
  Layers,
  AlertCircle,
  FileCheck,
  Mail
} from 'lucide-react';
import { staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import OfficerEmailChangeModal from '../../components/OfficerEmailChangeModal';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [error, setError] = useState(null);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  // Real-time live polling (every 8s)
  useEffect(() => {
    const timer = setInterval(() => {
      staffApi.getDashboardStats().then(res => {
        if (res.data?.success) setStatsData(res.data.data);
      }).catch(() => {});
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const fetchStats = async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
        setRefreshCountdown(3);
        const timer = setInterval(() => {
          setRefreshCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);
        setTimeout(() => clearInterval(timer), 3200);
      } else {
        setLoading(true);
      }
      setError(null);
      const [res] = await Promise.all([
        staffApi.getDashboardStats(),
        isManual ? new Promise(r => setTimeout(r, 3000)) : Promise.resolve()
      ]);
      if (res.data?.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading staff stats:', err);
      setError('Could not connect to department statistics API.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setRefreshCountdown(0);
    }
  };

  const counts = statsData?.counts || {
    total: 0,
    submitted: 0,
    underReview: 0,
    accepted: 0,
    inProgress: 0,
    resolved: 0,
    disputed: 0,
    escalated: 0,
    closed: 0,
    urgentCritical: 0
  };

  const department = statsData?.department || user?.department || { name: 'Department' };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Officer Department Banner */}
      <div className="gov-card p-6 bg-slate-900 text-white border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold">
              <Building2 className="w-3.5 h-3.5" /> {department.name || 'Government Department'}
            </span>
            <span className="text-xs text-slate-400">
              Official Grievance Queue
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            Operational Grievance Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Officer: <strong className="text-slate-200">{user?.name}</strong> • Designation: <strong className="text-slate-200">{user?.designation || 'Grievance Officer'}</strong> • ID: <span className="font-mono text-amber-300">{user?.employeeId || 'OFFICER-01'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEmailChangeModal(true)}
            className="gov-btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-2 px-3"
            title="Request official email update for Super Admin approval"
          >
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span>Update Email</span>
          </button>

          <button
            onClick={() => fetchStats(true)}
            disabled={loading || isRefreshing}
            className="gov-btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-2 px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-300' : ''}`} />
            <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh Queue'}</span>
          </button>

          <Link
            to="/staff/complaints"
            className="gov-btn-primary bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-3.5 font-semibold"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Open Department Inbox</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Workload Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Ingested
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{counts.total}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Total departmental load</span>
        </div>

        <div className="gov-card p-4 border-blue-200 bg-blue-50/40">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
            New & Under Review
          </span>
          <p className="text-2xl font-bold text-blue-900 font-mono mt-1">{counts.submitted + counts.underReview}</p>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Needs official inspection</span>
        </div>

        <div className="gov-card p-4 border-sky-200 bg-sky-50/40">
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block">
            In Progress
          </span>
          <p className="text-2xl font-bold text-sky-900 font-mono mt-1">{counts.inProgress + counts.accepted}</p>
          <span className="text-[11px] text-sky-600 mt-0.5 block">Field repairs mobilized</span>
        </div>

        <div className="gov-card p-4 border-red-200 bg-red-50/40">
          <span className="text-xs font-semibold text-red-800 uppercase tracking-wider block">
            Disputed / Escalated
          </span>
          <p className="text-2xl font-bold text-red-900 font-mono mt-1">{counts.disputed + counts.escalated}</p>
          <span className="text-[11px] text-red-600 mt-0.5 block">High priority review</span>
        </div>
      </div>

      {/* Status Breakdown Bar */}
      <div className="gov-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Grievance Status Breakdown
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-800 block">Submitted</span>
            <p className="text-lg font-bold text-blue-900 font-mono mt-0.5">{counts.submitted}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800 block">Under Review</span>
            <p className="text-lg font-bold text-amber-900 font-mono mt-0.5">{counts.underReview}</p>
          </div>
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
            <span className="text-[11px] font-semibold text-sky-800 block">In Progress</span>
            <p className="text-lg font-bold text-sky-900 font-mono mt-0.5">{counts.inProgress}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 block">Resolved</span>
            <p className="text-lg font-bold text-emerald-900 font-mono mt-0.5">{counts.resolved}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <span className="text-[11px] font-semibold text-red-800 block">Disputed</span>
            <p className="text-lg font-bold text-red-900 font-mono mt-0.5">{counts.disputed}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <span className="text-[11px] font-semibold text-purple-800 block">Escalated</span>
            <p className="text-lg font-bold text-purple-900 font-mono mt-0.5">{counts.escalated}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-700 block">Closed</span>
            <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">{counts.closed}</p>
          </div>
        </div>
      </div>

      {/* Recent Department Complaints */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Department Grievances
          </h2>
          <Link
            to="/staff/complaints"
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>View All ({counts.total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {statsData?.recentComplaints && statsData.recentComplaints.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {statsData.recentComplaints.map((c) => (
              <div key={c._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-lg px-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-900">
                      {c.complaintId}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    <UrgencyBadge urgency={c.urgency} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-md">
                    {c.category} — <span className="font-normal text-slate-600">{c.generatedProblemStatement || c.description}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Location: {c.location?.address}
                  </p>
                </div>

                <Link
                  to={`/staff/complaints/${c.complaintId}`}
                  className="gov-btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto shrink-0"
                >
                  <span>Open Workbench</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No active grievances assigned to your department queue.
          </p>
        )}
      </div>

      {/* Officer Email Update Modal */}
      <OfficerEmailChangeModal
        isOpen={showEmailChangeModal}
        onClose={() => setShowEmailChangeModal(false)}
      />
    </div>
  );
}
