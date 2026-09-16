import express from 'express';
import {
  createComplaint,
  getComplaintsByCitizen,
  getComplaintById,
  verifyResolution,
  disputeResolution
} from '../controllers/complaintController.js';
import { complaintUpload } from '../middleware/upload.js';

const router = express.Router();

// Citizen routes
router.post('/', complaintUpload, createComplaint);
router.get('/citizen/:citizenId', getComplaintsByCitizen);
router.get('/:id', getComplaintById);
router.post('/:id/verify-resolution', verifyResolution);
router.post('/:id/dispute', complaintUpload, disputeResolution);

export default router;
