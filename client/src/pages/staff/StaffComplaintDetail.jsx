import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ArrowLeft,
  FileCheck,
  Send,
  Loader2,
  AlertCircle,
  Camera,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  PlusCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import Timeline from '../../components/Timeline';

export default function StaffComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expandable AI Analysis
  const [showAiDetails, setShowAiDetails] = useState(false);

  // Action Tabs / Modals
  const [statusMessage, setStatusMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Investigation / Progress update
  const [progressNote, setProgressNote] = useState('');
  const [progressMediaFiles, setProgressMediaFiles] = useState([]);
  const [addingProgress, setAddingProgress] = useState(false);

  // Resolve Modal / Form
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState([]);
  const [resolving, setResolving] = useState(false);

  // Escalate Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalatedTo, setEscalatedTo] = useState('Divisional Grievance Cell / Directorate');
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffApi.getComplaintDetails(id);
      if (res.data?.success) {
        setComplaint(res.data.data);
      } else {
        setError('Complaint not found.');
      }
    } catch (err) {
      console.error('Error fetching staff complaint:', err);
      setError(err.response?.data?.message || 'Unauthorized access or grievance record not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await staffApi.updateStatus(id, {
        status: newStatus,
        message: statusMessage.trim() || `Status moved to ${newStatus} by ${user?.name || 'Department Officer'}.`
      });
      if (res.data?.success) {
        setComplaint(res.data.data);
        setStatusMessage('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!progressNote.trim()) {
      alert('Please enter an investigation note or progress description.');
      return;
    }

    try {
      setAddingProgress(true);
      const formData = new FormData();
      formData.append('message', progressNote.trim());
      formData.append('notes', progressNote.trim());
      formData.append('status', complaint.status === 'Submitted' ? 'In Progress' : complaint.status);
      progressMediaFiles.forEach(f => formData.append('resolutionMedia', f));

      const res = await staffApi.addProgressUpdate(id, formData);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setProgressNote('');
        setProgressMediaFiles([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log progress.');
    } finally {
      setAddingProgress(false);
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      alert('Please provide detailed work completion notes.');
      return;
    }

    try {
      setResolving(true);
      const formData = new FormData();
      formData.append('resolutionDescription', resolutionText.trim());
      resolutionFiles.forEach(f => formData.append('resolutionMedia', f));

      const res = await staffApi.resolveComplaint(id, formData);
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowResolveForm(false);
        setResolutionText('');
        setResolutionFiles([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit resolution.');
    } finally {
      setResolving(false);
    }
  };

  const handleEscalateComplaint = async (e) => {
    e.preventDefault();
    if (!escalationReason.trim()) {
      alert('Please provide an escalation directive.');
      return;
    }

    try {
      setEscalating(true);
      const res = await staffApi.escalateComplaint(id, {
        escalationReason: escalationReason.trim(),
        escalatedTo: escalatedTo.trim()
      });
      if (res.data?.success) {
        setComplaint(res.data.data);
        setShowEscalateModal(false);
        setEscalationReason('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to escalate complaint.');
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading grievance workbench...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted / Not Found</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <Link to="/staff/complaints" className="gov-btn-primary text-xs">
          Return to Department Inbox
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(complaint.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/staff/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Department Queue</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchComplaint}
            className="gov-btn-secondary text-xs py-1.5 px-3"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Grievance Reference:
              </span>
              <span className="text-xl font-mono font-extrabold text-blue-950">
                {complaint.complaintId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Department: <strong className="text-slate-900 font-semibold">{complaint.department?.name}</strong> • Category: <strong className="text-slate-900">{complaint.category}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={complaint.urgency} />
            <StatusBadge status={complaint.status} size="lg" />
          </div>
        </div>

        {/* Quick Action Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-600 mr-1">Quick Action:</span>
          
          {complaint.status === 'Submitted' && (
            <button
              onClick={() => handleStatusChange('Accepted')}
              disabled={updatingStatus}
              className="gov-btn-primary text-xs py-1.5 px-3"
            >
              Accept Grievance
            </button>
          )}

          {['Submitted', 'Under Review', 'Accepted'].includes(complaint.status) && (
            <button
              onClick={() => handleStatusChange('In Progress')}
              disabled={updatingStatus}
              className="gov-btn-primary bg-sky-700 hover:bg-sky-800 text-xs py-1.5 px-3"
            >
              Mark In Progress
            </button>
          )}

          {!['Resolved', 'Closed'].includes(complaint.status) && (
            <button
              onClick={() => setShowResolveForm(true)}
              className="gov-btn-success text-xs py-1.5 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}

          {complaint.status !== 'Escalated' && (
            <button
              onClick={() => setShowEscalateModal(true)}
              className="gov-btn-secondary text-purple-700 border-purple-200 hover:bg-purple-50 text-xs py-1.5 px-3"
            >
              <Flame className="w-3.5 h-3.5 text-purple-600" />
              <span>Escalate</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Workbench Left + Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Statement, Technical AI Preview, Investigation Log */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Structured Grievance Problem Statement */}
          <div className="gov-card p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Citizen Problem Description
            </h2>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {complaint.generatedProblemStatement || complaint.aiGeneratedDescription || complaint.description}
              </p>
            </div>
            {complaint.description && (
              <p className="text-[11px] text-slate-500">
                Original text: "{complaint.description}"
              </p>
            )}
          </div>

          {/* Citizen Evidence Attachments */}
          <div className="gov-card p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Citizen Uploaded Evidence
            </h2>
            {complaint.attachments?.images && complaint.attachments.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.attachments.images.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block"
                  >
                    <img
                      src={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                      alt="Citizen evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-lg text-center">
                No photographic evidence uploaded by citizen.
              </p>
            )}
          </div>

          {/* Expandable Technical AI Analysis Section */}
          <div className="gov-card p-5 space-y-3 border-blue-200 bg-blue-50/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Technical AI Triaging Analysis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiDetails(!showAiDetails)}
                className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>{showAiDetails ? 'Collapse Details' : 'Expand Parameters'}</span>
                {showAiDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAiDetails && (
              <div className="pt-3 border-t border-blue-200/80 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Predicted Category:</span>
                    <strong className="text-slate-900">{complaint.aiAnalysis?.predictedCategory || complaint.category}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Assigned Urgency:</span>
                    <strong className="text-slate-900">{complaint.aiAnalysis?.predictedUrgency || complaint.urgency}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Confidence Score:</span>
                    <strong className="text-slate-900 font-mono">
                      {Math.round((complaint.aiAnalysis?.confidence || 0.92) * 100)}%
                    </strong>
                  </div>
                </div>

                {complaint.aiAnalysis?.detectedObjects && complaint.aiAnalysis.detectedObjects.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Detected Objects (Computer Vision):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {complaint.aiAnalysis.detectedObjects.map((obj, oIdx) => (
                        <span key={oIdx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-medium font-mono">
                          {obj.label} ({Math.round(obj.confidence * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Investigation Note / Progress Log */}
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Log Investigation Progress / Field Notes
            </h3>

            <form onSubmit={handleAddProgress} className="space-y-3">
              <textarea
                rows={3}
                required
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Log field inspection results, materials ordered, repair squad dispatched, etc..."
                className="gov-input text-xs leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <label className="gov-btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Attach Field Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setProgressMediaFiles(Array.from(e.target.files))}
                    />
                  </label>
                  {progressMediaFiles.length > 0 && (
                    <span className="text-[11px] text-slate-600 font-medium">
                      {progressMediaFiles.length} file(s) selected
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={addingProgress}
                  className="gov-btn-primary text-xs py-1.5 px-4"
                >
                  {addingProgress ? 'Logging Update...' : 'Submit Progress Update'}
                </button>
              </div>
            </form>
          </div>

          {/* Full Chronological History */}
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Audit & Department Action History
            </h3>
            <Timeline updates={complaint.progressUpdates} />
          </div>

        </div>

        {/* Right Col: Metadata & Location */}
        <div className="space-y-6">
          
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Grievance Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Location Address</span>
                <p className="font-semibold text-slate-900 flex items-start gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span>{complaint.location?.address}</span>
                </p>
                {complaint.location?.latitude && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Coords: {complaint.location.latitude.toFixed(4)}° N, {complaint.location.longitude.toFixed(4)}° E
                  </p>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Submitted Timestamp</span>
                <p className="font-medium text-slate-800 font-mono">{formattedDate}</p>
              </div>

              {complaint.citizenDetails?.name && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Complainant Citizen</span>
                  <p className="font-medium text-slate-800">{complaint.citizenDetails.name}</p>
                  {complaint.citizenDetails.phone && (
                    <p className="text-[11px] text-slate-500">{complaint.citizenDetails.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Resolution Submission Modal */}
      {showResolveForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Mark Grievance as Resolved
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe the completed remedial work. Upload photographic completion proof for citizen verification.
            </p>

            <form onSubmit={handleResolveComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Completion Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="E.g., Pothole filled with cold asphalt concrete mix; water pipeline valve replaced and pressure tested..."
                  className="gov-input text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Completion Evidence Photo(s)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setResolutionFiles(Array.from(e.target.files))}
                  className="gov-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="gov-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="gov-btn-success text-xs"
                >
                  {resolving ? 'Recording Resolution...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-purple-700">
              <Flame className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Escalate Grievance to Senior Cell
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Escalate to higher engineering or administrative directorate for emergency intervention.
            </p>

            <form onSubmit={handleEscalateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escalation Target Authority
                </label>
                <input
                  type="text"
                  value={escalatedTo}
                  onChange={(e) => setEscalatedTo(e.target.value)}
                  className="gov-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Directive & Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="E.g., Requires capital budget approval or specialized heavy machinery..."
                  className="gov-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="gov-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={escalating}
                  className="gov-btn-primary bg-purple-700 hover:bg-purple-800 text-xs"
                >
                  {escalating ? 'Escalating...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
