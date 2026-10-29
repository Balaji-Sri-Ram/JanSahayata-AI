import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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

  // Keep category synchronized when department changes
  useEffect(() => {
    const availableCategories = CATEGORIES_BY_DEPT[departmentId] || CATEGORIES_BY_DEPT.railway;
    if (!availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [departmentId]);

  // Handle Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocating(false);
        setLocationSuccess(true);
        if (!address) {
          setAddress(`Geo: ${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E (GPS Verified)`);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocating(false);
        alert('Could not retrieve GPS coordinates. Please enter location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
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
      alert('Please describe the problem in more detail (at least 15 characters) before proceeding.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextToStep3 = async () => {
    if (!address.trim() || address.trim().length < 6) {
      alert('Please provide a complete location or address where the issue is present (at least 6 characters).');
      return;
    }

    if (citizenEmail && citizenEmail.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(citizenEmail.trim())) {
        alert('Please enter a valid contact email address.');
        return;
      }
    }

    if (citizenPhone && citizenPhone.trim()) {
      const digits = citizenPhone.replace(/\D/g, '').replace(/^(91|0)/, '');
      if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
        alert('Please enter a valid 10-digit Indian mobile number for citizen contact.');
        return;
      }
    }

    setCurrentStep(3);
    await prepareAiReview();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userConfirmedReview) {
      alert('Please review and confirm the statement before submitting.');
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
                Citizen Contact Information (Optional for SMS / Email tracking)
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
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="Phone Number (+91...)"
                  className="gov-input text-xs"
                />
                <input
                  type="email"
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
                  checked={userConfirmedReview}
                  onChange={(e) => setUserConfirmedReview(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
        <div className="gov-card p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Grievance Registered Successfully
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Your grievance has been ingested and dispatched to the designated department for investigation.
            </p>

            {/* Complaint ID Box */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 mb-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                Your Unique Complaint Tracking ID
              </span>
              <span className="text-2xl font-mono font-extrabold text-blue-900 tracking-wider">
                {submittedComplaint.complaintId}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Assigned Department: <strong className="text-slate-900">{submittedComplaint.department?.name}</strong>. Please save this Complaint ID to track status updates, receive department progress notes, and verify resolution.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/complaint/${submittedComplaint.complaintId}`}
                className="gov-btn-primary text-xs py-2.5 px-4"
              >
                Track This Complaint Now
              </Link>
              <Link
                to="/my-complaints"
                className="gov-btn-secondary text-xs py-2.5 px-4"
              >
                View My Complaints
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
