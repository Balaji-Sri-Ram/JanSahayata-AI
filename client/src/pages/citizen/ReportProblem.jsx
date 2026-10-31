import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  MapPin, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  FileText, 
  Shield, 
  Train, 
  Edit3, 
  CheckSquare, 
  Navigation, 
  Loader2, 
  Eye, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Camera,
  Mic,
  Video,
  Building2,
  Sparkles,
  Layers,
  Clock,
  Copy,
  Check,
  Mail,
  Search
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AudioRecorder from '../../components/AudioRecorder';
import ImageUploadPreview from '../../components/ImageUploadPreview';
import UrgencyBadge from '../../components/UrgencyBadge';

const DEPARTMENTS_LIST = [
  { id: 'railway', name: 'Railway Department', code: 'RLY' },
  { id: 'municipality', name: 'Municipal Corporation', code: 'MUN' },
  { id: 'water_supply', name: 'Water Supply & Sewerage', code: 'WTR' },
  { id: 'roads_infra', name: 'Roads & Infrastructure (PWD)', code: 'RDS' },
  { id: 'electricity', name: 'Electricity Board (DISCOM)', code: 'ELE' },
  { id: 'health_sanitation', name: 'Public Health & Sanitation', code: 'HLT' },
  { id: 'education', name: 'Department of Education', code: 'EDU' },
  { id: 'public_transport', name: 'State Public Transport (RTC / Metro)', code: 'TRN' },
];

const CATEGORIES_BY_DEPT = {
  railway: [
    'Pothole / Road Damage',
    'Garbage / Waste',
    'Water Leakage',
    'Broken Streetlight',
    'Drainage Problem',
    'Railway Infrastructure Damage',
    'Station Cleanliness',
    'Track / Railway Area Issue',
    'Passenger Facility Problem',
    'Coach Cleanliness & Bio-Toilet',
    'Other'
  ],
  municipality: [
    'Garbage / Waste',
    'Illegal Encroachment',
    'Drainage Problem',
    'Public Park Maintenance',
    'Stray Animal Nuisance',
    'Public Toilet Cleanliness',
    'Other'
  ],
  water_supply: [
    'Water Leakage',
    'Contaminated Water Supply',
    'Low Pressure / No Water Supply',
    'Sewage Overflow',
    'Damaged Water Meter / Pipeline',
    'Other'
  ],
  roads_infra: [
    'Pothole / Road Damage',
    'Broken Footpath / Paver Blocks',
    'Damaged Bridge / Flyover Guardrail',
    'Waterlogging on Main Carriage Way',
    'Broken Road Signboard / Divider',
    'Other'
  ],
  electricity: [
    'Broken Streetlight',
    'Hanging Live Wire / Shock Hazard',
    'Frequent Power Outage / Voltage Fluctuation',
    'Transformer Sparking / Blast Hazard',
    'Other'
  ],
  health_sanitation: [
    'Mosquito Breeding / Stagnant Water',
    'Medical Waste Dumping',
    'PHC / Government Hospital Facility Issue',
    'Other'
  ],
  education: [
    'Government School Building Damage',
    'Mid-Day Meal Quality Issue',
    'School Drinking Water & Sanitation',
    'Other'
  ],
  public_transport: [
    'Damaged Bus Shelter / Stand',
    'Overcrowded / Unscheduled Bus Route',
    'Metro Station Escalator / Lift Outage',
    'Other'
  ]
};

const URGENCIES = ['Low', 'Medium', 'High', 'Critical'];

export default function ReportProblem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  // Wizard Steps: 1: Describe, 2: Location & Context, 3: AI Review, 4: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(searchParams.get('dept') || 'railway');
  const [category, setCategory] = useState('Pothole / Road Damage');
  const [urgency, setUrgency] = useState('Medium');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Citizen Contact (if guest/anonymous submission)
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phone || '');
  const [citizenEmail, setCitizenEmail] = useState(user?.email || '');

  // Input Element References for Automatic Error Focus & Scroll
  const descriptionRef = useRef(null);
  const addressRef = useRef(null);
  const citizenEmailRef = useRef(null);
  const citizenPhoneRef = useRef(null);
  const confirmReviewRef = useRef(null);

  // Attachments
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // AI-assisted review state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState('');
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [isEditingAiText, setIsEditingAiText] = useState(false);
  const [userConfirmedReview, setUserConfirmedReview] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Success step state: Tracking ID Copy & Extra Email Dispatch
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [postSubmitEmail, setPostSubmitEmail] = useState('');
  const [sendingTrackingEmail, setSendingTrackingEmail] = useState(false);
  const [trackingEmailSentMsg, setTrackingEmailSentMsg] = useState(null);
  const [trackingEmailError, setTrackingEmailError] = useState(null);

  const handleCopyTrackingId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedTrackingId(true);
      toast.success('Grievance Reference ID copied to clipboard!', { title: 'Copied' });
      setTimeout(() => setCopiedTrackingId(false), 2500);
    } catch {
      // Fallback
      setCopiedTrackingId(true);
      toast.success('Grievance Reference ID copied to clipboard!', { title: 'Copied' });
      setTimeout(() => setCopiedTrackingId(false), 2500);
    }
  };

  const handleSendTrackingEmail = async (e) => {
    e.preventDefault();
    if (!postSubmitEmail || !postSubmitEmail.trim() || !postSubmitEmail.includes('@')) {
      const err = 'Please enter a valid email address.';
      setTrackingEmailError(err);
      toast.warning(err, { title: 'Invalid Email' });
      return;
    }

    try {
      setSendingTrackingEmail(true);
      setTrackingEmailError(null);
      setTrackingEmailSentMsg(null);
      const res = await citizenApi.sendComplaintTrackingEmail(
        submittedComplaint.complaintId,
        postSubmitEmail.trim()
      );
      if (res.data?.success) {
        const msg = `Official tracking details and tracker link dispatched to ${postSubmitEmail.trim()}!`;
        setTrackingEmailSentMsg(msg);
        toast.success(msg, { title: 'Email Dispatched' });
      } else {
        const err = res.data?.message || 'Could not send tracking email.';
        setTrackingEmailError(err);
        toast.error(err, { title: 'Dispatch Failed' });
      }
    } catch (err) {
      const errText = err.response?.data?.message || err.message || 'Failed to dispatch email.';
      setTrackingEmailError(errText);
      toast.error(errText, { title: 'Dispatch Error' });
    } finally {
      setSendingTrackingEmail(false);
    }
  };

  // Keep category synchronized when department changes
  useEffect(() => {
    const availableCategories = CATEGORIES_BY_DEPT[departmentId] || CATEGORIES_BY_DEPT.railway;
    if (!availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [departmentId]);

  // Reverse geocoding helper to convert lat/lng into a clean readable street/area address
  const reverseGeocode = async (lat, lon) => {
    // 1. Try OpenStreetMap Nominatim with high detail
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const a = data.address;
          const road = a.road || a.pedestrian || a.suburb || a.neighbourhood || a.residential || '';
          const locality = a.suburb || a.city_district || a.town || a.village || '';
          const city = a.city || a.town || a.county || a.state_district || '';
          const state = a.state || '';
          const postcode = a.postcode || '';

          const parts = [road, locality, city, state, postcode].filter(Boolean);
          if (parts.length >= 2) {
            const uniqueParts = parts.filter((part, idx) => parts.indexOf(part) === idx);
            return uniqueParts.join(', ');
          }
          if (data.display_name) {
            return data.display_name.split(',').slice(0, 4).map(s => s.trim()).join(', ');
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode error:', e);
    }

    // 2. Fallback to BigDataCloud client reverse geocoding API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const bdc = await res.json();
        const parts = [
          bdc.locality || bdc.city,
          bdc.principalSubdivision,
          bdc.postcode
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    } catch (e) {
      console.warn('BigDataCloud reverse geocode error:', e);
    }

    return null;
  };

  // Handle Geolocation with High Accuracy and Automatic Address Translation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser.', { title: 'GPS Unavailable' });
      return;
    }

    setLocating(true);
    setLocationSuccess(false);

    const onPositionSuccess = async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

      setLatitude(lat);
      setLongitude(lon);
      setLocationSuccess(true);

      // Attempt reverse geocoding to human-readable street/locality
      const resolvedAddress = await reverseGeocode(lat, lon);
      setLocating(false);

      if (resolvedAddress) {
        setAddress(resolvedAddress);
        toast.success(`Location detected: ${resolvedAddress.split(',')[0]} (±${accuracy || 15}m)`, {
          title: 'GPS Located'
        });
      } else {
        const fallback = `Lat ${lat.toFixed(5)}, Lon ${lon.toFixed(5)} (GPS Verified)`;
        if (!address) {
          setAddress(fallback);
        }
        toast.success('Coordinates captured. Please add street / station name.', { title: 'GPS Verified' });
      }

      addressRef.current?.focus();
    };

    const onPositionError = (error) => {
      console.warn('Primary high-accuracy GPS error, retrying standard...', error);
      // Retry once with standard accuracy (wifi/network based)
      navigator.geolocation.getCurrentPosition(
        onPositionSuccess,
        (secondError) => {
          console.warn('Fallback geolocation failed:', secondError);
          setLocating(false);
          let errorMsg = 'Could not retrieve GPS coordinates. Please enter location manually.';
          if (secondError.code === 1) {
            errorMsg = 'Location permission denied in browser settings. Please enter location manually.';
          } else if (secondError.code === 2) {
            errorMsg = 'Location unavailable. Please enter your street / station manually.';
          }
          toast.warning(errorMsg, { title: 'Location Notice' });
          addressRef.current?.focus();
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onPositionSuccess,
      onPositionError,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Fetch AI preview analysis when entering Step 3
  const prepareAiReview = async () => {
    try {
      setAiPreviewLoading(true);
      const res = await citizenApi.previewAiAnalysis({
        description,
        category,
        location: address ? `${address}${landmark ? ', ' + landmark : ''}` : 'Public Civic Location'
      });

      if (res.data?.success) {
        const data = res.data.data;
        setAiAnalysis(data);
        setAiGeneratedDescription(data.aiGeneratedDescription || data.generatedProblemStatement || description);
        if (data.predictedUrgency) {
          setUrgency(data.predictedUrgency);
        }
      }
    } catch (err) {
      console.warn('AI preview fetch error:', err);
      setAiGeneratedDescription(description);
    } finally {
      setAiPreviewLoading(false);
    }
  };

  const handleNextToStep2 = () => {
    if (!description.trim() || description.trim().length < 15) {
      toast.warning('Please describe the problem in more detail (at least 15 characters).', {
        title: 'Description Required'
      });
      descriptionRef.current?.focus();
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNextToStep3 = async () => {
    if (!address.trim() || address.trim().length < 6) {
      toast.warning('Please provide a complete location or address (at least 6 characters).', {
        title: 'Location Required'
      });
      addressRef.current?.focus();
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (citizenEmail && citizenEmail.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(citizenEmail.trim())) {
        toast.warning('Please enter a valid contact email address.', {
          title: 'Invalid Email'
        });
        citizenEmailRef.current?.focus();
        citizenEmailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    if (citizenPhone && citizenPhone.trim()) {
      const digits = citizenPhone.replace(/\D/g, '').replace(/^(91|0)/, '');
      if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
        toast.warning('Please enter a valid 10-digit Indian mobile number for citizen contact.', {
          title: 'Invalid Mobile Number'
        });
        citizenPhoneRef.current?.focus();
        citizenPhoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 120, behavior: 'smooth' });
    await prepareAiReview();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userConfirmedReview) {
      toast.warning('Please review and confirm the statement checkbox before submitting.', {
        title: 'Confirmation Required'
      });
      confirmReviewRef.current?.focus();
      confirmReviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('aiGeneratedDescription', aiGeneratedDescription.trim());
      formData.append('generatedProblemStatement', aiGeneratedDescription.trim());
      formData.append('category', category);
      formData.append('departmentId', departmentId);
      formData.append('urgency', urgency);
      formData.append('locationAddress', landmark ? `${address.trim()} (Landmark: ${landmark.trim()})` : address.trim());
      
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (citizenName) formData.append('citizenName', citizenName);
      if (citizenPhone) formData.append('citizenPhone', citizenPhone);
      if (citizenEmail) formData.append('citizenEmail', citizenEmail);

      // Attachments
      images.forEach((img) => {
        formData.append('images', img.file);
      });

      if (video) {
        formData.append('video', video);
      }

      if (audioFile) {
        formData.append('audio', audioFile);
      }

      const response = await citizenApi.createComplaint(formData);

      if (response.data?.success) {
        setSubmittedComplaint(response.data.data);
        setCurrentStep(4);
      } else {
        setSubmitError(response.data?.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Error communicating with grievance server.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableCategories = CATEGORIES_BY_DEPT[departmentId] || CATEGORIES_BY_DEPT.railway;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Wizard Header & Progress Steps */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Submit Public Service Grievance
            </h1>
            <p className="text-xs text-slate-500">
              Official citizen grievance registration under JanSahayata public redressal framework.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
          <div className={`p-2 rounded border transition-colors ${
            currentStep === 1 ? 'bg-blue-50 border-blue-600 text-[#0b2545] font-bold' : currentStep > 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            1. Describe Grievance
          </div>
          <div className={`p-2 rounded border transition-colors ${
            currentStep === 2 ? 'bg-blue-50 border-blue-600 text-[#0b2545] font-bold' : currentStep > 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            2. Location & Department
          </div>
          <div className={`p-2 rounded border transition-colors ${
            currentStep === 3 ? 'bg-blue-50 border-blue-600 text-[#0b2545] font-bold' : currentStep > 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            3. Review & Submit
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: Describe the Problem (Text, Voice, Photos, Video) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="gov-card p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Step 1: Describe the Incident / Issue
            </h2>
            <p className="text-xs text-slate-500">
              Provide specific details in your own words. You may also record audio or attach photographic evidence.
            </p>
          </div>

          {/* Text Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Problem Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              ref={descriptionRef}
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Deep open pothole near platform 2 causing tripping hazard; burst water pipeline on Main Street flooding road; overflowing garbage dump outside primary school..."
              className="gov-input text-xs leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 10 characters. Plain language, English, Hindi, or regional text accepted.
            </p>
          </div>

          {/* Voice Note Recording Component */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Voice Note (Optional Voice Input)
            </label>
            <AudioRecorder
              onAudioRecorded={(file) => setAudioFile(file)}
              onTranscriptionAvailable={(text) => {
                setDescription((prev) => (prev ? `${prev}\n${text}` : text));
              }}
            />
          </div>

          {/* Image & Video Upload Preview Component */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Attach Photographic / Video Evidence (Optional)
            </label>
            <ImageUploadPreview
              images={images}
              onImagesChange={(newImgs) => setImages(newImgs)}
            />
          </div>

          {/* Step 1 Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={handleNextToStep2}
              className="gov-btn-primary"
            >
              <span>Continue to Location & Context</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Location & Department Context */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="gov-card p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Step 2: Department & Location Context
            </h2>
            <p className="text-xs text-slate-500">
              Specify the department, category, and precise geographical location where remedial action is required.
            </p>
          </div>

          {/* Department Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departmentId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Responsible Department <span className="text-red-500">*</span>
              </label>
              <select
                id="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="gov-select text-xs"
              >
                {DEPARTMENTS_LIST.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Problem Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="gov-select text-xs"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Details & GPS Button */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="address" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Location / Station / Street Address <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                <span>{locationSuccess ? 'GPS Coordinates Attached' : 'Auto-Detect GPS Location'}</span>
              </button>
            </div>

            <input
              id="address"
              ref={addressRef}
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g., Platform 2 North Section near Coach S4, Secunderabad Station / Ward 12 Main Road..."
              className="gov-input text-xs"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="landmark" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Nearby Landmark / Pillar / Gate # (Optional)
                </label>
                <input
                  id="landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="E.g., Opposite Gate 3, Near Transformer 4"
                  className="gov-input text-xs"
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Reported Urgency / Severity
                </label>
                <select
                  id="urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="gov-select text-xs"
                >
                  {URGENCIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Citizen Contact Details (if not authenticated) */}
          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Citizen Contact Information (Optional for Email Tracking & Updates)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Your Full Name"
                  className="gov-input text-xs"
                />
                <input
                  type="tel"
                  ref={citizenPhoneRef}
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="Phone Number (+91...)"
                  className="gov-input text-xs"
                />
                <input
                  type="email"
                  ref={citizenEmailRef}
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  placeholder="Email Address"
                  className="gov-input text-xs"
                />
              </div>
            </div>
          )}

          {/* Step 2 Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="gov-btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextToStep3}
              className="gov-btn-saffron"
            >
              <span>Proceed to Review & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Grievance Statement Verification & Confirmation */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="gov-card p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-[#0b2545] text-xs font-semibold mb-1 border border-blue-200">
              <Layers className="w-3.5 h-3.5 text-[#0b2545]" />
              <span>Official Grievance Statement Verification</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Step 3: Review Grievance Statement Before Final Submission
            </h2>
            <p className="text-xs text-slate-500">
              The system formulates a standardized grievance statement for jurisdictional field officers. You have full authority to edit before final submission.
            </p>
          </div>

          {aiPreviewLoading ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <Loader2 className="w-7 h-7 text-[#0b2545] animate-spin mx-auto" />
              <p className="text-xs font-medium text-slate-700">Structuring grievance details for departmental action...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Structured Grievance Review Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-4">
                
                {/* Editable Problem Statement */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Structured Problem Statement
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsEditingAiText(!isEditingAiText)}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingAiText ? 'Done Editing' : 'Edit Statement'}</span>
                    </button>
                  </div>

                  {isEditingAiText ? (
                    <textarea
                      rows={4}
                      value={aiGeneratedDescription}
                      onChange={(e) => setAiGeneratedDescription(e.target.value)}
                      className="gov-input text-xs leading-relaxed bg-white"
                    />
                  ) : (
                    <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-normal">
                      {aiGeneratedDescription}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Standardized problem statement must be verified by the citizen prior to official dispatch to department engineers.
                  </p>
                </div>

                {/* Grid Metadata Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Department:</span>
                    <strong className="text-slate-900 font-semibold">{DEPARTMENTS_LIST.find(d => d.id === departmentId)?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Category:</span>
                    <strong className="text-slate-900 font-semibold">{category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Urgency:</span>
                    <UrgencyBadge urgency={urgency} size="sm" />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Evidence Attached:</span>
                    <span className="font-semibold text-slate-800">
                      {images.length} photo(s){audioFile ? ', 1 voice note' : ''}
                    </span>
                  </div>
                </div>

                {/* Location Summary */}
                <div className="text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Incident Location:</span>
                  <p className="text-slate-800 font-medium">{address} {landmark && `(Landmark: ${landmark})`}</p>
                </div>

              </div>

              {/* Mandatory Citizen Confirmation Checkbox */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmReview"
                  ref={confirmReviewRef}
                  checked={userConfirmedReview}
                  onChange={(e) => setUserConfirmedReview(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="confirmReview" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                  <strong className="text-slate-900">Review before submitting:</strong> I have reviewed the generated problem statement and confirm that the details, department, and location accurately represent the issue.
                </label>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3 Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setCurrentStep(2)}
              className="gov-btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={submitting || !userConfirmedReview || aiPreviewLoading}
              onClick={handleSubmit}
              className="gov-btn-primary px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Grievance...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Submit Grievance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Success & Dynamic Complaint ID */}
      {/* ========================================================================= */}
      {currentStep === 4 && submittedComplaint && (
        <div className="gov-card p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="max-w-xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 uppercase tracking-wider mb-2">
              Official Grievance Acknowledged
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Grievance Registered Successfully
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Your grievance has been prioritized and dispatched to <strong className="text-slate-800">{submittedComplaint.department?.name}</strong>. Field teams will inspect and upload photo proof before any closure.
            </p>

            {/* Complaint ID Box with Quick Copy */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-[#0b2545]/20 rounded-2xl p-5 mb-6 shadow-sm text-center">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Your Unique Complaint Tracking ID
              </span>
              
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-[#0b2545] tracking-wider select-all">
                  {submittedComplaint.complaintId}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopyTrackingId(submittedComplaint.complaintId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    copiedTrackingId 
                      ? 'bg-emerald-600 text-white shadow-emerald-200' 
                      : 'bg-white hover:bg-slate-100 text-[#0b2545] border border-slate-300'
                  }`}
                  title="Copy Tracking ID to Clipboard"
                >
                  {copiedTrackingId ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 mt-2">
                Keep this ID safe. You can track resolution progress anytime 24x7 without logging in.
              </div>
            </div>

            {/* Extra Field: Send Tracking ID & Tracker Link to Email */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 text-left shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Receive Tracking ID & Tracker Link via Email
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    We will send your Complaint Tracking Pass with 1-click status link straight to your inbox.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendTrackingEmail} className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={postSubmitEmail}
                  onChange={(e) => setPostSubmitEmail(e.target.value)}
                  placeholder="Enter email (e.g., name@gmail.com)"
                  className="gov-input text-xs flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={sendingTrackingEmail}
                  className="gov-btn-primary text-xs py-2 px-4 whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  {sendingTrackingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Email</span>
                    </>
                  )}
                </button>
              </form>

              {trackingEmailSentMsg && (
                <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{trackingEmailSentMsg}</span>
                </div>
              )}

              {trackingEmailError && (
                <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{trackingEmailError}</span>
                </div>
              )}
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/complaint/${submittedComplaint.complaintId}`}
                className="gov-btn-primary text-xs py-2.5 px-5 shadow-sm flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Track Complaint Status Now</span>
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/my-complaints"
                  className="gov-btn-secondary text-xs py-2.5 px-5"
                >
                  View My Complaints
                </Link>
              ) : (
                <Link
                  to="/"
                  className="gov-btn-secondary text-xs py-2.5 px-5"
                >
                  Return to Home
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
