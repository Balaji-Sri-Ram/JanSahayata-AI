import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  Train, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  UploadCloud, 
  Loader2, 
  Eye, 
  Volume2, 
  Film,
  FileCheck2,
  Check,
  X
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import Timeline from '../../components/Timeline';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verification & Dispute States
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeMedia, setDisputeMedia] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await citizenApi.getComplaintDetails(id);
      if (res.data?.success) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Could not load complaint details. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm resolution (Yes, Problem Resolved -> Closed)
  const handleConfirmResolution = async () => {
    try {
      setActionLoading(true);
      const res = await citizenApi.verifyResolution(id, 'Citizen confirmed resolution on-site.');
      if (res.data?.success) {
        setComplaint(res.data.data);
        setActionMessage({ type: 'success', text: 'Thank you! Resolution confirmed. Complaint is now marked as Closed.' });
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Failed to confirm resolution. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit dispute (No, Problem Still Exists -> Disputed)
  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      alert('Please specify why the problem is still unresolved.');
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('reason', disputeReason);
      disputeMedia.forEach((file) => {
        formData.append('disputeMedia', file);
      });

      const res = await citizenApi.disputeResolution(id, formData);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowDisputeForm(false);
        setActionMessage({ type: 'warning', text: 'Dispute submitted. The Railway Department has been alerted to re-inspect.' });
      }
    } catch (err) {
      console.error('Dispute submission error:', err);
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-railway-600 mb-2" />
        Loading complaint details from Railway server...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || 'The requested complaint does not exist.'}</p>
        <Link to="/my-complaints" className="text-xs font-semibold text-railway-600 hover:underline">
          &larr; Back to My Complaints
        </Link>
      </div>
    );
  }

  const isResolvedPending = complaint.status === 'Resolved' && !complaint.verification?.isVerified;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 pb-16">
      
      {/* Back button and Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/my-complaints"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {complaint.complaintId}
              </span>
              <StatusBadge status={complaint.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned to {complaint.department?.name || 'Railway Department'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={complaint.urgency} size="md" />
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* RESOLUTION VERIFICATION BANNER (When marked Resolved) */}
      {isResolvedPending && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg border border-emerald-400 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit']">
                Was this problem actually resolved?
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                The Railway Department officer has marked this issue as resolved. Please verify whether the physical repair or cleanup was satisfactory.
              </p>
              {complaint.resolution?.notes && (
                <div className="mt-2 p-2.5 bg-black/20 rounded-lg text-xs text-white border border-white/10">
                  <strong className="text-amber-200">Officer Resolution Note:</strong> "{complaint.resolution.notes}"
                </div>
              )}
            </div>
          </div>

          {!showDisputeForm ? (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Yes, Problem Resolved (Close Grievance)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDisputeForm(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-300" />
                <span>No, Problem Still Exists (Dispute)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitDispute} className="mt-4 p-4 bg-white text-slate-900 rounded-xl shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Why are you disputing the resolution?
                </label>
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder='e.g., "The potholes were only filled with gravel without asphalt; rain washed it away this morning."'
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-hidden"
                required
              />

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Upload supporting photo proof (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setDisputeMedia(Array.from(e.target.files))}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !disputeReason.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Submit Dispute to Railway Department</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* DISPUTED STATUS BANNER */}
      {complaint.status === 'Disputed' && complaint.dispute && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-xs text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Complaint Under Dispute Investigation</span>
          </div>
          <p className="text-slate-700">
            <strong>Citizen Dispute Reason:</strong> "{complaint.dispute.reason}"
          </p>
          <span className="text-[11px] text-slate-500 block">
            Logged on: {new Date(complaint.dispute.createdAt).toLocaleString()}
          </span>
        </div>
      )}

      {/* ESCALATED BANNER */}
      {complaint.status === 'Escalated' && complaint.escalation && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-xs text-purple-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-purple-800">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Escalated to Higher Authority</span>
          </div>
          <p className="text-slate-700">
            <strong>Escalated To:</strong> {complaint.escalation.escalatedTo}
          </p>
          <p className="text-slate-700">
            <strong>Reason:</strong> "{complaint.escalation.escalationReason}"
          </p>
        </div>
      )}

      {/* Complaint Information Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <span className="text-xs font-semibold text-railway-600 uppercase tracking-wider">
            {complaint.category}
          </span>
          <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] mt-0.5">
            {complaint.aiGeneratedDescription || complaint.description}
          </h2>
        </div>

        {/* Original Description vs AI Formulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Original Citizen Description
            </span>
            <p className="text-slate-800 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl">
            <span className="text-[11px] font-semibold text-sky-800 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> AI-Standardized Statement
            </span>
            <p className="text-slate-800 leading-relaxed">
              {complaint.aiGeneratedDescription || complaint.description}
            </p>
          </div>
        </div>

        {/* Location & Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location?.address || 'Railway Station Premises'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Train className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Dept: {complaint.department?.name || 'Railway'}</span>
          </div>
        </div>

        {/* Attachments Section (Images / Videos / Audio) */}
        {((complaint.attachments?.images && complaint.attachments.images.length > 0) ||
          (complaint.attachments?.videos && complaint.attachments.videos.length > 0) ||
          (complaint.attachments?.audio && complaint.attachments.audio.length > 0)) && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Attached Evidence Media
            </h3>

            {/* Images */}
            {complaint.attachments.images?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {complaint.attachments.images.map((img, idx) => (
                  <a
                    key={idx}
                    href={`http://localhost:5001${img}`}
                    target="_blank"
                    rel="noreferrer"
                    className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 hover:ring-2 hover:ring-railway-500 transition-all"
                  >
                    <img
                      src={`http://localhost:5001${img}`}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&q=80'; }}
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Video */}
            {complaint.attachments.videos?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Film className="w-3 h-3 text-slate-600" /> Video Recording
                </span>
                <video
                  src={`http://localhost:5001${complaint.attachments.videos[0]}`}
                  controls
                  className="w-full max-h-56 rounded-xl bg-black"
                />
              </div>
            )}

            {/* Audio Voice Note */}
            {complaint.attachments.audio?.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Recorded Voice Grievance</span>
                </div>
                <audio
                  src={`http://localhost:5001${complaint.attachments.audio[0]}`}
                  controls
                  className="h-8 max-w-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Timeline Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-railway-600" />
            Official Progress & Redressal Timeline
          </h2>
          <span className="text-xs text-slate-400">
            {complaint.progressUpdates?.length || 0} event(s) logged
          </span>
        </div>

        <Timeline updates={complaint.progressUpdates || []} />
      </div>

    </div>
  );
}
