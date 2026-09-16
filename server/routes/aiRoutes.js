import express from 'express';
import { previewAiAnalysis } from '../controllers/complaintController.js';
import { DEPARTMENTS } from '../config/departments.js';

const router = express.Router();

router.post('/preview-analysis', previewAiAnalysis);
router.get('/departments', (req, res) => {
  res.json({
    success: true,
    data: Object.values(DEPARTMENTS)
  });
});

export default router;
