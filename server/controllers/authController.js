import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { sendOtpVerificationEmail, sendPasswordChangedConfirmation } from '../services/emailService.js';
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
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
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
 * POST /api/auth/send-password-otp (Send 6-digit real-time OTP via Email, SMS, or WhatsApp)
 */
export const sendPasswordOtp = async (req, res) => {
  try {
    const { channel = 'email', phone } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If a phone number is provided, update user record if not previously present
    if (phone && phone.trim()) {
      user.phone = phone.trim();
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expiresAt;
    await user.save();

    let dispatchResult = null;
    let destinationLabel = '';

    if (channel === 'whatsapp') {
      const targetPhone = user.phone;
      if (!targetPhone) {
        return res.status(400).json({
          success: false,
          message: 'A valid WhatsApp mobile number is required. Please provide your phone number.'
        });
      }
      dispatchResult = await sendOtpWhatsApp({
        phone: targetPhone,
        otp,
        name: user.name
      });
      destinationLabel = `WhatsApp message (${dispatchResult.maskedDestination || maskPhoneNumber(targetPhone)})`;
    } else if (channel === 'sms') {
      const targetPhone = user.phone;
      if (!targetPhone) {
        return res.status(400).json({
          success: false,
          message: 'A valid mobile number is required for SMS delivery. Please provide your phone number.'
        });
      }
      dispatchResult = await sendOtpSms({
        phone: targetPhone,
        otp,
        name: user.name
      });
      destinationLabel = `SMS message (${dispatchResult.maskedDestination || maskPhoneNumber(targetPhone)})`;
    } else {
      // Default: Email delivery via Gmail SMTP
      dispatchResult = await sendOtpVerificationEmail({
        name: user.name,
        email: user.email,
        otp,
        reason: 'Account Password Change & Verification'
      });

      // Mask user email for privacy: e.g. j***a@example.com
      const emailParts = user.email.split('@');
      const namePart = emailParts[0];
      const domainPart = emailParts[1];
      const maskedName = namePart.length <= 2
        ? namePart[0] + '***'
        : namePart[0] + '***' + namePart.slice(-1);
      const maskedEmail = `${maskedName}@${domainPart}`;
      destinationLabel = `official email (${maskedEmail})`;
    }

    return res.status(200).json({
      success: true,
      message: dispatchResult?.liveError
        ? `Provider alert: ${dispatchResult.liveError}. (Displayed in simulator below)`
        : `A 6-digit verification code has been dispatched to your ${destinationLabel}.`,
      channel,
      destinationLabel,
      expiresInMinutes: 10,
      mode: dispatchResult?.mode,
      liveError: dispatchResult?.liveError,
      previewOtp: dispatchResult?.mode === 'preview_mode' ? otp : undefined
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
