import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Search, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Train, 
  ArrowRight,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { railwayApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

export default function RailwayDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await railwayApi.getDashboardStats();
      if (res.data?.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching railway stats:', err);
      setError('Could not connect to Railway backend API.');
    } finally {
      setLoading(false);
    }
  };

  const counts = statsData?.counts || {
    total: 0,
    submitted: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    disputed: 0,
    escalated: 0,
    closed: 0,
    urgentCritical: 0
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner with Officer Identity & Refresh */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400 text-slate-950 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Railway Department Operations
            </span>
            <span className="text-xs text-slate-400">
              Station & Zonal Grievance Cell
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
            Operational Grievance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Logged in as <strong className="text-white">Railway Officer (Station Superintendent)</strong>. Real-time complaint queues and automated AI triaging feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          <Link
            to="/railway-dashboard/complaints"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all"
          >
            <Inbox className="w-4 h-4" />
            <span>Open Inbox</span>
          </Link>
        </div>
      </div>

      {/* DISPUTED COMPLAINTS ALERT BANNER (If any disputed) */}
      {counts.disputed > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Action Required: {counts.disputed} Disputed Complaint(s)
              </h3>
              <p className="text-xs text-rose-100">
                Citizens rejected the previous resolution. Immediate re-inspection or escalation required.
              </p>
            </div>
          </div>

          <Link
            to="/railway-dashboard/complaints?status=Disputed"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-md transition-colors"
          >
            <span>Review Disputed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Real-Time Overview Stats Cards (From MongoDB) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        {/* Total */}
        <Link
          to="/railway-dashboard/complaints"
          className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            {loading ? '-' : counts.total}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">All records</span>
        </Link>

        {/* New / Submitted */}
        <Link
          to="/railway-dashboard/complaints?status=Submitted"
          className="bg-white border border-blue-200 hover:border-blue-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            New / Submitted
          </span>
          <div className="text-2xl font-extrabold text-blue-700 font-['Outfit'] mt-1">
            {loading ? '-' : counts.submitted}
          </div>
          <span className="text-[10px] text-blue-500 mt-1 block">Needs review</span>
        </Link>

        {/* Under Review */}
        <Link
          to="/railway-dashboard/complaints?status=Under%20Review"
          className="bg-white border border-amber-200 hover:border-amber-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Under Review
          </span>
          <div className="text-2xl font-extrabold text-amber-700 font-['Outfit'] mt-1">
            {loading ? '-' : counts.underReview}
          </div>
          <span className="text-[10px] text-amber-500 mt-1 block">Inspection</span>
        </Link>

        {/* In Progress */}
        <Link
          to="/railway-dashboard/complaints?status=In%20Progress"
          className="bg-white border border-sky-200 hover:border-sky-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block">
            In Progress
          </span>
          <div className="text-2xl font-extrabold text-sky-700 font-['Outfit'] mt-1">
            {loading ? '-' : counts.inProgress}
          </div>
          <span className="text-[10px] text-sky-500 mt-1 block">Work deployed</span>
        </Link>

        {/* Resolved */}
        <Link
          to="/railway-dashboard/complaints?status=Resolved"
          className="bg-white border border-emerald-200 hover:border-emerald-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Resolved
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 font-['Outfit'] mt-1">
            {loading ? '-' : counts.resolved}
          </div>
          <span className="text-[10px] text-emerald-500 mt-1 block">Verification</span>
        </Link>

        {/* Disputed */}
        <Link
          to="/railway-dashboard/complaints?status=Disputed"
          className="bg-white border border-rose-200 hover:border-rose-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Disputed
          </span>
          <div className="text-2xl font-extrabold text-rose-700 font-['Outfit'] mt-1">
            {loading ? '-' : counts.disputed}
          </div>
          <span className="text-[10px] text-rose-500 mt-1 block">Citizen dispute</span>
        </Link>

        {/* Escalated */}
        <Link
          to="/railway-dashboard/complaints?status=Escalated"
          className="bg-white border border-purple-200 hover:border-purple-400 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all"
        >
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
            Escalated
          </span>
          <div className="text-2xl font-extrabold text-purple-700 font-['Outfit'] mt-1">
            {loading ? '-' : counts.escalated}
          </div>
          <span className="text-[10px] text-purple-500 mt-1 block">Higher cell</span>
        </Link>

      </div>

      {/* Main Grid: Category Distribution & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-railway-600" />
              Grievance Categories
            </h2>
            <span className="text-xs text-slate-400">Railway Division</span>
          </div>

          <div className="space-y-3">
            {statsData?.categoryStats?.map((cat) => {
              const pct = counts.total > 0 ? Math.round((cat.count / counts.total) * 100) : 0;
              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat._id}</span>
                    <span className="font-bold text-slate-900">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-railway-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Urgent Action Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Recent Railway Complaints Stream
              </h2>
              <p className="text-xs text-slate-500">Live feed of reported grievances</p>
            </div>

            <Link
              to="/railway-dashboard/complaints"
              className="text-xs font-semibold text-railway-600 hover:text-railway-800 flex items-center gap-1"
            >
              <span>View Full Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {statsData?.recentComplaints?.map((item) => (
              <div
                key={item._id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.complaintId}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    <UrgencyBadge urgency={item.urgency} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {item.category}: {item.description}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    📍 {item.location?.address || 'Railway Station'}
                  </p>
                </div>

                <Link
                  to={`/railway-dashboard/complaints/${item.complaintId || item._id}`}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
