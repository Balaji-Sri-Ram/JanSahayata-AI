import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to dynamically inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jansahayata_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global auth error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized occurs on protected routes, we can handle it if needed
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  staffLogin: (credentials) => api.post('/auth/staff-login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  firstTimeResetPassword: (data) => api.post('/auth/first-time-reset-password', data),
  sendPasswordOtp: (payload = {}) => api.post('/auth/send-password-otp', payload),
  changePasswordWithOtp: (data) => api.post('/auth/change-password-with-otp', data),
};

// ==========================================
// Citizen APIs
// ==========================================
export const citizenApi = {
  createComplaint: (formData) => {
    return api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMyComplaints: (citizenId = 'current') => {
    return api.get(`/complaints/citizen/${citizenId}`);
  },
  getComplaintDetails: (id) => {
    return api.get(`/complaints/${id}`);
  },
  verifyResolution: (id, feedback = 'Resolved satisfactorily') => {
    return api.post(`/complaints/${id}/verify-resolution`, { feedback });
  },
  disputeResolution: (id, formData) => {
    return api.post(`/complaints/${id}/dispute`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  previewAiAnalysis: (payload) => {
    return api.post('/ai/preview-analysis', payload);
  },
  getDepartments: () => {
    return api.get('/ai/departments');
  }
};

// ==========================================
// Government Staff APIs
// ==========================================
export const staffApi = {
  getDashboardStats: () => api.get('/staff/dashboard/stats'),
  getComplaints: (params = {}) => api.get('/staff/complaints', { params }),
  getComplaintDetails: (id) => api.get(`/staff/complaints/${id}`),
  updateStatus: (id, payload) => api.patch(`/staff/complaints/${id}/status`, payload),
  addProgressUpdate: (id, formData) => {
    return api.post(`/staff/complaints/${id}/progress`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  resolveComplaint: (id, formData) => {
    return api.post(`/staff/complaints/${id}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  escalateComplaint: (id, payload) => api.post(`/staff/complaints/${id}/escalate`, payload),
  submitEmailChangeRequest: (payload) => api.post('/staff/email-change-request', payload),
  getEmailChangeStatus: () => api.get('/staff/email-change-request/status')
};

// ==========================================
// Super Admin APIs
// ==========================================
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  syncPlatformData: () => api.post('/admin/sync-data'),
  getEmployees: (params = {}) => api.get('/admin/employees', { params }),
  createEmployee: (employeeData) => api.post('/admin/employees', employeeData),
  updateEmployee: (id, updateData) => api.patch(`/admin/employees/${id}`, updateData),
  getCitizens: (params = {}) => api.get('/admin/citizens', { params }),
  updateCitizenStatus: (id, status) => api.patch(`/admin/citizens/${id}/status`, { status }),
  getAllComplaints: (params = {}) => api.get('/admin/complaints', { params }),
  reassignComplaint: (id, payload) => api.patch(`/admin/complaints/${id}/reassign`, payload),
  escalateComplaint: (id, payload) => api.post(`/admin/complaints/${id}/escalate`, payload),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getDepartments: () => api.get('/admin/departments'),
  getEmailChangeRequests: (params = {}) => api.get('/admin/email-change-requests', { params }),
  approveEmailChangeRequest: (id, payload = {}) => api.patch(`/admin/email-change-requests/${id}/approve`, payload),
  rejectEmailChangeRequest: (id, payload = {}) => api.patch(`/admin/email-change-requests/${id}/reject`, payload)
};

// ==========================================
// Railway Backward Compatibility APIs
// ==========================================
export const railwayApi = {
  getDashboardStats: () => api.get('/railway/dashboard/stats'),
  getComplaints: (params = {}) => api.get('/railway/complaints', { params }),
  getComplaintDetails: (id) => api.get(`/railway/complaints/${id}`),
  updateStatus: (id, payload) => api.patch(`/railway/complaints/${id}/status`, payload),
  addProgressUpdate: (id, formData) => {
    return api.post(`/railway/complaints/${id}/progress`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  resolveComplaint: (id, formData) => {
    return api.post(`/railway/complaints/${id}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  escalateComplaint: (id, payload) => api.post(`/railway/complaints/${id}/escalate`, payload)
};

export default api;
