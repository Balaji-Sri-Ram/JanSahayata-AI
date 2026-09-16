import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  FileText, 
  Shield, 
  Train, 
  Edit3, 
  CheckSquare, 
  Square,
  Navigation,
  Loader2,
  Eye,
  ArrowRight,
  Info
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import AudioRecorder from '../../components/AudioRecorder';
import ImageUploadPreview from '../../components/ImageUploadPreview';
import UrgencyBadge from '../../components/UrgencyBadge';

const CATEGORIES = [
  'Pothole / Road Damage',
  'Garbage / Waste',
  'Water Leakage',
  'Broken Streetlight',
  'Drainage Problem',
  'Railway Infrastructure Damage',
  'Station Cleanliness',
  'Track / Railway Area Issue',
  'Passenger Facility Problem',
  'Other'
];

const URGENCIES = ['Low', 'Medium', 'High', 'Critical'];

export default function ReportProblem() {
  const navigate = useNavigate();

  // Form states
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole / Road Damage');
  const [urgency, setUrgency] = useState('Medium');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Attachments
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // AI preview states
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isEditingAiText, setIsEditingAiText] = useState(false);

  // Confirmation & Submission
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Auto trigger AI preview generation when description or category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (description.trim().length > 5) {
        fetchAiPreview();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [description, category, address]);

  const fetchAiPreview = async () => {
    try {
      setAiPreviewLoading(true);
      const res = await citizenApi.previewAiAnalysis({
        description,
        category,
        location: address
      });

      if (res.data?.success) {
        const data = res.data.data;
        if (!isEditingAiText) {
          setAiGeneratedDescription(data.aiGeneratedDescription || '');
        }
        setAiAnalysis(data);
        if (data.predictedUrgency && !urgency) {
          setUrgency(data.predictedUrgency);
        }
      }
    } catch (err) {
      console.warn('AI preview fetch warning:', err);
    } finally {
      setAiPreviewLoading(false);
    }
  };

  // Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationSuccess(true);
        setLocating(false);

        // If address is empty, provide a descriptive geocode placeholder
        if (!address) {
          setAddress(`Geo-tagged: Platform & Track Zone (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocating(false);
        alert('Could not retrieve location. Please type the station or platform name manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) return;
    if (!description.trim()) {
      setSubmitError('Please provide a description of the problem.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('aiGeneratedDescription', aiGeneratedDescription || description);
      formData.append('category', category);
      formData.append('departmentId', 'railway');
      formData.append('urgency', urgency);
      formData.append('locationAddress', address || 'Railway Station Premises');
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      formData.append('citizenId', 'CITIZEN-DEMO-001');

      // Append files
      images.forEach((imgFile) => {
        formData.append('images', imgFile);
      });

      if (video) {
        formData.append('video', video);
      }

      if (audioFile) {
        formData.append('audio', audioFile);
      }

      const res = await citizenApi.createComplaint(formData);
      if (res.data?.success) {
        setSubmittedComplaint(res.data.data);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit complaint. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS PAGE
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            Registration Complete
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mb-2">
            Complaint Submitted Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Your grievance has been auto-analyzed and assigned to the Railway Department Grievance Cell.
          </p>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Complaint ID</span>
              <span className="font-mono text-sm font-bold text-railway-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {submittedComplaint.complaintId}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Assigned Department</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-railway-600" />
                {submittedComplaint.department?.name || 'Railway Department'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Problem Category</span>
              <span className="text-xs font-medium text-slate-800">
                {submittedComplaint.category}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {submittedComplaint.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Assessed Urgency</span>
              <UrgencyBadge urgency={submittedComplaint.urgency} size="sm" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/complaint/${submittedComplaint.complaintId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-railway-600 hover:bg-railway-700 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>View Complaint & Timeline</span>
            </Link>

            <Link
              to="/my-complaints"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all"
            >
              <span>Track All Complaints</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setSubmittedComplaint(null);
                setDescription('');
                setAiGeneratedDescription('');
                setImages([]);
                setVideo(null);
                setAudioFile(null);
                setConfirmed(false);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all"
            >
              <span>Report Another Problem</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <FileText className="w-7 h-7 text-railway-600" />
            Report a Railway Problem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit your grievance with text, photos, video, or voice recording for automated AI triaging.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
          <Shield className="w-3.5 h-3.5 text-railway-600" />
          <span>Department: <strong>Railway</strong></span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Description & Voice */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-railway-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
              Problem Description & Multi-Modal Input
            </h2>
            <span className="text-[11px] text-slate-400">* Required</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe your problem in detail
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='e.g., "There is a large pothole near platform 2 close to the tea stall, and it is dangerous for passengers carrying heavy luggage."'
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-railway-500 focus:ring-2 focus:ring-railway-100 transition-all outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Be as specific as possible regarding the location and hazard nature.
            </p>
          </div>

          {/* Voice Recording Section */}
          <AudioRecorder
            onAudioReady={(file) => setAudioFile(file)}
            onAudioRemoved={() => setAudioFile(null)}
          />

          {/* Image & Video Upload Section */}
          <ImageUploadPreview
            onImagesSelected={(imgs) => setImages(imgs)}
            onVideoSelected={(vid) => setVideo(vid)}
            showYoloPreview={images.length > 0}
            mockAiLabel={aiAnalysis?.detectedObjects?.[0]?.label || 'Damaged Pavement / Pothole'}
            mockConfidence={aiAnalysis?.confidence || 0.94}
          />
        </div>

        {/* Step 2: Categorization, Urgency & Location */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-railway-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
            Category, Urgency & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Problem Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-800 bg-white focus:border-railway-500 focus:ring-2 focus:ring-railway-100 outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {URGENCIES.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold border text-center transition-all ${
                      urgency === lvl
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location details */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Location & Station Details
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-railway-600 hover:text-railway-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200"
              >
                {locating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" />
                    <span>Use My Current Location</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Secunderabad Junction, Platform 2 near Coach S4 position"
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:border-railway-500 focus:ring-2 focus:ring-railway-100 outline-hidden"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {locationSuccess && latitude && longitude && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GPS Coordinates Captured: {latitude.toFixed(5)}°, {longitude.toFixed(5)}°</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: AI Preview Section (AI-Assisted Complaint Processing) */}
        <div className="bg-gradient-to-br from-slate-900 to-railway-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  AI-Assisted Complaint Processing
                </h3>
                <p className="text-[11px] text-slate-400">
                  Automated natural language formatting & multi-department routing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                AI Preview
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300">
                Demo Mode
              </span>
            </div>
          </div>

          {/* AI Attributes Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Problem Category
              </span>
              <span className="font-semibold text-sky-200">
                {category}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Detected Department
              </span>
              <span className="font-semibold text-emerald-300 flex items-center gap-1">
                <Train className="w-3.5 h-3.5" />
                Railway Department
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Urgency Rating
              </span>
              <span className="font-semibold text-amber-300">
                {urgency} Priority
              </span>
            </div>
          </div>

          {/* AI Generated Problem Statement */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>AI-Generated Problem Statement (Editable by Citizen)</span>
              </label>
              {aiPreviewLoading && (
                <span className="text-[10px] text-sky-300 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Synthesizing...
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={aiGeneratedDescription || (description ? `Formal Grievance Report: A citizen has reported an issue concerning "${category}". Incident details indicate: "${description}". Immediate technical assessment and departmental remediation are requested.` : '')}
              onChange={(e) => {
                setIsEditingAiText(true);
                setAiGeneratedDescription(e.target.value);
              }}
              placeholder="AI generated formal problem statement will appear here based on your description..."
              className="w-full rounded-lg bg-black/40 border border-white/20 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden leading-relaxed"
            />
            <p className="text-[10px] text-slate-400">
              💡 You may edit this statement directly to ensure complete accuracy before sending to Railway officers.
            </p>
          </div>
        </div>

        {/* Step 4: Citizen Confirmation & Submit */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-railway-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
            Review Your Complaint
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Category</span>
                <span className="font-semibold text-slate-800">{category}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Urgency</span>
                <UrgencyBadge urgency={urgency} size="sm" />
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block font-medium">Location</span>
                <span className="text-slate-800">{address || 'Railway Station Premises'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block font-medium">Attachments</span>
                <span className="text-slate-700">
                  {images.length} Image(s) • {video ? '1 Video attached' : 'No video'} • {audioFile ? '1 Voice note attached' : 'No voice note'}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-railway-600 focus:ring-railway-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 select-none">
              <strong>I confirm that the information provided is accurate</strong> and relates to genuine railway infrastructure or passenger safety concerns.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!confirmed || submitting || !description.trim()}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              confirmed && description.trim() && !submitting
                ? 'bg-gradient-to-r from-railway-600 to-sky-600 hover:from-railway-500 hover:to-sky-500 text-white hover:scale-[1.01] active:scale-[0.99] shadow-sky-900/20 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Registering Complaint...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint to Railway Department</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
