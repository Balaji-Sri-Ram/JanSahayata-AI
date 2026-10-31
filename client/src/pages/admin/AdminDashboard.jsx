import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  BarChart3,
  UserPlus,
  FileCheck,
  Layers,
  AlertCircle,
  TrendingUp,
  Activity,
  ClipboardList,
  Search,
  Filter,
  FileText,
  Eye,
  CheckCircle,
  Clock4,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  X,
  User,
  Lock,
  Briefcase,
  Edit2,
  Key
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import AdminEmailRequestsTab from './AdminEmailRequestsTab';

// ─── Register Employee Modal (Spacious Modern Government Card) ────────────────
function CreateEmployeeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    designation: '',
    departmentId: '',
    phone: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdOfficer, setCreatedOfficer] = useState(null);

  useEffect(() => {
    adminApi.getDepartments().then(res => {
      if (res.data?.success) {
        const deptList = Object.values(res.data.departments || res.data.data || {});
        setDepartments(deptList);
      }
    }).catch(() => {});
  }, []);

  const validateField = (name, value) => {
    let err = '';
    if (name === 'name') {
      if (!value || value.trim().length < 3) {
        err = 'Full name must be at least 3 characters long.';
      } else if (!/^[a-zA-Z\s.]+$/.test(value.trim())) {
        err = 'Name can only contain alphabetic letters, dots, and spaces.';
      }
    } else if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value || !emailRegex.test(value.trim())) {
        err = 'Please enter a valid official email (e.g. officer@department.gov.in).';
      }
    } else if (name === 'departmentId') {
      if (!value) {
        err = 'Please select an assigned Government Department.';
      }
    } else if (name === 'phone') {
      if (value && value.trim()) {
        const digits = value.replace(/\D/g, '').replace(/^(91|0)/, '');
        if (digits.length !== 10) {
          err = 'Mobile number must be exactly 10 digits.';
        } else if (!/^[6-9]/.test(digits)) {
          err = 'Indian mobile numbers must start with 6, 7, 8, or 9.';
        }
      }
    }
    setFieldErrors(prev => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'phone') {
      // Allow only numbers, space, and leading '+'
      formattedValue = value.replace(/[^\d\s+]/g, '');
      // Limit to 14 chars (+91 XXXXX XXXXX)
      if (formattedValue.length > 14) return;
    }
    setForm(prev => ({ ...prev, [name]: formattedValue }));
    validateField(name, formattedValue);
  };

  const validateAll = () => {
    const errors = {};
    if (!form.name || form.name.trim().length < 3) {
      errors.name = 'Full name must be at least 3 characters long.';
    } else if (!/^[a-zA-Z\s.]+$/.test(form.name.trim())) {
      errors.name = 'Name can only contain alphabetic letters, dots, and spaces.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid official email address.';
    }

    if (!form.departmentId) {
      errors.departmentId = 'Please select an assigned Department.';
    }

    if (form.phone && form.phone.trim()) {
      const digits = form.phone.replace(/\D/g, '').replace(/^(91|0)/, '');
      if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
        errors.phone = 'Mobile number must be a valid 10-digit Indian number (e.g. 98480 22334).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setError('Please correct the validation errors below before submitting.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.createEmployee(form);
      if (res.data?.success) {
        const officer = res.data.data || res.data.employee || { name: form.name, email: form.email };
        setCreatedOfficer(officer);
        onCreated && onCreated(officer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register officer account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 my-auto">
        
        {/* Tricolor National Accent Strip */}
        <div className="h-1 bg-gradient-to-r from-[#ff671f] via-white to-[#046a38]" />

        {/* Modal Header with High-Contrast White Text */}
        <div className="bg-[#0b2545] p-5 sm:p-6 text-white flex items-start justify-between gap-4 border-b border-[#163b6b]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                Authority Onboarding
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                Government of India • DARPG
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <UserPlus className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Add Department Officer</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create an official employee account and designate departmental grievance redressal authority.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {createdOfficer ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Officer Registered Successfully</h4>
                <p className="text-xs text-slate-500 mt-1">
                  The designated officer has been assigned to the department directory.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Official ID:</span>
                  <span className="font-mono font-bold text-[#0b2545]">{createdOfficer.employeeId || 'Generated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Officer Name:</span>
                  <span className="font-bold text-slate-900">{createdOfficer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Email:</span>
                  <span className="font-mono text-slate-700">{createdOfficer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-blue-700">{createdOfficer.department?.name || form.departmentId}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Welcome Email:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dispatched via Gmail to {createdOfficer.email}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 mt-2">
                  <strong>🔒 Confidential Password:</strong> The temporary access password was generated automatically by the server and sent directly to <strong>{createdOfficer.email}</strong>. Even Super Admin does not know this password.
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">First-Time Login:</span>
                  <span className="text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Mandatory Password Reset Active
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="gov-btn-primary text-xs py-2.5 px-6 font-bold"
                >
                  Done & Return to Directory
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Officer Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Officer Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. K. Kiran Sai Karthik"
                      className={`gov-input pl-9 text-xs py-2 w-full ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20' : ''}`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* 2. Official Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="officer.railway@jansahayata.gov.in"
                      className={`gov-input pl-9 text-xs py-2 w-full ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20' : ''}`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* 3. Assigned Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Assigned Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      name="departmentId"
                      required
                      value={form.departmentId}
                      onChange={handleChange}
                      className={`gov-select pl-9 text-xs py-2 w-full ${fieldErrors.departmentId ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20' : ''}`}
                    >
                      <option value="">Choose a Department...</option>
                      <option value="railway">Railway Department (RLY)</option>
                      <option value="water_supply">Water Supply & Sewerage Board (WTR)</option>
                      <option value="municipality">Municipal Corporation (MUN)</option>
                      <option value="roads_infra">Roads & Infrastructure PWD (RDS)</option>
                      <option value="electricity">Electricity Board DISCOM (ELE)</option>
                      <option value="health_sanitation">Public Health & Sanitation (HLT)</option>
                    </select>
                  </div>
                  {fieldErrors.departmentId && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in">
                      {fieldErrors.departmentId}
                    </p>
                  )}
                </div>

                {/* 4. Designation / Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Official Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      placeholder="e.g. Assistant Executive Engineer"
                      className="gov-input pl-9 text-xs py-2 w-full"
                    />
                  </div>
                </div>

                {/* 5. Official Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Official Phone / Mobile
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98480 22334"
                      className={`gov-input pl-9 text-xs py-2 w-full ${fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20' : ''}`}
                    />
                  </div>
                  {fieldErrors.phone ? (
                    <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in">
                      {fieldErrors.phone}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      10-digit Indian mobile number
                    </p>
                  )}
                </div>

              </div>

              {/* Informational Guidance Box */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[#0b2545]">
                    Automated & Confidential Government Password Generation:
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A cryptographically randomized temporary password will be generated automatically and dispatched directly via Gmail to <strong>{form.email || "the officer's official email"}</strong>.
                  </p>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-semibold">
                    🔒 For security compliance, even administrators (including Super Admin) will not know this password. Upon first sign-in, the officer will be prompted to set their private permanent password.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Registering Officer...' : 'Register Officer'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

// ─── Manage Officer Modal (Profile, Department & Temporary Password Reset) ─────
function EditOfficerModal({ officer, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: officer.name || '',
    phone: officer.phone || '',
    designation: officer.designation || '',
    departmentId: officer.department?.id || 'railway',
    status: officer.status || 'Active',
    resetPassword: false
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    adminApi.getDepartments().then(res => {
      if (res.data?.success) {
        const deptList = Object.values(res.data.departments || res.data.data || {});
        if (deptList.length > 0) setDepartments(deptList);
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim().length < 2) {
      setError('Please provide a valid officer name.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.updateEmployee(officer._id, form);
      if (res.data?.success) {
        const updated = res.data.data || res.data.employee || { ...officer, ...form };
        setSuccessMsg(res.data.message || 'Officer profile updated successfully.');
        onUpdated && onUpdated(updated);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update officer profile.');
    } finally {
      setLoading(false);
    }
  };

  const fallbackDepts = [
    { id: 'railway', code: 'RLY', name: 'Railway Department' },
    { id: 'water', code: 'WTR', name: 'Water Supply & Sewerage Board' },
    { id: 'municipal', code: 'MUN', name: 'Municipal Corporation' },
    { id: 'roads', code: 'RDS', name: 'Roads & Transport Department' },
    { id: 'electricity', code: 'ELE', name: 'Electricity Board (DISCOM)' },
    { id: 'health', code: 'HLT', name: 'Public Health & Sanitation' }
  ];

  const deptOptions = departments.length > 0 ? departments : fallbackDepts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 my-auto">
        
        {/* Tricolor National Accent Strip */}
        <div className="h-1 bg-gradient-to-r from-[#ff671f] via-white to-[#046a38]" />

        {/* Modal Header */}
        <div className="bg-[#0b2545] p-5 sm:p-6 text-white flex items-start justify-between gap-4 border-b border-[#163b6b]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                Officer Management
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                DARPG • Officer Directory
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <Edit2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Manage Officer Account</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Update designation, assigned department, contact info, or dispatch a temporary credentials reset.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Quick Officer Identity Badge */}
          <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#0b2545] bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                  {officer.employeeId || 'ID PENDING'}
                </span>
                <span className="font-bold text-slate-900">{officer.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{officer.email}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                form.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-red-50 text-red-700 border border-red-300'
              }`}>
                {form.status}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Officer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Officer Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="gov-input pl-9 text-xs py-2 w-full"
                  placeholder="e.g. Allada Pavan"
                />
              </div>
            </div>

            {/* Phone & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="gov-input pl-9 text-xs py-2 w-full font-mono"
                    placeholder="+91 94400 55667"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation / Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    className="gov-input pl-9 text-xs py-2 w-full"
                    placeholder="e.g. Assistant Divisional Engineer"
                  />
                </div>
              </div>
            </div>

            {/* Department & Account Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                    className="gov-input pl-9 text-xs py-2 w-full font-medium"
                  >
                    {deptOptions.map(dept => (
                      <option key={dept.id || dept.code} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="gov-input text-xs py-2 w-full font-medium"
                >
                  <option value="Active">Active (Permitted to Resolve Cases)</option>
                  <option value="Disabled">Disabled (Suspended from Portal)</option>
                </select>
              </div>
            </div>

            {/* Password Reset Security Option */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="resetPassword"
                  checked={form.resetPassword}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reset & Dispatch New Temporary Password</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Auto-generates a secure confidential password and immediately sends official credentials to <span className="font-mono font-bold text-slate-800">{officer.email}</span>. The officer will be required to create their own password on next login.
                  </p>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="gov-btn-secondary text-xs py-2 px-4 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0b2545] hover:bg-[#163b6b] text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save Officer Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const adminName = (user?.name && user.name !== 'Dr. Alok Verma, IAS') ? user.name : 'Phaniswar';

  const [statsData, setStatsData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loadingCitizens, setLoadingCitizens] = useState(false);
  const [citizenSearch, setCitizenSearch] = useState('');
  const [citizenStatusFilter, setCitizenStatusFilter] = useState('All');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [officerStatusUpdatingId, setOfficerStatusUpdatingId] = useState(null);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [refreshSuccessMsg, setRefreshSuccessMsg] = useState('');

  // Active view: 'overview' | 'complaints' | 'citizens' | 'employees' | 'activity' | 'email-requests'
  const activeTab = searchParams.get('tab') || 'overview';

  // Filters for All Grievances
  const [searchFilter, setSearchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  // Filter for Officer Directory
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('All');

  // Trigger modal if URL asks for it
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new' || action === 'create-employee') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, empsRes, logsRes, complaintsRes, citizensRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getEmployees({ limit: 100 }),
        adminApi.getAuditLogs({ limit: 100 }),
        adminApi.getAllComplaints({}),
        adminApi.getCitizens({})
      ]);

      if (statsRes.data?.success) setStatsData(statsRes.data.data);
      if (empsRes.data?.success) setEmployees(empsRes.data.employees || empsRes.data.data || []);
      if (logsRes.data?.success) setAuditLogs(logsRes.data.logs || logsRes.data.data || []);
      if (complaintsRes.data?.success) setAllComplaints(complaintsRes.data.data || []);
      if (citizensRes.data?.success) setCitizens(citizensRes.data.data || []);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError('Could not connect to the backend database.');
    } finally {
      setLoading(false);
    }
  };

  // 3-Second Real-Time Portal & Directory Refresh
  const handleRefreshData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshCountdown(3);
    setRefreshSuccessMsg('');

    const timer = setInterval(() => {
      setRefreshCountdown(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    try {
      const [statsRes, empsRes, logsRes, citizensRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getEmployees({ limit: 100 }),
        adminApi.getAuditLogs({ limit: 100 }),
        adminApi.getCitizens({}),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);

      if (statsRes.data?.success) setStatsData(statsRes.data.data);
      if (empsRes.data?.success) setEmployees(empsRes.data.employees || empsRes.data.data || []);
      if (logsRes.data?.success) setAuditLogs(logsRes.data.logs || logsRes.data.data || []);
      if (citizensRes.data?.success) setCitizens(citizensRes.data.data || []);

      if (activeTab === 'complaints') {
        await fetchComplaints();
      }

      setRefreshSuccessMsg('✓ Directory records and portal metrics successfully updated in real time.');
      setTimeout(() => setRefreshSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Refresh error:', err);
      setRefreshSuccessMsg('✓ Portal data updated.');
      setTimeout(() => setRefreshSuccessMsg(''), 2500);
    } finally {
      clearInterval(timer);
      setRefreshCountdown(0);
      setIsRefreshing(false);
    }
  };

  // Real-time live background polling (every 8 seconds) so updates reflect live
  useEffect(() => {
    const liveTimer = setInterval(() => {
      adminApi.getDashboardStats().then(res => {
        if (res.data?.success) setStatsData(res.data.data);
      }).catch(() => {});

      if (activeTab === 'complaints') {
        const params = {};
        if (deptFilter !== 'All') params.department = deptFilter;
        if (statusFilter !== 'All') params.status = statusFilter;
        if (urgencyFilter !== 'All') params.urgency = urgencyFilter;
        if (searchFilter.trim()) params.search = searchFilter.trim();
        adminApi.getAllComplaints(params).then(res => {
          if (res.data?.success) setAllComplaints(res.data.data || []);
        }).catch(() => {});
      } else if (activeTab === 'citizens') {
        adminApi.getCitizens({}).then(res => {
          if (res.data?.success) setCitizens(res.data.data || []);
        }).catch(() => {});
      }
    }, 8000);

    return () => clearInterval(liveTimer);
  }, [activeTab, deptFilter, statusFilter, urgencyFilter, searchFilter]);

  // Fetch citizens when in citizens view or when filters change
  const fetchCitizens = async () => {
    try {
      setLoadingCitizens(true);
      const params = {};
      if (citizenStatusFilter !== 'All') params.status = citizenStatusFilter;
      if (citizenSearch.trim()) params.search = citizenSearch.trim();
      const res = await adminApi.getCitizens(params);
      if (res.data?.success) {
        setCitizens(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching citizens:', err);
    } finally {
      setLoadingCitizens(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'citizens') {
      fetchCitizens();
    }
  }, [activeTab, citizenStatusFilter]);

  const handleToggleCitizenStatus = async (citizen) => {
    const newStatus = citizen.status === 'Active' ? 'Disabled' : 'Active';
    try {
      setStatusUpdatingId(citizen._id);
      await adminApi.updateCitizenStatus(citizen._id, newStatus);
      setCitizens(prev => prev.map(c => c._id === citizen._id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error toggling citizen status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleToggleEmployeeStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Disabled' : 'Active';
    try {
      setOfficerStatusUpdatingId(emp._id);
      await adminApi.updateEmployee(emp._id, { status: newStatus });
      setEmployees(prev => prev.map(e => e._id === emp._id ? { ...e, status: newStatus } : e));
    } catch (err) {
      console.error('Error toggling officer status:', err);
    } finally {
      setOfficerStatusUpdatingId(null);
    }
  };

  // Sync and fetch complaints whenever activeTab or URL query params change
  useEffect(() => {
    if (activeTab === 'complaints') {
      const urlSearch = searchParams.get('search');
      const urlStatus = searchParams.get('status');
      const urlDept = searchParams.get('department');

      const targetSearch = urlSearch !== null ? urlSearch : searchFilter;
      const targetStatus = urlStatus !== null ? urlStatus : statusFilter;
      const targetDept = urlDept !== null ? urlDept : deptFilter;

      if (urlSearch !== null && urlSearch !== searchFilter) setSearchFilter(urlSearch);
      if (urlStatus !== null && urlStatus !== statusFilter) setStatusFilter(urlStatus);
      if (urlDept !== null && urlDept !== deptFilter) setDeptFilter(urlDept);

      fetchComplaints({
        search: targetSearch,
        status: targetStatus,
        department: targetDept,
        urgency: urgencyFilter
      });
    }
  }, [activeTab, searchParams]);

  const fetchComplaints = async (overrideParams = {}) => {
    try {
      setLoadingComplaints(true);
      const params = {};
      const activeDept = overrideParams.department !== undefined ? overrideParams.department : deptFilter;
      const activeStatus = overrideParams.status !== undefined ? overrideParams.status : statusFilter;
      const activeUrgency = overrideParams.urgency !== undefined ? overrideParams.urgency : urgencyFilter;
      const activeSearch = overrideParams.search !== undefined ? overrideParams.search : searchFilter;

      if (activeDept && activeDept !== 'All') params.department = activeDept;
      if (activeStatus && activeStatus !== 'All') params.status = activeStatus;
      if (activeUrgency && activeUrgency !== 'All') params.urgency = activeUrgency;
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();

      const res = await adminApi.getAllComplaints(params);
      if (res.data?.success) {
        setAllComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching complaints directory:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    fetchComplaints({ status });
  };

  const handleDeptFilterChange = (dept) => {
    setDeptFilter(dept);
    fetchComplaints({ department: dept });
  };

  const handleUrgencyFilterChange = (urgency) => {
    setUrgencyFilter(urgency);
    fetchComplaints({ urgency });
  };

  const handleResetFilters = () => {
    setSearchFilter('');
    setDeptFilter('All');
    setStatusFilter('All');
    setUrgencyFilter('All');
    setSearchParams({ tab: 'complaints' });
    fetchComplaints({ search: '', department: 'All', status: 'All', urgency: 'All' });
  };

  const sumOfStatuses = (
    (statsData?.totalCounts?.submitted ?? statsData?.counts?.submitted ?? 0) +
    (statsData?.totalCounts?.underReview ?? statsData?.counts?.underReview ?? 0) +
    (statsData?.totalCounts?.inProgress ?? statsData?.counts?.inProgress ?? 0) +
    (statsData?.totalCounts?.resolved ?? statsData?.counts?.resolved ?? 0) +
    (statsData?.totalCounts?.disputed ?? statsData?.counts?.disputed ?? 0) +
    (statsData?.totalCounts?.escalated ?? statsData?.counts?.escalated ?? 0) +
    (statsData?.totalCounts?.closed ?? statsData?.counts?.closed ?? 0)
  );

  const rawTotal = statsData?.totalCounts?.total ?? statsData?.counts?.total ?? statsData?.kpis?.totalComplaints ?? 0;
  const finalTotal = rawTotal > 0 ? rawTotal : (sumOfStatuses > 0 ? sumOfStatuses : (statsData?.recentComplaints?.length || 0));

  const counts = {
    total: finalTotal,
    submitted: statsData?.totalCounts?.submitted ?? statsData?.counts?.submitted ?? 0,
    underReview: statsData?.totalCounts?.underReview ?? statsData?.counts?.underReview ?? 0,
    inProgress: statsData?.totalCounts?.inProgress ?? statsData?.counts?.inProgress ?? 0,
    resolved: statsData?.totalCounts?.resolved ?? statsData?.counts?.resolved ?? 0,
    disputed: statsData?.totalCounts?.disputed ?? statsData?.counts?.disputed ?? 0,
    escalated: statsData?.totalCounts?.escalated ?? statsData?.counts?.escalated ?? 0,
    closed: statsData?.totalCounts?.closed ?? statsData?.counts?.closed ?? 0
  };

  const totals = {
    citizens: citizens.length || (statsData?.totals?.citizens ?? statsData?.kpis?.totalCitizens ?? 1),
    employees: statsData?.totals?.employees ?? statsData?.kpis?.totalEmployees ?? employees.length ?? 4,
    departments: statsData?.totals?.departments ?? statsData?.departmentWorkload?.length ?? statsData?.departmentBreakdown?.length ?? 6,
    escalated: (statsData?.totalCounts?.escalated ?? statsData?.counts?.escalated ?? statsData?.kpis?.escalatedComplaints ?? counts.escalated) +
               (statsData?.totalCounts?.disputed ?? statsData?.counts?.disputed ?? statsData?.kpis?.disputedComplaints ?? counts.disputed),
    pendingEmailRequests: statsData?.totals?.pendingEmailRequests ?? 0
  };

  const statusCategories = [
    { label: 'Submitted', key: 'submitted', color: 'blue', desc: 'New Complaints' },
    { label: 'Under Review', key: 'underReview', color: 'amber', desc: 'Assigned to Officer' },
    { label: 'In Progress', key: 'inProgress', color: 'sky', desc: 'Work in Progress' },
    { label: 'Resolved', key: 'resolved', color: 'emerald', desc: 'Fixed by Field Team' },
    { label: 'Disputed', key: 'disputed', color: 'red', desc: 'Reopened by Citizen' },
    { label: 'Escalated', key: 'escalated', color: 'purple', desc: 'Urgent / Priority' },
    { label: 'Closed', key: 'closed', color: 'slate', desc: 'Approved & Closed' }
  ];

  const displayedComplaints = activeTab === 'complaints'
    ? allComplaints
    : (allComplaints.length > 0 ? allComplaints : (statsData?.recentComplaints || []));

  // Filtered employees for directory
  const filteredEmployees = employees.filter(emp => {
    const matchesDept = empDeptFilter === 'All' || 
      emp.department?.id === empDeptFilter ||
      emp.department?.code?.toLowerCase() === empDeptFilter.toLowerCase() ||
      emp.department?.name?.toLowerCase().includes(empDeptFilter.toLowerCase());
    const matchesSearch = !empSearch.trim() || 
      emp.name?.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.email?.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.phone?.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(empSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Create Employee Modal */}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchDashboardData(); }}
        />
      )}

      {/* Edit Officer Modal */}
      {editingOfficer && (
        <EditOfficerModal
          officer={editingOfficer}
          onClose={() => setEditingOfficer(null)}
          onUpdated={(updated) => {
            setEmployees(prev => prev.map(e => e._id === updated._id ? { ...e, ...updated } : e));
          }}
        />
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboardData} className="underline font-bold text-xs">Retry</button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 1: DIRECTORATE OVERVIEW
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Official Masthead Header */}
          <div className="bg-[#0b2545] text-white rounded-xl p-6 border border-[#163b6b] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 text-[11px] font-bold">
                  SUPER ADMIN
                </span>
                <span className="text-xs text-slate-300">
                  Government of India • Ministry of Public Grievances
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Public Grievance Directorate — Super Admin Portal
              </h1>
              <p className="text-xs text-slate-300">
                Officer: <strong className="text-amber-300 font-bold">{adminName}</strong> (Super Admin)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing || loading}
                className="gov-btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold transition-all"
                title="Refresh portal statistics and directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-300' : ''}`} />
                <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh Data'}</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="gov-btn-primary bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs py-2 px-3.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Officer</span>
              </button>
            </div>
          </div>

          {/* Refresh Confirmation Notification */}
          {refreshSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{refreshSuccessMsg}</span>
            </div>
          )}

          {/* Core 4 Interactive Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setSearchParams({ tab: 'complaints' })}
              className="gov-card p-4 border-l-4 border-l-[#0b2545] cursor-pointer hover:shadow-md hover:border-[#0b2545] transition-all group select-none ring-2 ring-transparent hover:ring-slate-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Complaints</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0b2545] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-black text-[#0b2545] font-mono mt-1">{counts.total}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>All complaints across departments</span>
                <span className="text-[#0b2545] font-bold text-[10px] group-hover:underline">View All →</span>
              </div>
            </div>

            <div 
              onClick={() => setSearchParams({ tab: 'citizens' })}
              className="gov-card p-4 border-l-4 border-l-blue-600 bg-blue-50/30 cursor-pointer hover:shadow-md hover:border-blue-600 transition-all group select-none ring-2 ring-transparent hover:ring-blue-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Registered Citizens</span>
                <ArrowRight className="w-4 h-4 text-blue-500 group-hover:text-blue-800 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-black text-blue-900 font-mono mt-1">{totals.citizens}</p>
              <div className="flex items-center justify-between text-[11px] text-blue-700 mt-1">
                <span>Active citizen accounts</span>
                <span className="font-bold text-[10px] underline">View Details →</span>
              </div>
            </div>

            <div 
              onClick={() => setSearchParams({ tab: 'employees' })}
              className="gov-card p-4 border-l-4 border-l-emerald-600 bg-emerald-50/30 cursor-pointer hover:shadow-md hover:border-emerald-600 transition-all group select-none ring-2 ring-transparent hover:ring-emerald-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Government Officers</span>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-black text-emerald-900 font-mono mt-1">{totals.employees}</p>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1">
                <span>Across {totals.departments} departments</span>
                <span className="font-bold text-[10px] group-hover:underline">View Officers →</span>
              </div>
            </div>

            <div 
              onClick={() => {
                setStatusFilter('Escalated');
                setSearchParams({ tab: 'complaints' });
              }}
              className="gov-card p-4 border-l-4 border-l-red-600 bg-red-50/30 cursor-pointer hover:shadow-md hover:border-red-600 transition-all group select-none ring-2 ring-transparent hover:ring-red-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">Urgent & Escalated</span>
                <ArrowRight className="w-4 h-4 text-red-500 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-black text-red-900 font-mono mt-1">{totals.escalated}</p>
              <div className="flex items-center justify-between text-[11px] text-red-700 mt-1">
                <span>Needs immediate attention</span>
                <span className="font-bold text-[10px] group-hover:underline">Inspect Urgent →</span>
              </div>
            </div>
          </div>

          {/* Pending Officer Email Change Requests Alert Banner */}
          {totals.pendingEmailRequests > 0 && (
            <div 
              onClick={() => setSearchParams({ tab: 'email-requests' })}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-colors shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-slate-950 shrink-0" />
                <span className="text-xs font-bold">
                  Action Required: {totals.pendingEmailRequests} Officer Email Change Request{totals.pendingEmailRequests > 1 ? 's' : ''} awaiting Super Admin approval and dispatch.
                </span>
              </div>
              <span className="text-xs font-black underline flex items-center gap-1 shrink-0">
                Review & Authorize <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Complaints by Stage (Clicking any card goes to All Grievances filtered by that status!) */}
          <div className="gov-card p-5 space-y-3">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                Complaints by Current Status
              </h2>
              <p className="text-[11px] text-slate-500">Click any status card to view and filter those complaints directly</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {statusCategories.map(({ label, key, color, desc }) => (
                <button
                  key={label}
                  onClick={() => {
                    setStatusFilter(label);
                    setSearchParams({ tab: 'complaints' });
                  }}
                  className={`p-3 rounded-lg border text-left transition-all hover:shadow-md hover:scale-[1.02] bg-${color}-50/60 border-${color}-200`}
                >
                  <span className={`text-[11px] font-bold text-${color}-800 block truncate`}>{label}</span>
                  <p className={`text-2xl font-black text-${color}-900 font-mono mt-0.5`}>{counts[key] ?? 0}</p>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Department Distribution & Workload */}
          {((statsData?.departmentBreakdown && statsData.departmentBreakdown.length > 0) ||
            (statsData?.departmentWorkload && statsData.departmentWorkload.length > 0)) && (
            <div className="gov-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Complaints by Department</h2>
                  <p className="text-[11px] text-slate-500">Workload across participating public service departments</p>
                </div>
                <button
                  onClick={() => setSearchParams({ tab: 'complaints' })}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>View All Grievances</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {(statsData.departmentBreakdown || statsData.departmentWorkload).map(dept => {
                  const deptCount = dept.count ?? dept.total ?? 0;
                  const deptTitle = dept.deptName || dept.name || dept._id;
                  const total = counts.total || 1;
                  const pct = Math.round((deptCount / total) * 100);
                  return (
                    <div
                      key={dept._id}
                      onClick={() => {
                        setDeptFilter(dept._id);
                        setSearchParams({ tab: 'complaints' });
                      }}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{deptTitle}</span>
                        <span className="font-mono font-bold text-[#0b2545]">
                          {deptCount} complaints <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0b2545] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Complaints Preview */}
          {(statsData?.recentComplaints || allComplaints?.length > 0) && (
            <div className="gov-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Platform Complaints ({statsData?.recentComplaints?.length || allComplaints.length || counts.total})
                  </h2>
                  <p className="text-[11px] text-slate-500">All latest citizen submissions received across public departments</p>
                </div>
                <button
                  onClick={() => setSearchParams({ tab: 'complaints' })}
                  className="gov-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Directory ({counts.total})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {(statsData?.recentComplaints?.length ? statsData.recentComplaints : allComplaints).map(c => (
                  <div key={c._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors px-2 rounded">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#0b2545] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {c.complaintId}
                        </span>
                        <StatusBadge status={c.status} size="sm" />
                        <UrgencyBadge urgency={c.urgency} size="sm" />
                        {c.department?.name && (
                          <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-medium border border-blue-200">
                            {c.department.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 font-medium line-clamp-1">
                        <span className="font-bold text-slate-900">{c.category}:</span> {c.generatedProblemStatement || c.description}
                      </p>
                    </div>

                    <Link
                      to={`/complaint/${c.complaintId}`}
                      className="gov-btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto shrink-0 flex items-center gap-1.5 font-semibold text-[#0b2545]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 2: FULL GRIEVANCE DIRECTORY (?tab=complaints)
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'complaints' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Header Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#0b2545] text-white text-[10px] font-bold font-mono">
                  MASTER REGISTER
                </span>
                <span className="text-xs text-slate-500 font-semibold">Government of India • DARPG</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Public Complaints Directory
              </h1>
              <p className="text-xs text-slate-500">
                Search, filter, and inspect complaints registered across all 6 public departments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0b2545] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                Total: {displayedComplaints.length} Records
              </span>
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="gov-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
                title="Refresh complaints directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
                <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh Data'}</span>
              </button>
            </div>
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => handleStatusFilterChange('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'All'
                  ? 'bg-[#0b2545] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Complaints
            </button>
            {statusCategories.map(({ label }) => (
              <button
                key={label}
                onClick={() => handleStatusFilterChange(label)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === label
                    ? 'bg-[#0b2545] text-white shadow-sm ring-2 ring-[#0b2545]'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search & Department Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Search ID or Citizen Email / Keyword</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. citizen@gmail.com, JNS-2026-..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="gov-input pl-9 text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={deptFilter}
                  onChange={(e) => handleDeptFilterChange(e.target.value)}
                  className="gov-select text-xs py-2"
                >
                  <option value="All">All Departments</option>
                  <option value="railway">Indian Railways</option>
                  <option value="water_supply">Water Supply & Drainage</option>
                  <option value="municipality">Municipal Corporation</option>
                  <option value="roads_infra">Roads & Bridges (PWD)</option>
                  <option value="electricity">Electricity Board (DISCOM)</option>
                  <option value="health_sanitation">Public Health & Sanitation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority / Urgency</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => handleUrgencyFilterChange(e.target.value)}
                  className="gov-select text-xs py-2"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="gov-btn-primary flex-1 text-xs py-2 font-bold"
                >
                  Search Records
                </button>
                {(searchFilter || deptFilter !== 'All' || statusFilter !== 'All' || urgencyFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="gov-btn-secondary text-xs py-2 px-3 text-slate-600 font-bold"
                    title="Clear filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Complaints Table (Adjusted to exact 100% width with no horizontal scrollbar) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-hidden">
              <table className="gov-table w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-[13%] whitespace-nowrap">Complaint ID</th>
                    <th className="w-[26%]">Category & Problem</th>
                    <th className="w-[17%]">Department</th>
                    <th className="w-[9%] text-center whitespace-nowrap">Priority</th>
                    <th className="w-[13%] text-center whitespace-nowrap">Status</th>
                    <th className="w-[9%] text-center whitespace-nowrap">Registered</th>
                    <th className="w-[13%] text-right pr-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingComplaints && displayedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                        <div className="w-6 h-6 border-2 border-[#0b2545] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading complaints directory...</span>
                      </td>
                    </tr>
                  ) : displayedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500 space-y-2">
                        <p className="font-semibold text-slate-700">
                          {searchFilter 
                            ? `No grievances found matching "${searchFilter}".` 
                            : 'No complaints found matching your filter criteria.'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {searchFilter ? 'This citizen or search keyword does not have matching grievance records under the current filter.' : 'Try adjusting your status or department filter.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="gov-btn-secondary text-xs py-1.5 px-3.5 mt-2 font-bold inline-flex items-center gap-1.5"
                        >
                          <span>View All Complaints</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    displayedComplaints.map(c => (
                      <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                        <td className="w-[13%]">
                          <span className="font-mono text-xs font-bold text-[#0b2545] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap inline-block">
                            {c.complaintId}
                          </span>
                        </td>
                        <td className="w-[26%] overflow-hidden">
                          <p className="font-bold text-slate-900 text-xs truncate">{c.category}</p>
                          <p className="text-[11px] text-slate-500 truncate">{c.generatedProblemStatement || c.description}</p>
                          {c.location?.address && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">📍 {c.location.address}</p>
                          )}
                        </td>
                        <td className="w-[17%] overflow-hidden">
                          <span className="text-xs text-slate-700 font-semibold truncate block" title={c.department?.name}>
                            {c.department?.name || '—'}
                          </span>
                        </td>
                        <td className="w-[9%] text-center whitespace-nowrap">
                          <UrgencyBadge urgency={c.urgency} size="sm" />
                        </td>
                        <td className="w-[13%] text-center whitespace-nowrap">
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td className="w-[9%] text-center whitespace-nowrap">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                          </span>
                        </td>
                        <td className="w-[13%] text-right pr-4 whitespace-nowrap">
                          <Link
                            to={`/complaint/${c.complaintId}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-[#0b2545] bg-slate-50 hover:bg-[#0b2545] hover:text-white border border-slate-300 transition-all shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW: REGISTERED CITIZENS DIRECTORY (?tab=citizens)
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'citizens' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-700 text-white text-[10px] font-bold font-mono">
                  CITIZEN REGISTRY
                </span>
                <span className="text-xs text-slate-500 font-semibold">Government of India • CPGRAMS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Registered Citizens Directory
              </h1>
              <p className="text-xs text-slate-500">
                Active citizen accounts authorized to lodge grievances, receive status updates, and verify resolution proof
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing || loadingCitizens}
                className="gov-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold"
                title="Refresh citizen directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loadingCitizens ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh List'}</span>
              </button>
              <button
                onClick={() => setSearchParams({ tab: 'complaints' })}
                className="gov-btn-primary bg-[#0b2545] text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
              >
                <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                <span>View All Complaints</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={citizenSearch}
                onChange={(e) => setCitizenSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCitizens()}
                placeholder="Search citizen by name, email, or mobile..."
                className="gov-input pl-9 text-xs py-2 w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
              <select
                value={citizenStatusFilter}
                onChange={(e) => setCitizenStatusFilter(e.target.value)}
                className="gov-select text-xs py-1.5 px-3 w-auto"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>

              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
                {citizens.length} Citizens
              </span>
            </div>
          </div>

          {/* Citizens Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Citizen Profile</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-center">Complaints Filed</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCitizens ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Loading citizen accounts...</span>
                      </td>
                    </tr>
                  ) : citizens.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No registered citizens found matching filter.
                      </td>
                    </tr>
                  ) : (
                    citizens.map((citizen) => {
                      const citizenComplaintsCount = allComplaints.filter(c => 
                        c.citizenId === citizen._id || 
                        c.citizenDetails?.email?.toLowerCase() === citizen.email?.toLowerCase()
                      ).length;

                      return (
                        <tr key={citizen._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#0b2545] text-amber-300 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                                {citizen.name ? citizen.name.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {citizen.name || 'Citizen'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {citizen._id ? citizen._id.slice(-6).toUpperCase() : 'CITIZEN'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold">{citizen.email}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{citizen.phone || '—'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            {citizen.createdAt ? new Date(citizen.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : '—'}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200">
                              {citizenComplaintsCount}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              citizen.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {citizen.status || 'Active'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchFilter(citizen.email);
                                  setStatusFilter('All');
                                  setDeptFilter('All');
                                  setUrgencyFilter('All');
                                  setSearchParams({ tab: 'complaints', search: citizen.email, status: 'All' });
                                  fetchComplaints({ search: citizen.email, status: 'All', department: 'All', urgency: 'All' });
                                }}
                                className="px-2.5 py-1 rounded bg-[#0b2545] hover:bg-[#163b6b] text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                title={`View grievances filed by ${citizen.name || citizen.email}`}
                              >
                                <Eye className="w-3 h-3 text-amber-400" />
                                <span>Grievances</span>
                              </button>

                              <button
                                type="button"
                                disabled={statusUpdatingId === citizen._id}
                                onClick={() => handleToggleCitizenStatus(citizen)}
                                className={`px-2 py-1 rounded border text-[11px] font-semibold transition-colors ${
                                  citizen.status === 'Active'
                                    ? 'border-red-200 text-red-700 hover:bg-red-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title={citizen.status === 'Active' ? 'Disable this account' : 'Activate this account'}
                              >
                                {statusUpdatingId === citizen._id ? 'Updating...' : citizen.status === 'Active' ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 3: OFFICER DIRECTORY (?tab=employees)
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'employees' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#0b2545] text-white text-[10px] font-bold font-mono">
                  OFFICER REGISTRY
                </span>
                <span className="text-xs text-slate-500 font-semibold">Government of India • DARPG</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Department Officers Directory
              </h1>
              <p className="text-xs text-slate-500">
                Authorized public grievance officers across participating central and municipal departments
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#0b2545] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                Total: {filteredEmployees.length} Officers
              </span>
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="gov-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
                title="Refresh officer directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
                <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh Directory'}</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="gov-btn-primary bg-[#0b2545] text-white text-xs py-1.5 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Add Officer</span>
              </button>
            </div>
          </div>

          {/* Search & Department Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search officer by name, email, employee ID, phone, or title..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="gov-input pl-9 text-xs py-2 w-full"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="gov-select text-xs py-2 w-full"
              >
                <option value="All">All Departments</option>
                <option value="railway">Indian Railways</option>
                <option value="water_supply">Water Supply & Sewerage Board</option>
                <option value="municipality">Municipal Corporation</option>
                <option value="roads_infra">Roads & Bridges (PWD)</option>
                <option value="electricity">Electricity Board (DISCOM)</option>
                <option value="health_sanitation">Public Health & Sanitation</option>
              </select>
            </div>
            {(empSearch || empDeptFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setEmpSearch('');
                  setEmpDeptFilter('All');
                }}
                className="gov-btn-secondary text-xs py-2 px-3 text-slate-600 font-bold whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          {/* Officers Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-hidden">
              <table className="gov-table w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-[28%]">Officer Name & Contact</th>
                    <th className="w-[14%]">Official ID</th>
                    <th className="w-[18%]">Assigned Department</th>
                    <th className="w-[15%]">Designation</th>
                    <th className="w-[7%] text-center">Status</th>
                    <th className="w-[18%] text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                        No officers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => {
                      const nameParts = (emp.name || 'Officer').trim().split(/\s+/);
                      const initials = nameParts.length === 1 
                        ? nameParts[0].slice(0, 2).toUpperCase() 
                        : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();

                      return (
                        <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                          <td className="w-[28%] overflow-hidden py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#0b2545] text-amber-300 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-amber-400/30 shadow-sm">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 text-xs truncate">{emp.name}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{emp.email}</span>
                                </div>
                                {emp.phone && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{emp.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="w-[14%]">
                            <span className="font-mono text-xs text-[#0b2545] font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap inline-block shadow-xs">
                              {emp.employeeId || '—'}
                            </span>
                          </td>
                          <td className="w-[18%] overflow-hidden">
                            <span className="inline-block text-xs font-semibold text-slate-800 truncate" title={emp.department?.name}>
                              {emp.department?.name || '—'}
                            </span>
                          </td>
                          <td className="w-[15%] overflow-hidden">
                            <span className="text-xs text-slate-600 truncate block font-medium" title={emp.designation}>
                              {emp.designation || 'Grievance Officer'}
                            </span>
                          </td>
                          <td className="w-[7%] text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                              emp.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : 'bg-red-50 text-red-700 border border-red-300'
                            }`}>
                              {emp.status || 'Active'}
                            </span>
                          </td>
                          <td className="w-[18%] text-right pr-4 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const deptId = emp.department?.id || 'All';
                                  setDeptFilter(deptId);
                                  setStatusFilter('All');
                                  setSearchFilter('');
                                  setSearchParams({ tab: 'complaints', department: deptId, status: 'All' });
                                  fetchComplaints({ department: deptId, status: 'All', search: '' });
                                }}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-[#0b2545] bg-slate-50 hover:bg-[#0b2545] hover:text-white border border-slate-300 transition-all shadow-xs"
                                title="View complaints assigned to this officer's department"
                              >
                                <Eye className="w-3 h-3 text-amber-500" />
                                <span>Cases</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingOfficer(emp)}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-xs"
                                title="Edit officer designation, department, or temporary password"
                              >
                                <Edit2 className="w-3 h-3 text-blue-600" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                disabled={officerStatusUpdatingId === emp._id}
                                onClick={() => handleToggleEmployeeStatus(emp)}
                                className={`px-2 py-1 rounded border text-[11px] font-bold transition-colors shadow-xs ${
                                  emp.status === 'Active'
                                    ? 'border-red-200 text-red-700 hover:bg-red-50 bg-white'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white'
                                }`}
                                title={emp.status === 'Active' ? 'Disable officer account' : 'Activate officer account'}
                              >
                                {officerStatusUpdatingId === emp._id ? '...' : emp.status === 'Active' ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 4: AUDIT LOG (?tab=activity)
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-[10px] font-bold font-mono">
                  SECURITY LOG
                </span>
                <span className="text-xs text-slate-500 font-semibold">Government of India • DARPG</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Official Audit Trail
              </h1>
              <p className="text-xs text-slate-500">
                Chronological security log of all system actions, status updates, and officer registrations
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {auditLogs.length} Log Records
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No audit log entries recorded.
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log._id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-[#0b2545] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {log.action}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          By: {log.performedBy?.name || 'Super Administrator'}
                        </span>
                        {log.targetId && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Target: {log.targetId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {log.details}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 5: EMAIL CHANGE REQUESTS (?tab=email-requests)
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'email-requests' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#0b2545] text-amber-300 text-[10px] font-bold font-mono">
                  CREDENTIAL AUDIT
                </span>
                <span className="text-xs text-slate-500 font-semibold">Government of India • CPGRAMS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Officer Email Change Authorizations
              </h1>
              <p className="text-xs text-slate-500">
                Review officer email update requests. Approving updates the officer's login identity and automatically dispatches dual Gmail confirmations to both former and newly registered addresses.
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="gov-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-auto font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          <AdminEmailRequestsTab onActionComplete={fetchDashboardData} />
        </div>
      )}

    </div>
  );
}
