import express from 'express';
import {
  getAdminDashboardStats,
  syncPlatformData,
  getEmployees,
  createEmployee,
  updateEmployee,
  getCitizens,
  updateCitizenStatus,
  getAllComplaints,
  reassignComplaintDepartment,
  adminEscalateComplaint,
  getAuditLogs,
  getDepartmentsDirectory,
  getEmailChangeRequests,
  approveEmailChangeRequest,
  rejectEmailChangeRequest
} from '../controllers/adminController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication & Super Admin role on all admin routes
router.use(authenticateUser, requireRole('SUPER_ADMIN'));

router.get('/dashboard/stats', getAdminDashboardStats);
router.post('/sync-data', syncPlatformData);
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.patch('/employees/:id', updateEmployee);

router.get('/citizens', getCitizens);
router.patch('/citizens/:id/status', updateCitizenStatus);

router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/reassign', reassignComplaintDepartment);
router.post('/complaints/:id/escalate', adminEscalateComplaint);

router.get('/audit-logs', getAuditLogs);
router.get('/departments', getDepartmentsDirectory);

// Officer Email Change Requests
router.get('/email-change-requests', getEmailChangeRequests);
router.patch('/email-change-requests/:id/approve', approveEmailChangeRequest);
router.patch('/email-change-requests/:id/reject', rejectEmailChangeRequest);

export default router;
