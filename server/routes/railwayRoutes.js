import express from 'express';
import {
  getRailwayComplaints,
  getRailwayComplaintById,
  updateRailwayStatus,
  addRailwayProgressUpdate,
  resolveRailwayComplaint,
  escalateRailwayComplaint,
  getRailwayDashboardStats
} from '../controllers/complaintController.js';
import { complaintUpload } from '../middleware/upload.js';

const router = express.Router();

// Railway Department routes
router.get('/dashboard/stats', getRailwayDashboardStats);
router.get('/complaints', getRailwayComplaints);
router.get('/complaints/:id', getRailwayComplaintById);
router.patch('/complaints/:id/status', updateRailwayStatus);
router.post('/complaints/:id/progress', complaintUpload, addRailwayProgressUpdate);
router.post('/complaints/:id/resolve', complaintUpload, resolveRailwayComplaint);
router.post('/complaints/:id/escalate', escalateRailwayComplaint);

export default router;
