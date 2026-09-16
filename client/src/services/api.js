import axios from 'axios';

// API base client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Citizen Endpoints
export const citizenApi = {
  createComplaint: (formData) => {
    return api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyComplaints: (citizenId = 'CITIZEN-DEMO-001') => {
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  previewAiAnalysis: (payload) => {
    return api.post('/ai/preview-analysis', payload);
  },
  getDepartments: () => {
    return api.get('/ai/departments');
  }
};

// Railway Department Endpoints
export const railwayApi = {
  getDashboardStats: () => {
    return api.get('/railway/dashboard/stats');
  },
  getComplaints: (params = {}) => {
    return api.get('/railway/complaints', { params });
  },
  getComplaintDetails: (id) => {
    return api.get(`/railway/complaints/${id}`);
  },
  updateStatus: (id, payload) => {
    return api.patch(`/railway/complaints/${id}/status`, payload);
  },
  addProgressUpdate: (id, formData) => {
    return api.post(`/railway/complaints/${id}/progress`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  resolveComplaint: (id, formData) => {
    return api.post(`/railway/complaints/${id}/resolve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  escalateComplaint: (id, payload) => {
    return api.post(`/railway/complaints/${id}/escalate`, payload);
  }
};

export default api;
