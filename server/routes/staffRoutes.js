import express from 'express';
import {
  getStaffDashboardStats,
  getStaffComplaints,
  getStaffComplaintById,
  updateStaffStatus,
  addStaffProgressUpdate,
  resolveStaffComplaint,
  escalateStaffComplaint,
  submitEmailChangeRequest,
  getEmailChangeRequestStatus
} from '../controllers/staffController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { complaintUpload } from '../middleware/upload.js';

const router = express.Router();

// Enforce authentication & Employee or Super Admin role
router.use(authenticateUser, requireRole('EMPLOYEE', 'SUPER_ADMIN'));

router.get('/dashboard/stats', getStaffDashboardStats);
router.get('/complaints', getStaffComplaints);
router.get('/complaints/:id', getStaffComplaintById);
router.patch('/complaints/:id/status', updateStaffStatus);
router.post('/complaints/:id/progress', complaintUpload, addStaffProgressUpdate);
router.post('/complaints/:id/resolve', complaintUpload, resolveStaffComplaint);
router.post('/complaints/:id/escalate', escalateStaffComplaint);

// Officer Email Change Requests
router.post('/email-change-request', submitEmailChangeRequest);
router.get('/email-change-request/status', getEmailChangeRequestStatus);

export default router;
