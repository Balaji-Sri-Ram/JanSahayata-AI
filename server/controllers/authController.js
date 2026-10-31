import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { Complaint } from '../models/Complaint.js';
import { EmailChangeRequest } from '../models/EmailChangeRequest.js';
import { 
  sendOtpVerificationEmail, 
  sendPasswordChangedConfirmation, 
  sendCitizenWelcomeEmail,
  sendAccountConfirmationOtpEmail,
  sendCitizenOldEmailChangeOtp,
  sendCitizenNewEmailVerificationOtp,
  sendCitizenEmailChangeDualNotice
} from '../services/emailService.js';
import { sendOtpSms, sendOtpWhatsApp, formatPhoneNumber, maskPhoneNumber } from '../services/messagingService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jansahayata_gov_secure_jwt_secret_key_2026_capstone_token';
const JWT_EXPIRES_IN = '7d';

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      departmentId: user.department?.id || null
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register (Public Citizen Registration)
 */
export const registerCitizen = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (name.trim().length < 3 || !/^[a-zA-Z\s.]+$/.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters and contain only letters, dots, and spaces.'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    let sanitizedPhone = '';
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/^(\+91|\+0|0)/, '').replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.'
        });
      }
      sanitizedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: sanitizedPhone,
      passwordHash,
      role: 'CITIZEN',
      status: 'Active'
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    // Audit Log
    await AuditLog.logAction({
      action: 'CITIZEN_REGISTERED',
      performedBy: { userId: savedUser._id, name: savedUser.name, email: savedUser.email, role: 'CITIZEN' },
      targetType: 'User',
      targetId: savedUser._id,
      details: `Citizen account registered for ${savedUser.name} (${savedUser.email})`,
      ipAddress: req.ip
    });

    const userObj = savedUser.toObject();
    delete userObj.passwordHash;

    // Send Official Citizen Welcome Email asynchronously with project highlights & guide
    sendCitizenWelcomeEmail({
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone || '',
      portalUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    }).catch(err => console.error('[sendCitizenWelcomeEmail async error]', err.message));

    return res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('[Register Citizen Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to register account.'
    });
  }
};

/**
 * POST /api/auth/login (Citizen Login)
 */
export const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const candidateEmails = [normalizedEmail];
    if (normalizedEmail === 'cizten@gmail.com') candidateEmails.push('citizen@gmail.com');
    if (normalizedEmail === 'citizen@gmail.com') candidateEmails.push('cizten@gmail.com');
    if (normalizedEmail.includes('citizen@jansahayata') || normalizedEmail.includes('citizen@janashayata')) {
      candidateEmails.push('citizen@gmail.com', 'cizten@gmail.com');
    }

    const user = await User.findOne({
      $or: [
        { email: { $in: candidateEmails } },
        { phone: email.trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.'
      });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.'
      });
    }

    const token = generateToken(user);

    // Audit Log
    await AuditLog.logAction({
      action: 'USER_LOGIN',
      performedBy: { userId: user._id, name: user.name, email: user.email, role: user.role },
      targetType: 'Authentication',
      targetId: user._id,
      details: `${user.role} logged in: ${user.name}`,
      ipAddress: req.ip
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('[Login Citizen Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to login.'
    });
  }
};

/**
 * POST /api/auth/staff-login (Government Employee & Super Admin Login)
 */
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Employee ID and password are required.'
      });
    }

    const identifier = email.trim().toLowerCase();
    const superAdminEnvEmail = process.env.SUPER_ADMIN_EMAIL ? process.env.SUPER_ADMIN_EMAIL.trim().toLowerCase() : null;
    
    const queryConditions = [
      { email: identifier },
      { employeeId: email.trim().toUpperCase() }
    ];
    
    // Allow logging in as Super Admin via either .env SUPER_ADMIN_EMAIL or default admin email
    if (superAdminEnvEmail && (identifier === superAdminEnvEmail || identifier === 'admin@jansahayata.gov.in')) {
      queryConditions.push({ role: 'SUPER_ADMIN' });
    }

    const user = await User.findOne({ $or: queryConditions });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account does not exist.'
      });
    }

    if (user.role === 'CITIZEN') {
      return res.status(403).json({
        success: false,
        message: 'This login portal is reserved for Government Officials and Super Administrators. Please use Citizen Login.'
      });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({
        success: false,
        message: 'This official account has been deactivated. Please contact the Super Administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or incorrect password.'
      });
    }

    const token = generateToken(user);

    // Audit Log
    await AuditLog.logAction({
      action: 'OFFICIAL_LOGIN',
      performedBy: { userId: user._id, name: user.name, email: user.email, role: user.role },
      targetType: 'Authentication',
      targetId: user._id,
      details: `Official (${user.role} - ${user.department?.name || 'All'}) logged in: ${user.name}`,
      ipAddress: req.ip
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Official authentication successful.',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('[Staff Login Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to authenticate official.'
    });
  }
};

/**
 * GET /api/auth/me (Get Authenticated User Profile)
 */
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('[getCurrentUser Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
};

/**
 * POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      await AuditLog.logAction({
        action: 'USER_LOGOUT',
        performedBy: { userId: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
        targetType: 'Authentication',
        targetId: req.user._id,
        details: `User logged out: ${req.user.name}`,
        ipAddress: req.ip
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    return res.status(200).json({ success: true });
  }
};

/**
 * POST /api/auth/first-time-reset-password (Mandatory First Login Password Change)
 */
export const firstTimeResetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.mustResetPassword = false;
    await user.save();

    await AuditLog.logAction({
      action: 'PASSWORD_RESET_FIRST_LOGIN',
      performedBy: { userId: user._id, name: user.name, email: user.email, role: user.role },
      targetType: 'User',
      targetId: user._id,
      details: `${user.role} ${user.name} successfully updated initial temporary password on first login`,
      ipAddress: req.ip
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! Welcome to the JanSahayata portal.',
      user: userObj
    });
  } catch (error) {
    console.error('[firstTimeResetPassword Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update password.'
    });
  }
};

/**
 * POST /api/auth/send-password-otp (Send 6-digit real-time OTP via Official Email)
 */
export const sendPasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expiresAt;
    await user.save();

    // Mask user email for privacy: e.g. j***a@example.com
    const emailParts = user.email.split('@');
    const namePart = emailParts[0];
    const domainPart = emailParts[1];
    const maskedName = namePart.length <= 2
      ? namePart[0] + '***'
      : namePart[0] + '***' + namePart.slice(-1);
    const maskedEmail = `${maskedName}@${domainPart}`;
    const destinationLabel = `official email (${maskedEmail})`;

    const dispatchResult = await sendOtpVerificationEmail({
      name: user.name,
      email: user.email,
      otp,
      reason: 'Account Password Change & Verification'
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your ${destinationLabel}.`,
      channel: 'email',
      destinationLabel,
      expiresInMinutes: 10,
      mode: dispatchResult?.mode
    });
  } catch (error) {
    console.error('[sendPasswordOtp Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch verification OTP.'
    });
  }
};

/**
 * POST /api/auth/change-password-with-otp (Verify OTP & Update Password)
 */
export const changePasswordWithOtp = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    if (!otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'OTP code, new password, and confirmation are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP verification code found. Please request a new code.'
      });
    }

    if (new Date() > new Date(user.resetPasswordOtpExpires)) {
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Verification OTP has expired (10 min validity). Please request a new code.'
      });
    }

    if (user.resetPasswordOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check the code sent to your registered email and try again.'
      });
    }

    // Hash and update password
    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    user.mustResetPassword = false;
    await user.save();

    await AuditLog.logAction({
      action: 'PASSWORD_CHANGED_WITH_OTP',
      performedBy: { userId: user._id, name: user.name, email: user.email, role: user.role },
      targetType: 'User',
      targetId: user._id,
      details: `${user.role} ${user.name} changed account password using verified real-time OTP`,
      ipAddress: req.ip
    });

    // Dispatch Security Alert Email via Gmail SMTP
    sendPasswordChangedConfirmation({
      name: user.name,
      email: user.email,
      role: user.role
    }).catch(err => console.error('[sendPasswordChangedConfirmation Error]', err));

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated! Your account security has been verified.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('[changePasswordWithOtp Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update password.'
    });
  }
};

/**
 * POST /api/auth/register-send-otp (Step 1: Validate Registration Details & Send Email Confirmation OTP)
 */
export const registerSendOtp = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and password are required.'
      });
    }

    if (name.trim().length < 3 || !/^[a-zA-Z\s.]+$/.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters and contain only letters, dots, and spaces.'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    let sanitizedPhone = '';
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/^(\+91|\+0|0)/, '').replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.'
        });
      }
      sanitizedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long with at least one numeric digit (0-9).'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if an ACTIVE user already exists with this email
    const existingActive = await User.findOne({ email: normalizedEmail, status: { $ne: 'Pending' } });
    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Generate 6-digit confirmation code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const passwordHash = await User.hashPassword(password);

    // Find or create pending user record
    let user = await User.findOne({ email: normalizedEmail, status: 'Pending' });
    if (user) {
      user.name = name.trim();
      user.phone = sanitizedPhone;
      user.passwordHash = passwordHash;
      user.emailVerificationOtp = otp;
      user.emailVerificationOtpExpires = otpExpires;
      await user.save();
    } else {
      user = new User({
        name: name.trim(),
        email: normalizedEmail,
        phone: sanitizedPhone,
        passwordHash,
        role: 'CITIZEN',
        status: 'Pending',
        emailVerificationOtp: otp,
        emailVerificationOtpExpires: otpExpires
      });
      await user.save();
    }

    // Send confirmation email
    const dispatchResult = await sendAccountConfirmationOtpEmail({
      name: user.name,
      email: user.email,
      otp
    });

    return res.status(200).json({
      success: true,
      message: `Account confirmation code sent to ${user.email}. Please verify to complete registration.`,
      previewOtp: dispatchResult?.mode === 'preview_mode' ? otp : undefined
    });
  } catch (error) {
    console.error('[registerSendOtp Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch registration confirmation code.'
    });
  }
};

/**
 * POST /api/auth/register-verify-otp (Step 2: Verify Confirmation Code & Activate Citizen Account)
 */
export const registerVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and verification code are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Registration session not found. Please start registration again.'
      });
    }

    if (user.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This account has already been confirmed and activated. Please log in.'
      });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification code found. Please request a new code.'
      });
    }

    if (new Date() > new Date(user.emailVerificationOtpExpires)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    if (user.emailVerificationOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check the 6-digit code sent to your email.'
      });
    }

    // Activate citizen account
    user.status = 'Active';
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpires = null;
    await user.save();

    const token = generateToken(user);

    // Audit Log
    await AuditLog.logAction({
      action: 'CITIZEN_REGISTERED_AND_CONFIRMED',
      performedBy: { userId: user._id, name: user.name, email: user.email, role: 'CITIZEN' },
      targetType: 'User',
      targetId: user._id,
      details: `Citizen account confirmed via email OTP and activated for ${user.name} (${user.email})`,
      ipAddress: req.ip
    });

    // Send Welcome Email
    sendCitizenWelcomeEmail({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      portalUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    }).catch(err => console.error('[sendCitizenWelcomeEmail async error]', err.message));

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.emailVerificationOtp;
    delete userObj.emailVerificationOtpExpires;

    return res.status(201).json({
      success: true,
      message: 'Account confirmed and activated successfully! Welcome to JanSahayata.',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('[registerVerifyOtp Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify account confirmation code.'
    });
  }
};

/**
 * POST /api/auth/citizen-email-change/send-current-otp
 * Step 1: Send OTP to citizen's CURRENT registered email
 */
export const sendCitizenCurrentEmailOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.currentEmailOtp = otp;
    user.currentEmailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailChangeCurrentVerified = false;
    await user.save();

    const dispatchResult = await sendCitizenOldEmailChangeOtp({
      name: user.name,
      email: user.email,
      otp
    });

    return res.status(200).json({
      success: true,
      message: `Security authorization code sent to your current email (${user.email}).`,
      previewOtp: dispatchResult?.mode === 'preview_mode' ? otp : undefined
    });
  } catch (error) {
    console.error('[sendCitizenCurrentEmailOtp Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send security code.' });
  }
};

/**
 * POST /api/auth/citizen-email-change/verify-current-otp
 * Step 1 Verify: Verify OTP from current email
 */
export const verifyCitizenCurrentEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Verification code is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.currentEmailOtp || !user.currentEmailOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active email change request. Please request a new code.' });
    }

    if (new Date() > new Date(user.currentEmailOtpExpires)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.currentEmailOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your current inbox.' });
    }

    user.emailChangeCurrentVerified = true;
    user.currentEmailOtp = null;
    user.currentEmailOtpExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Current email successfully verified. Please enter your new email address.'
    });
  } catch (error) {
    console.error('[verifyCitizenCurrentEmailOtp Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to verify current email code.' });
  }
};

/**
 * POST /api/auth/citizen-email-change/send-new-otp
 * Step 2: Send OTP to citizen's NEW email address
 */
export const sendCitizenNewEmailOtp = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) {
      return res.status(400).json({ success: false, message: 'New email address is required.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanNewEmail = newEmail.trim().toLowerCase();
    if (!emailRegex.test(cleanNewEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (cleanNewEmail === user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'The new email cannot be the same as your currently registered email.'
      });
    }

    // Check if new email is in use by another user
    const existing = await User.findOne({ email: cleanNewEmail, _id: { $ne: user._id } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered to another account.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.pendingNewEmail = cleanNewEmail;
    user.newEmailOtp = otp;
    user.newEmailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const dispatchResult = await sendCitizenNewEmailVerificationOtp({
      name: user.name,
      email: cleanNewEmail,
      otp
    });

    return res.status(200).json({
      success: true,
      message: `Verification code sent to your new email (${cleanNewEmail}).`,
      previewOtp: dispatchResult?.mode === 'preview_mode' ? otp : undefined
    });
  } catch (error) {
    console.error('[sendCitizenNewEmailOtp Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send new email verification code.' });
  }
};

/**
 * POST /api/auth/citizen-email-change/confirm-new-email
 * Step 3: Verify OTP from new email & complete email change
 */
export const confirmCitizenNewEmail = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) {
      return res.status(400).json({ success: false, message: 'New email and verification code are required.' });
    }

    const cleanNewEmail = newEmail.trim().toLowerCase();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.emailChangeCurrentVerified) {
      return res.status(403).json({
        success: false,
        message: 'Security authorization required: You must first verify the code sent to your current email.'
      });
    }

    if (!user.pendingNewEmail || user.pendingNewEmail !== cleanNewEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email does not match pending verification session. Please request a new code.'
      });
    }

    if (!user.newEmailOtp || !user.newEmailOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active code found. Please request a new code.' });
    }

    if (new Date() > new Date(user.newEmailOtpExpires)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.newEmailOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code for your new email address.' });
    }

    // Check again for conflict
    const conflict = await User.findOne({ email: cleanNewEmail, _id: { $ne: user._id } });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This email is already in use by another account.' });
    }

    const oldEmail = user.email;

    // Apply change
    user.email = cleanNewEmail;
    user.pendingNewEmail = null;
    user.newEmailOtp = null;
    user.newEmailOtpExpires = null;
    user.emailChangeCurrentVerified = false;
    await user.save();

    // Update complaints associated with citizen's old email
    await Complaint.updateMany(
      { 'citizenDetails.email': oldEmail },
      { $set: { 'citizenDetails.email': cleanNewEmail } }
    );

    // Audit Log
    await AuditLog.logAction({
      action: 'CITIZEN_EMAIL_UPDATED_DUAL_OTP',
      performedBy: { userId: user._id, name: user.name, email: cleanNewEmail, role: 'CITIZEN' },
      targetType: 'User',
      targetId: user._id,
      details: `Citizen ${user.name} changed registered email via dual-OTP verification: ${oldEmail} -> ${cleanNewEmail}`,
      ipAddress: req.ip
    });

    // Send dual notification emails
    sendCitizenEmailChangeDualNotice({
      name: user.name,
      oldEmail,
      newEmail: cleanNewEmail,
      adminApproved: false
    }).catch(err => console.error('[sendCitizenEmailChangeDualNotice Error]', err));

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      success: true,
      message: `Email address successfully updated to ${cleanNewEmail}!`,
      token,
      user: userObj
    });
  } catch (error) {
    console.error('[confirmCitizenNewEmail Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update email address.' });
  }
};

/**
 * POST /api/auth/citizen-email-change/request-admin
 * Fallback: If old email is lost / inaccessible, submit request to Super Admin
 */
export const requestCitizenAdminEmailChange = async (req, res) => {
  try {
    const { requestedEmail, contactPhone, reason, newEmailOtp } = req.body;

    if (!requestedEmail || !reason) {
      return res.status(400).json({
        success: false,
        message: 'New email address and official explanation reason are required.'
      });
    }

    const cleanRequested = requestedEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanRequested)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid new email address.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (cleanRequested === user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'The requested new email cannot be the same as your currently registered email.'
      });
    }

    // Check if new email is in use
    const conflict = await User.findOne({ email: cleanRequested, _id: { $ne: user._id } });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This email is already in use by another account.'
      });
    }

    // Verify new email OTP if provided
    if (newEmailOtp) {
      if (!user.pendingNewEmail || user.pendingNewEmail !== cleanRequested || user.newEmailOtp !== String(newEmailOtp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code for your new email address.'
        });
      }
    }

    // Check for existing pending request
    const existingReq = await EmailChangeRequest.findOne({
      user: user._id,
      status: 'PENDING'
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active email change request pending Super Admin review.'
      });
    }

    const newRequest = new EmailChangeRequest({
      role: 'CITIZEN',
      user: user._id,
      citizenName: user.name,
      currentEmail: user.email,
      requestedEmail: cleanRequested,
      contactPhone: contactPhone ? contactPhone.trim() : user.phone,
      reason: reason.trim(),
      status: 'PENDING'
    });

    await newRequest.save();

    await AuditLog.logAction({
      action: 'CITIZEN_EMAIL_CHANGE_REQUESTED',
      performedBy: { userId: user._id, name: user.name, email: user.email, role: 'CITIZEN' },
      targetType: 'EmailChangeRequest',
      targetId: newRequest._id,
      details: `Citizen ${user.name} submitted email change request (Current: ${user.email} -> Requested: ${cleanRequested}). Reason: ${reason}`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Email change request successfully submitted to the Super Administrator for approval.',
      data: newRequest
    });
  } catch (error) {
    console.error('[requestCitizenAdminEmailChange Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit email change request.'
    });
  }
};

/**
 * GET /api/auth/citizen-email-change/status
 * Check existing request status
 */
export const getCitizenEmailChangeStatus = async (req, res) => {
  try {
    const request = await EmailChangeRequest.findOne({
      user: req.user._id,
      status: 'PENDING'
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: request || null
    });
  } catch (error) {
    console.error('[getCitizenEmailChangeStatus Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve request status.' });
  }
};
