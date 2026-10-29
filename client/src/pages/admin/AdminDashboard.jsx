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
  Briefcase
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

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const adminName = (user?.name && user.name !== 'Dr. Alok Verma, IAS') ? user.name : 'Phaniswar';

  const [statsData, setStatsData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCountdown, setSyncCountdown] = useState(0);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Active view: 'overview' | 'complaints' | 'employees' | 'activity'
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
      const [statsRes, empsRes, logsRes, complaintsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getEmployees({ limit: 100 }),
        adminApi.getAuditLogs({ limit: 100 }),
        adminApi.getAllComplaints({})
      ]);

      if (statsRes.data?.success) setStatsData(statsRes.data.data);
      if (empsRes.data?.success) setEmployees(empsRes.data.employees || empsRes.data.data || []);
      if (logsRes.data?.success) setAuditLogs(logsRes.data.logs || logsRes.data.data || []);
      if (complaintsRes.data?.success) setAllComplaints(complaintsRes.data.data || []);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError('Could not connect to the backend database.');
    } finally {
      setLoading(false);
    }
  };

  // Deep 5-Second Backend Synchronization & Data Repair
  const handleRefreshAndSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncCountdown(5);
    setSyncSuccessMsg('');

    // Timer countdown: 5s -> 4s -> 3s -> 2s -> 1s -> 0s
    const timerInterval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      // Trigger backend sync, recalculation, and integrity check
      const [syncRes, empsRes, logsRes] = await Promise.all([
        adminApi.syncPlatformData(),
        adminApi.getEmployees({ limit: 100 }),
        adminApi.getAuditLogs({ limit: 100 }),
        new Promise((resolve) => setTimeout(resolve, 5000)) // Guarantee full 5-second verification
      ]);

      if (syncRes.data?.success) {
        if (syncRes.data.data) setStatsData(syncRes.data.data);
        if (syncRes.data.complaints) setAllComplaints(syncRes.data.complaints);
      }
      if (empsRes.data?.success) setEmployees(empsRes.data.employees || empsRes.data.data || []);
      if (logsRes.data?.success) setAuditLogs(logsRes.data.logs || logsRes.data.data || []);

      setSyncSuccessMsg('✓ All platform records, complaint pipelines, and statistics successfully synchronized.');
      setTimeout(() => setSyncSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Refresh sync error:', err);
      await fetchDashboardData();
      await fetchComplaints();
      setSyncSuccessMsg('✓ Platform data reloaded.');
      setTimeout(() => setSyncSuccessMsg(''), 3000);
    } finally {
      clearInterval(timerInterval);
      setSyncCountdown(0);
      setIsSyncing(false);
    }
  };

  // Fetch complaints whenever in complaints view or when filters change
  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab, deptFilter, statusFilter, urgencyFilter]);

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const params = {};
      if (deptFilter !== 'All') params.department = deptFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (urgencyFilter !== 'All') params.urgency = urgencyFilter;
      if (searchFilter.trim()) params.search = searchFilter.trim();

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
    citizens: statsData?.totals?.citizens ?? statsData?.kpis?.totalCitizens ?? 1,
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

  const displayedComplaints = allComplaints.length > 0 ? allComplaints : (statsData?.recentComplaints || []);

  // Filtered employees for directory
  const filteredEmployees = employees.filter(emp => {
    const matchesDept = empDeptFilter === 'All' || emp.department?.id === empDeptFilter;
    const matchesSearch = !empSearch.trim() || 
      emp.name?.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.email?.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(empSearch.toLowerCase());
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
                onClick={handleRefreshAndSync}
                disabled={isSyncing || loading}
                className="gov-btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold transition-all"
                title="Deep synchronize platform records and unstick pipelines"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || loading ? 'animate-spin text-amber-300' : ''}`} />
                <span>{isSyncing ? `Syncing Data (${syncCountdown}s)...` : 'Refresh Data'}</span>
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

          {/* Active 5-Second Deep Sync Notification & Progress Bar */}
          {isSyncing && (
            <div className="bg-[#0b2545] border border-amber-400/40 rounded-xl p-3.5 text-xs text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span>
                  Synchronizing database, verifying complaint pipelines, and refreshing analytics with backend... <strong>({syncCountdown}s remaining)</strong>
                </span>
              </div>
              <div className="w-full sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, ((6 - syncCountdown) / 5) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Sync Success Confirmation Notification */}
          {syncSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{syncSuccessMsg}</span>
            </div>
          )}

          {/* Core 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="gov-card p-4 border-l-4 border-l-[#0b2545]">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Complaints</span>
              <p className="text-3xl font-black text-[#0b2545] font-mono mt-1">{counts.total}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">All complaints across departments</span>
            </div>

            <div className="gov-card p-4 border-l-4 border-l-blue-600 bg-blue-50/30">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Registered Citizens</span>
              <p className="text-3xl font-black text-blue-900 font-mono mt-1">{totals.citizens}</p>
              <span className="text-[11px] text-blue-600 mt-0.5 block">Active citizen accounts</span>
            </div>

            <div className="gov-card p-4 border-l-4 border-l-emerald-600 bg-emerald-50/30">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Government Officers</span>
              <p className="text-3xl font-black text-emerald-900 font-mono mt-1">{totals.employees}</p>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">Across {totals.departments} departments</span>
            </div>

            <div className="gov-card p-4 border-l-4 border-l-red-600 bg-red-50/30">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">Urgent & Escalated</span>
              <p className="text-3xl font-black text-red-900 font-mono mt-1">{totals.escalated}</p>
              <span className="text-[11px] text-red-600 mt-0.5 block">Needs immediate attention</span>
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
                onClick={handleRefreshAndSync}
                disabled={isSyncing}
                className="gov-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
                title="Deep synchronize platform records and unstick pipelines"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
                <span>{isSyncing ? `Syncing (${syncCountdown}s)...` : 'Refresh Data'}</span>
              </button>
            </div>
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('All')}
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
                onClick={() => setStatusFilter(label)}
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Search ID or Keyword</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. JNS-2026-000001"
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
                  onChange={(e) => setDeptFilter(e.target.value)}
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
                  onChange={(e) => setUrgencyFilter(e.target.value)}
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
                  className="gov-btn-primary flex-1 text-xs py-2"
                >
                  Search Records
                </button>
                {(searchFilter || deptFilter !== 'All' || statusFilter !== 'All' || urgencyFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFilter('');
                      setDeptFilter('All');
                      setStatusFilter('All');
                      setUrgencyFilter('All');
                    }}
                    className="gov-btn-secondary text-xs py-2 px-3 text-slate-600"
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
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                        No complaints found matching your filter criteria.
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
          VIEW 3: OFFICER DIRECTORY (?tab=employees)
      ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'employees' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-700 text-white text-[10px] font-bold font-mono">
                  AUTHORIZED PERSONNEL
                </span>
                <span className="text-xs text-slate-500 font-semibold">Government of India • DARPG</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Department Officers Directory
              </h1>
              <p className="text-xs text-slate-500">
                Government personnel assigned to resolve citizen grievances across public departments
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRefreshAndSync}
                disabled={isSyncing}
                className="gov-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold"
                title="Deep synchronize platform records and unstick pipelines"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
                <span>{isSyncing ? `Syncing (${syncCountdown}s)...` : 'Refresh Data'}</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="gov-btn-primary bg-[#0b2545] text-white text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Add Officer</span>
              </button>
            </div>
          </div>

          {/* Search & Department Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search officer by name, email, or employee ID..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="gov-input pl-9 text-xs py-2"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
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
          </div>

          {/* Officers Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-hidden">
              <table className="gov-table w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-[30%]">Officer Name & Contact</th>
                    <th className="w-[18%]">Official ID</th>
                    <th className="w-[24%]">Assigned Department</th>
                    <th className="w-[18%]">Designation</th>
                    <th className="w-[10%] text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                        No officers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => (
                      <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                        <td className="w-[30%] overflow-hidden">
                          <div>
                            <p className="font-bold text-slate-900 text-xs truncate">{emp.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono truncate">{emp.email}</p>
                            {emp.phone && <p className="text-[10px] text-slate-400 font-mono truncate">{emp.phone}</p>}
                          </div>
                        </td>
                        <td className="w-[18%]">
                          <span className="font-mono text-xs text-[#0b2545] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap inline-block">
                            {emp.employeeId || '—'}
                          </span>
                        </td>
                        <td className="w-[24%] overflow-hidden">
                          <span className="text-xs font-semibold text-slate-800 truncate block">{emp.department?.name || '—'}</span>
                        </td>
                        <td className="w-[18%] overflow-hidden">
                          <span className="text-xs text-slate-600 truncate block">{emp.designation || 'Grievance Officer'}</span>
                        </td>
                        <td className="w-[10%] text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${
                            emp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-700 border border-red-300'
                          }`}>
                            {emp.status}
                          </span>
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
