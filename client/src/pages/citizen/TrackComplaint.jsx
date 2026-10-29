import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, ArrowRight, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (complaintId.trim()) {
      navigate(`/complaint/${complaintId.trim()}`);
    }
  };

  const sampleIds = ['JNS-2026-000001', 'JNS-2026-000002', 'JNS-2026-000003', 'JNS-2026-000004'];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-16">
      
      <div className="gov-card p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Track Grievance Redressal Status
          </h1>
          <p className="text-xs text-slate-500">
            Enter your unique Complaint Reference Number to check real-time progress, department updates, and resolution verification status.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-4">
          <div>
            <label htmlFor="complaintIdInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Complaint Reference ID
            </label>
            <div className="flex gap-2">
              <input
                id="complaintIdInput"
                type="text"
                required
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder="E.g., JNS-2026-000001 or RLY-2026-000001"
                className="gov-input font-mono text-sm py-3"
              />
              <button
                type="submit"
                className="gov-btn-primary px-6 shrink-0"
              >
                <span>Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
            <span className="font-medium">Official Reference Numbers (Sample records):</span>
            {sampleIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setComplaintId(id);
                  navigate(`/complaint/${id}`);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-[#0b2545] text-slate-800 font-mono text-[11px] border border-slate-200 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gov-card p-4 space-y-2">
          <Clock className="w-5 h-5 text-blue-700" />
          <h3 className="text-xs font-bold text-slate-900">Live Stage Updates</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Follow your grievance through Submitted, Under Review, Accepted, In Progress, and Resolved stages.
          </p>
        </div>

        <div className="gov-card p-4 space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900">Resolution Verification</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect photographic evidence uploaded by field officials and confirm resolution with one click.
          </p>
        </div>

        <div className="gov-card p-4 space-y-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-xs font-bold text-slate-900">Dispute Redressal</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            If the issue remains unresolved or unsatisfactory, reject the resolution to automatically reopen investigation.
          </p>
        </div>
      </div>

    </div>
  );
}
