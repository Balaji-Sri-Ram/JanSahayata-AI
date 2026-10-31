import express from 'express';
import {
  registerCitizen,
  registerSendOtp,
  registerVerifyOtp,
  loginCitizen,
  loginStaff,
  getCurrentUser,
  logoutUser,
  firstTimeResetPassword,
  sendPasswordOtp,
  changePasswordWithOtp,
  sendCitizenCurrentEmailOtp,
  verifyCitizenCurrentEmailOtp,
  sendCitizenNewEmailOtp,
  confirmCitizenNewEmail,
  requestCitizenAdminEmailChange,
  getCitizenEmailChangeStatus
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerCitizen);
router.post('/register-send-otp', registerSendOtp);
router.post('/register-verify-otp', registerVerifyOtp);
router.post('/login', loginCitizen);
router.post('/staff-login', loginStaff);
router.get('/me', authenticateUser, getCurrentUser);
router.post('/logout', authenticateUser, logoutUser);

// Password Management (First-time reset & OTP verification)
router.post('/first-time-reset-password', authenticateUser, firstTimeResetPassword);
router.post('/send-password-otp', authenticateUser, sendPasswordOtp);
router.post('/change-password-with-otp', authenticateUser, changePasswordWithOtp);

// Citizen Email Change Management (Dual OTP & Admin Approval Fallback)
router.post('/citizen-email-change/send-current-otp', authenticateUser, sendCitizenCurrentEmailOtp);
router.post('/citizen-email-change/verify-current-otp', authenticateUser, verifyCitizenCurrentEmailOtp);
router.post('/citizen-email-change/send-new-otp', authenticateUser, sendCitizenNewEmailOtp);
router.post('/citizen-email-change/confirm-new-email', authenticateUser, confirmCitizenNewEmail);
router.post('/citizen-email-change/request-admin', authenticateUser, requestCitizenAdminEmailChange);
router.get('/citizen-email-change/status', authenticateUser, getCitizenEmailChangeStatus);

export default router;
