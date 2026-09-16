import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Cpu, 
  Sparkles, 
  Train, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Send, 
  UploadCloud, 
  Loader2, 
  Camera, 
  Volume2, 
  Film, 
  Check, 
  X,
  FileText,
  RotateCcw
} from 'lucide-react';
import { railwayApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import Timeline from '../../components/Timeline';

export default function RailwayComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Officer Action Form States
  const [statusUpdate, setStatusUpdate] = useState('In Progress');
  const [progressMessage, setProgressMessage] = useState('');
  const [progressMedia, setProgressMedia] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Resolve Modal/Form
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [resolutionMedia, setResolutionMedia] = useState([]);

  // Escalate Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('Requires specialized divisional engineering approval and track block');
  const [escalatedTo, setEscalatedTo] = useState('Divisional Railway Manager (DRM) Grievance Cell');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await railwayApi.getComplaintDetails(id);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setStatusUpdate(res.data.data.status);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Could not load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  // Submit standard progress update
  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!progressMessage.trim()) {
      alert('Please enter a progress update note.');
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('status', statusUpdate);
      formData.append('message', progressMessage.trim());
      formData.append('officerName', 'Railway Officer');
      formData.append('officerRole', 'Station Superintendent');

      progressMedia.forEach((file) => {
        formData.append('resolutionMedia', file);
      });

      const res = await railwayApi.addProgressUpdate(id, formData);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setProgressMessage('');
        setProgressMedia([]);
        setActionNotice({ type: 'success', text: `Progress logged & status updated to "${statusUpdate}".` });
      }
    } catch (err) {
      console.error('Progress update error:', err);
      alert('Failed to log progress update.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as Resolved
  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolutionDesc.trim()) {
      alert('Please enter a resolution description.');
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('resolutionDescription', resolutionDesc.trim());
      formData.append('officerName', 'Railway Officer');
      formData.append('officerRole', 'Senior Section Engineer');

      resolutionMedia.forEach((file) => {
        formData.append('resolutionMedia', file);
      });

      const res = await railwayApi.resolveComplaint(id, formData);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowResolveModal(false);
        setResolutionDesc('');
        setResolutionMedia([]);
        setActionNotice({ type: 'success', text: 'Complaint marked as Resolved and sent to citizen for resolution confirmation.' });
      }
    } catch (err) {
      console.error('Resolve error:', err);
      alert('Failed to mark complaint as resolved.');
    } finally {
      setActionLoading(false);
    }
  };

  // Escalate Complaint
  const handleEscalateComplaint = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await railwayApi.escalateComplaint(id, {
        escalationReason: escalationReason.trim(),
        escalatedTo: escalatedTo.trim(),
        officerName: 'Railway Officer'
      });
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowEscalateModal(false);
        setActionNotice({ type: 'warning', text: `Grievance escalated to ${escalatedTo}.` });
      }
    } catch (err) {
      console.error('Escalate error:', err);
      alert('Failed to escalate complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-railway-600 mb-2" />
        Loading complaint record...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Complaint Record Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || 'Requested complaint ID does not exist.'}</p>
        <Link to="/railway-dashboard/complaints" className="text-xs font-semibold text-railway-600 hover:underline">
          &larr; Return to Department Inbox
        </Link>
      </div>
    );
  }

  const isDisputed = complaint.status === 'Disputed';
  const isEscalated = complaint.status === 'Escalated';
  const detectedObject = complaint.aiAnalysis?.detectedObjects?.[0] || {
    label: 'Damaged Infrastructure / Obstruction',
    confidence: 0.94,
    bbox: [20, 25, 60, 50]
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/railway-dashboard/complaints"
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
              <UrgencyBadge urgency={complaint.urgency} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Citizen ID: <span className="font-mono text-slate-700">{complaint.citizenId || 'CITIZEN-DEMO-001'}</span>
            </p>
          </div>
        </div>

        {/* Quick Modal Triggers */}
        <div className="flex items-center gap-2">
          {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Resolved</span>
            </button>
          )}

          {!isEscalated && (
            <button
              onClick={() => setShowEscalateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Escalate Grievance</span>
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-purple-50 border-purple-200 text-purple-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* DISPUTED ALERT BANNER IN OFFICER VIEW */}
      {isDisputed && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 text-xs text-rose-900 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Citizen Dispute Active</span>
            </div>
            <span className="text-[11px] font-mono text-rose-600">
              Disputed on {complaint.dispute?.createdAt ? new Date(complaint.dispute.createdAt).toLocaleString() : 'Recently'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-rose-200 text-slate-800">
            <span className="font-semibold text-rose-700 block mb-0.5">Citizen Rejection Reason:</span>
            <p className="leading-relaxed">"{complaint.dispute?.reason || 'Problem still exists at site.'}"</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setStatusUpdate('In Progress');
                setProgressMessage('Reopened complaint investigation based on citizen dispute feedback. Re-deploying field repair team.');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen & Restart Investigation</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left side (Citizen Report + AI Analysis) / Right side (Officer Action Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Inspection details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Citizen Report Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-railway-600" />
                Citizen Submission
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(complaint.createdAt).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Category</span>
              <span className="text-sm font-bold text-slate-900">{complaint.category}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Citizen Raw Description
                </span>
                <p className="text-slate-800 leading-relaxed">{complaint.description}</p>
              </div>

              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl">
                <span className="text-[11px] font-semibold text-sky-800 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> AI-Generated Problem Statement
                </span>
                <p className="text-slate-800 leading-relaxed">{complaint.aiGeneratedDescription || complaint.description}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Location: <strong>{complaint.location?.address || 'Railway Station Premises'}</strong></span>
              {complaint.location?.latitude && (
                <span className="text-[11px] font-mono text-slate-400">
                  ({complaint.location.latitude.toFixed(4)}°, {complaint.location.longitude.toFixed(4)}°)
                </span>
              )}
            </div>
          </div>

          {/* AI YOLO Vision & Triage Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-['Outfit'] text-white">
                    AI Computer Vision & Automated Triaging Analysis
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    FastAPI / YOLOv8 Mock Inference Pipeline
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Model: YOLOv8-Civic-v1
              </span>
            </div>

            {/* Visual Bounding Box Demonstration */}
            <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 aspect-video max-h-64 flex items-center justify-center">
              {complaint.attachments?.images?.[0] ? (
                <img
                  src={`http://localhost:5001${complaint.attachments.images[0]}`}
                  alt="Uploaded Site Media"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80'; }}
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <Camera className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">No media attached; simulated object bounding box representation</p>
                </div>
              )}

              {/* Simulated YOLO Bounding Box Overlay */}
              <div 
                className="absolute border-2 border-emerald-400 bg-emerald-500/15 flex flex-col justify-between p-1 pointer-events-none rounded"
                style={{
                  top: `${detectedObject.bbox[1]}%`,
                  left: `${detectedObject.bbox[0]}%`,
                  width: `${detectedObject.bbox[2]}%`,
                  height: `${detectedObject.bbox[3]}%`
                }}
              >
                <span className="bg-emerald-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow w-max">
                  {detectedObject.label} ({Math.round(detectedObject.confidence * 100)}%)
                </span>
                <span className="text-[8px] text-emerald-200 self-end font-mono">
                  [YOLO bbox]
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Detected Object</span>
                <span className="font-semibold text-emerald-300">{detectedObject.label}</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Confidence Score</span>
                <span className="font-semibold text-sky-300">{Math.round(detectedObject.confidence * 100)}%</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Predicted Category</span>
                <span className="font-semibold text-slate-200">{complaint.category}</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Predicted Urgency</span>
                <span className="font-semibold text-amber-300">{complaint.urgency}</span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {((complaint.attachments?.images && complaint.attachments.images.length > 0) ||
            (complaint.attachments?.videos && complaint.attachments.videos.length > 0) ||
            (complaint.attachments?.audio && complaint.attachments.audio.length > 0)) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submitted Media Files
              </h3>

              {/* Images */}
              {complaint.attachments.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {complaint.attachments.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={`http://localhost:5001${img}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 hover:ring-2 hover:ring-railway-500 transition-all"
                    >
                      <img
                        src={`http://localhost:5001${img}`}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&q=80'; }}
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Video */}
              {complaint.attachments.videos?.length > 0 && (
                <video
                  src={`http://localhost:5001${complaint.attachments.videos[0]}`}
                  controls
                  className="w-full max-h-48 rounded-xl bg-black mt-2"
                />
              )}

              {/* Voice note */}
              {complaint.attachments.audio?.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 mt-2">
                  <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    Voice Recording
                  </span>
                  <audio
                    src={`http://localhost:5001${complaint.attachments.audio[0]}`}
                    controls
                    className="h-8 max-w-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Timeline Audit Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-railway-600" />
              Progress Log & Investigation History
            </h2>
            <Timeline updates={complaint.progressUpdates || []} />
          </div>

        </div>

        {/* Right Column: Officer Action Panel */}
        <div className="space-y-6">
          
          {/* Action Card: Update Status & Log Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-railway-600" />
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                Officer Action Center
              </h3>
            </div>

            <form onSubmit={handleAddProgress} className="space-y-3.5">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Complaint Status
                </label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white focus:border-railway-500 outline-hidden"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Accepted">Accepted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Disputed">Disputed</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Progress Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Progress Message / Officer Note
                </label>
                <textarea
                  rows={3}
                  value={progressMessage}
                  onChange={(e) => setProgressMessage(e.target.value)}
                  placeholder='e.g., "Civil maintenance team deployed with patch repair materials on platform 2."'
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-railway-500 outline-hidden"
                  required
                />
              </div>

              {/* Upload Site Photo */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Attach Inspection Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setProgressMedia(Array.from(e.target.files))}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !progressMessage.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Save Progress Update</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Mark Complaint as Resolved
              </h3>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Describe the physical remediation work performed. The citizen will be notified to verify resolution on-site.
            </p>

            <form onSubmit={handleResolveComplaint} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Description *
                </label>
                <textarea
                  rows={3}
                  value={resolutionDesc}
                  onChange={(e) => setResolutionDesc(e.target.value)}
                  placeholder='e.g., "The damaged pavement near platform 2 has been leveled with hot asphalt and cured."'
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Completion Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setResolutionMedia(Array.from(e.target.files))}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading || !resolutionDesc.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Mark as Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-purple-900 font-['Outfit'] flex items-center gap-2">
                <Flame className="w-5 h-5 text-purple-600" />
                Escalate Grievance to Higher Authority
              </h3>
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Transfer this case to divisional leadership or senior safety cells for urgent intervention.
            </p>

            <form onSubmit={handleEscalateComplaint} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escalate To
                </label>
                <input
                  type="text"
                  value={escalatedTo}
                  onChange={(e) => setEscalatedTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-purple-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escalation Reason *
                </label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-purple-500 outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading || !escalationReason.trim()}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-4 h-4 text-amber-300" />}
                  <span>Confirm Escalation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
