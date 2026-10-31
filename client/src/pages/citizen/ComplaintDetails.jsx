import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Calendar, 
  Shield, 
  Building2, 
  ArrowLeft,
  FileCheck,
  Send,
  Loader2,
  AlertCircle,
  Camera,
  Layers,
  CheckCheck,
  User
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
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeMedia, setDisputeMedia] = useState([]);
  const [disputing, setDisputing] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await citizenApi.getComplaintDetails(id);
      if (res.data?.success) {
        setComplaint(res.data.data);
      } else {
        setError(res.data?.message || 'Complaint not found.');
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(err.response?.data?.message || 'Unable to retrieve complaint records.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (e) => {
    e.preventDefault();
    try {
      setVerifying(true);
      const res = await citizenApi.verifyResolution(id, feedback || 'Resolved satisfactorily');
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowVerifyModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify resolution.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisputeResolution = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      alert('Please specify why the resolution is disputed.');
      return;
    }

    try {
      setDisputing(true);
      const formData = new FormData();
      formData.append('reason', disputeReason.trim());
      disputeMedia.forEach((f) => formData.append('disputeMedia', f));

      const res = await citizenApi.disputeResolution(id, formData);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowDisputeModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setDisputing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Retrieving official grievance record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Grievance Not Found</h2>
        <p className="text-xs text-slate-600">
          {error || `No complaint record exists with identifier "${id}".`}
        </p>
        <div className="pt-2">
          <Link to="/track" className="gov-btn-primary text-xs">
            Search Another ID
          </Link>
        </div>
      </div>
    );
  }

  const stages = [
    { label: 'Submitted', key: 'Submitted' },
    { label: 'Under Review', key: 'Under Review' },
    { label: 'Accepted', key: 'Accepted' },
    { label: 'In Progress', key: 'In Progress' },
    { label: 'Resolved', key: 'Resolved' },
    { label: 'Verification', key: 'Verification' },
    { label: complaint.status === 'Disputed' ? 'Disputed' : 'Closed', key: complaint.status === 'Disputed' ? 'Disputed' : 'Closed' }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Accepted': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      case 'Closed': return 6;
      case 'Disputed': return 6;
      case 'Escalated': return 3;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(complaint.status);
  const formattedCreatedDate = new Date(complaint.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Back Button */}
      <div>
        <Link
          to="/my-complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Complaints</span>
        </Link>
      </div>

      {/* Main Grievance Header Card */}
      <div className="gov-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Complaint ID:
              </span>
              <span className="text-lg font-mono font-extrabold text-blue-950">
                {complaint.complaintId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Assigned Department: <strong className="text-slate-900 font-semibold">{complaint.department?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={complaint.urgency} />
            <StatusBadge status={complaint.status} size="lg" />
          </div>
        </div>

        {/* Horizontal Workflow Progression Bar */}
        <div className="py-2">
          <div className="flex items-center justify-between relative">
            {/* Connecting Bar */}
            <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200 -z-0"></div>
            <div 
              className="absolute left-4 top-3.5 h-0.5 bg-blue-600 transition-all -z-0"
              style={{ width: `${(Math.min(currentStageIdx, 5) / 5) * 100}%` }}
            ></div>

            {stages.map((st, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={st.label} className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isPast
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCurrent
                      ? complaint.status === 'Disputed'
                        ? 'bg-red-600 border-red-600 text-white ring-4 ring-red-100'
                        : 'bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {isPast ? <CheckCheck className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] mt-1 font-medium hidden sm:block ${
                    isCurrent ? 'text-blue-900 font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Banner if RESOLVED */}
        {complaint.status === 'Resolved' && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-900">
                  Resolution Reported by Department
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  The assigned department has completed remedial work. Please inspect the resolution notes and evidence below to confirm satisfaction or dispute the outcome.
                </p>
                {complaint.resolution?.notes && (
                  <p className="text-xs bg-white p-2.5 rounded-lg border border-emerald-200 text-slate-800 mt-2 font-medium">
                    "{complaint.resolution.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200 justify-end">
              <button
                onClick={() => setShowDisputeModal(true)}
                className="gov-btn-secondary text-red-700 border-red-300 hover:bg-red-50 text-xs py-2 px-3.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Dispute Resolution</span>
              </button>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="gov-btn-success text-xs py-2 px-4"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Confirm Resolution</span>
              </button>
            </div>
          </div>
        )}

        {/* Dispute Notice if Disputed */}
        {complaint.status === 'Disputed' && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3 text-red-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Grievance Reopened Under Citizen Dispute</strong>
              <p className="mt-0.5 leading-relaxed">
                Dispute Reason: "{complaint.dispute?.reason || 'Work rejected by citizen'}". Department officer has been alerted for re-inspection.
              </p>
            </div>
          </div>
        )}

        {/* Escalation Notice if Escalated */}
        {complaint.status === 'Escalated' && (
          <div className="p-4 bg-purple-50 border border-purple-300 rounded-xl flex items-start gap-3 text-purple-900 text-xs">
            <Shield className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Escalated to Higher Authority: {complaint.escalation?.escalatedTo}</strong>
              <p className="mt-0.5 leading-relaxed">
                Directive: "{complaint.escalation?.escalationReason || 'High priority administrative escalation'}".
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grievance Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Statement & Evidence */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Structured Grievance Statement */}
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Problem Description & Statement
            </h3>
            
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-800 leading-relaxed">
                {complaint.generatedProblemStatement || complaint.aiGeneratedDescription || complaint.description}
              </p>
            </div>

            {complaint.description && (complaint.generatedProblemStatement !== complaint.description) && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Citizen Raw Input:
                </span>
                <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-md border border-slate-100">
                  "{complaint.description}"
                </p>
              </div>
            )}
          </div>

          {/* Citizen Attachments / Evidence */}
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Attached Evidence</span>
              <span className="text-slate-400 font-normal text-[11px]">
                {complaint.attachments?.images?.length || 0} image(s)
              </span>
            </h3>

            {complaint.attachments?.images && complaint.attachments.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.attachments.images.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block"
                  >
                    <img
                      src={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                      alt="Citizen evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80'; }}
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-lg text-center">
                No photo attachments provided.
              </p>
            )}

            {/* Audio Attachment */}
            {complaint.attachments?.audio && complaint.attachments.audio.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">Voice Recording:</span>
                <audio
                  controls
                  className="w-full h-8"
                  src={complaint.attachments.audio[0].startsWith('http') ? complaint.attachments.audio[0] : `http://localhost:5001${complaint.attachments.audio[0]}`}
                />
              </div>
            )}
          </div>

          {/* Department Resolution Evidence (if present) */}
          {complaint.resolution?.media && complaint.resolution.media.length > 0 && (
            <div className="gov-card p-5 space-y-3 border-emerald-200">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Department Work Completion Proof</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.resolution.media.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative h-28 rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50 block"
                  >
                    <img
                      src={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                      alt="Work completed proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline of Status History */}
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Department Investigation & Action Trail
            </h3>
            <Timeline updates={complaint.progressUpdates} />
          </div>

        </div>

        {/* Right Col: Metadata Summary Card */}
        <div className="space-y-6">
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Grievance Meta
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Department Authority</span>
                <p className="font-semibold text-slate-900">{complaint.department?.name}</p>
                <span className="text-[10px] text-slate-500 font-mono">Code: {complaint.department?.code}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <p className="font-semibold text-slate-900">{complaint.category}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Incident Location</span>
                <p className="font-semibold text-slate-900 flex items-start gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span>{complaint.location?.address}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Submitted Date & Time</span>
                <p className="font-medium text-slate-700 font-mono">{formattedCreatedDate}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Priority Rating</span>
                <div className="mt-1">
                  <UrgencyBadge urgency={complaint.urgency} size="sm" />
                </div>
              </div>

              {complaint.citizenDetails?.name && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Submitted By</span>
                  <p className="font-medium text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{complaint.citizenDetails.name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Satisfactory Resolution
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirming this will mark grievance <strong>{complaint.complaintId}</strong> as <strong>Closed</strong> in official records.
            </p>

            <form onSubmit={handleConfirmResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feedback / Rating Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="E.g., Repaired promptly and thoroughly. Cleaned properly."
                  className="gov-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="gov-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="gov-btn-success text-xs"
                >
                  {verifying ? 'Submitting...' : 'Confirm & Close Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Dispute Department Resolution
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please describe why the work completed does not resolve the issue. Your grievance will be reopened for higher supervisor reinspection.
            </p>

            <form onSubmit={handleDisputeResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispute Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="E.g., Repair was incomplete; leak is still occurring; debris was left behind..."
                  className="gov-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="gov-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputing}
                  className="gov-btn-danger text-xs"
                >
                  {disputing ? 'Filing Dispute...' : 'File Official Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
