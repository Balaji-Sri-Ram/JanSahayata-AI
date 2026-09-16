import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  ListFilter, 
  Sparkles, 
  ShieldCheck, 
  Train, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  Mic,
  Camera,
  Layers,
  Zap,
  Activity
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

export default function CitizenHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await citizenApi.getMyComplaints('CITIZEN-DEMO-001');
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeComplaints = complaints.filter(c => !['Closed', 'Resolved'].includes(c.status));
  const resolvedComplaints = complaints.filter(c => ['Closed', 'Resolved'].includes(c.status));

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner with Modern Civic AI Styling */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-railway-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-railway-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-sky-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-200 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Assisted Grievance Mediation Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white mb-3">
            Fast, Transparent Civic Resolution for Railway Passengers
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed max-w-2xl">
            Report hazards, sanitation issues, and broken facilities at any railway station or coach. Our automated AI triaging pipeline categorizes your report, drafts formal grievance statements, and directly alerts responsible railway divisions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/report-problem"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-railway-600 to-sky-500 hover:from-railway-500 hover:to-sky-400 text-white font-semibold text-sm shadow-lg shadow-sky-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report a Problem Now</span>
            </Link>

            <Link
              to="/my-complaints"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-medium text-sm transition-all"
            >
              <ListFilter className="w-4 h-4" />
              <span>Track My Complaints ({complaints.length})</span>
            </Link>
          </div>
        </div>

        {/* Demo Citizen Identity Card */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>Current Active Citizen Identity: <strong className="text-white font-mono">CITIZEN-DEMO-001</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Active Issues: <strong className="text-amber-400">{activeComplaints.length}</strong></span>
            <span>Resolved: <strong className="text-emerald-400">{resolvedComplaints.length}</strong></span>
          </div>
        </div>
      </div>

      {/* AI Processing Flow Visualization (How It Works) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-railway-600" />
              How AI-Assisted Complaint Processing Works
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated multi-modal pipeline preparing reports for railway engineers
            </p>
          </div>
          <span className="text-[11px] font-semibold text-railway-600 bg-railway-50 border border-railway-200 px-2.5 py-1 rounded-full">
            Autonomous Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group hover:border-railway-300 transition-all">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-railway-700 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="font-semibold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-slate-600" /> Multi-Modal Input
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Describe in plain text, record a quick voice snippet, or upload photos/videos of the problem.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group hover:border-railway-300 transition-all">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="font-semibold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-600" /> YOLO & NLP Triaging
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Computer vision detects hazards (potholes, track debris) while NLP formulates standard problem statements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group hover:border-railway-300 transition-all">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="font-semibold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Citizen Confirmation
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Review and optionally refine the AI-generated problem statement before final submission.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group hover:border-railway-300 transition-all">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h3 className="font-semibold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolution Verification
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Once railway teams mark work resolved, you confirm actual resolution or dispute if problem persists.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Active Complaints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-700" />
              Your Recent Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Live status tracking directly from Railway operations database
            </p>
          </div>

          <Link
            to="/my-complaints"
            className="text-xs font-semibold text-railway-600 hover:text-railway-700 inline-flex items-center gap-1 group"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-railway-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading complaints from database...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Train className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">No Complaints Submitted Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Have you noticed broken facilities, water leaks, or safety hazards on a platform or train?
            </p>
            <Link
              to="/report-problem"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-railway-600 text-white text-xs font-semibold hover:bg-railway-700 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report a Problem</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="bg-white border border-slate-200 hover:border-railway-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {item.complaintId}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 font-['Outfit']">
                    {item.category}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-4">
                    <UrgencyBadge urgency={item.urgency} size="sm" />
                    <span className="truncate max-w-[140px]" title={item.location?.address}>
                      📍 {item.location?.address || 'Railway Station'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <Link
                    to={`/complaint/${item.complaintId || item._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-railway-600 hover:text-railway-800"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
