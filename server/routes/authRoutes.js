import express from 'express';
import {
  registerCitizen,
  loginCitizen,
  loginStaff,
  getCurrentUser,
  logoutUser,
  firstTimeResetPassword,
  sendPasswordOtp,
  changePasswordWithOtp
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerCitizen);
router.post('/login', loginCitizen);
router.post('/staff-login', loginStaff);
router.get('/me', authenticateUser, getCurrentUser);
router.post('/logout', authenticateUser, logoutUser);

// Password Management (First-time reset & OTP verification)
router.post('/first-time-reset-password', authenticateUser, firstTimeResetPassword);
router.post('/send-password-otp', authenticateUser, sendPasswordOtp);
router.post('/change-password-with-otp', authenticateUser, changePasswordWithOtp);

export default router;
