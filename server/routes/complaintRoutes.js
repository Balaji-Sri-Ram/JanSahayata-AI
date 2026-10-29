import express from 'express';
import {
  createComplaint,
  getComplaintsByCitizen,
  getComplaintById,
  verifyResolution,
  disputeResolution
} from '../controllers/complaintController.js';
import { complaintUpload } from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Citizen routes
router.post('/', optionalAuth, complaintUpload, createComplaint);
router.get('/citizen/:citizenId', optionalAuth, getComplaintsByCitizen);
router.get('/:id', optionalAuth, getComplaintById);
router.post('/:id/verify-resolution', optionalAuth, verifyResolution);
router.post('/:id/dispute', optionalAuth, complaintUpload, disputeResolution);

export default router;
