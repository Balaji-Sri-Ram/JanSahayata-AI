import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer Transporter
 * - If GMAIL_USER and GMAIL_APP_PASSWORD are set in .env, sends directly via Gmail SMTP.
 * - Otherwise, operates in Development Mode with full terminal logging.
 */
const getSenderAddress = () => {
  const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;
  if (gmailUser) {
    return `"Government of India • JanSahayata (CPGRAMS)" <${gmailUser}>`;
  }
  return process.env.EMAIL_FROM || '"Government of India • JanSahayata" <no-reply@jansahayata.gov.in>';
};

const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;
  const rawPass = process.env.GMAIL_APP_PASSWORD || '';
  const gmailPass = rawPass.replace(/\s+/g, '');

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }

  // Fallback / Development SMTP (Ethereal test or console)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
      pass: process.env.SMTP_PASS || 'ethereal_password'
    }
  });
};

/**
 * Send Official Government Onboarding Email with Temporary Credentials
 */
export const sendOfficerWelcomeEmail = async ({
  name,
  email,
  employeeId,
  departmentName,
  designation,
  temporaryPassword,
  loginUrl = 'http://localhost:5173/staff/login'
}) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Credential Issuance - JanSahayata (CPGRAMS)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 24px 28px; }
    .top-strip { font-size: 11px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; }
    .brand-sub { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 4px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 13px; color: #475569; margin-bottom: 24px; }
    .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-value { color: #0f172a; font-weight: 700; }
    .temp-pass-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; text-align: center; margin: 20px 0; }
    .temp-pass-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #92400e; letter-spacing: 0.5px; margin-bottom: 4px; }
    .temp-pass-val { font-family: monospace; font-size: 18px; font-weight: 800; color: #78350f; letter-spacing: 1px; }
    .action-wrap { text-align: center; margin: 28px 0; }
    .action-btn { display: inline-block; background: #0b2545; color: #ffffff !important; padding: 12px 32px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px; }
    .security-note { font-size: 11px; color: #64748b; background: #eff6ff; border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-top: 24px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 20px 28px; text-align: center; line-height: 1.5; border-top: 1px solid #163b6b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <div class="top-strip">भारत सरकार | Government of India • DARPG</div>
      <h1 class="brand-title">JanSahayata <span style="font-size: 16px; font-weight: normal; color: #93c5fd;">जनसहायता</span></h1>
      <div class="brand-sub">Centralized Public Grievance Redress and Monitoring System (CPGRAMS)</div>
    </div>

    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="font-size: 10px; color: #475569; font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: 700;">
          DISPATCH REF: GOI/DARPG/JNS/2026/OFF-${employeeId}
        </span>
        <span style="font-size: 10px; color: #046a38; font-weight: 700;">
          CONFIDENTIAL • AUTHORIZED PERSONNEL
        </span>
      </div>

      <div class="greeting">Official Credential Issuance Notice</div>
      <p class="intro">
        Dear <strong>${name}</strong>,<br>
        Under the authority of the Ministry of Personnel, Public Grievances & Pensions (DARPG), you have been designated as a Departmental Grievance Officer on the JanSahayata CPGRAMS Portal. Below are your authorized administrative credentials.
      </p>

      <div class="card-box">
        <div class="detail-row">
          <span class="detail-label">Designated Officer:</span>
          <span class="detail-value">${name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Official Employee ID:</span>
          <span class="detail-value" style="font-family: monospace; color: #0b2545;">${employeeId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Assigned Department:</span>
          <span class="detail-value">${departmentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Official Designation:</span>
          <span class="detail-value">${designation || 'Grievance Redressal Officer'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Official Login Email:</span>
          <span class="detail-value" style="font-family: monospace;">${email}</span>
        </div>
      </div>

      <div class="temp-pass-box">
        <div class="temp-pass-label">Your Temporary Access Password</div>
        <div class="temp-pass-val">${temporaryPassword}</div>
      </div>

      <div class="action-wrap">
        <a href="${loginUrl}" class="action-btn" target="_blank">
          Access Official Portal & Set New Password →
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        Direct URL: <a href="${loginUrl}" style="color: #0b2545; word-break: break-all;">${loginUrl}</a>
      </p>

      <div class="security-note">
        <strong>Confidentiality & Security Directive:</strong> This temporary access password was generated automatically by the Central Government cryptographic engine. Even the Super Administrator or onboarding personnel <strong>do not have visibility of or access to this password</strong>. It is delivered exclusively to your personal inbox. Upon logging in for the first time, you will be mandated to configure your confidential permanent password.
      </div>
    </div>

    <div class="footer">
      This is an automated official transmission from the Ministry of Personnel, Public Grievances & Pensions.<br>
      © 2026 JanSahayata Grievance Intelligence Directorate • Government of India. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const plainTextContent = `Hello ${name},

You have been registered as an authorized Grievance Redressal Officer on the JanSahayata Government Portal.

Your Official Credentials:
- Official Employee ID: ${employeeId}
- Assigned Department: ${departmentName}
- Official Designation: ${designation || 'Grievance Redressal Officer'}
- Official Login Email: ${email}
- Temporary Initial Password: ${temporaryPassword}

Direct Login Portal: ${loginUrl}

Mandatory Security Notice:
This temporary password was generated automatically by the system. Administrators do not have access to this password. You will be prompted to set your permanent private password immediately upon your first sign-in.

Government of India • Ministry of Personnel, Public Grievances & Pensions
JanSahayata Grievance Redressal Directorate`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Portal: Authorized Officer Credentials (${employeeId})`,
      text: plainTextContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'JanSahayata Government Portal Mailer',
        'X-Priority': '3'
      }
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Live Gmail sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      // In development mode when Gmail app password is not configured in .env, log credentials cleanly
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE]`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Temporary Password: ${temporaryPassword}`);
      console.log(`Login URL: ${loginUrl}`);
      console.log(`(Configure GMAIL_USER and GMAIL_APP_PASSWORD in server/.env for live inbox dispatch)`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode', temporaryPassword, email };
    }
  } catch (error) {
    console.error('[sendOfficerWelcomeEmail Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Real-Time 6-Digit OTP Email for Password Change
 */
export const sendOtpVerificationEmail = async ({
  name,
  email,
  otp
}) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Security Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .brand-title { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 28px 24px; text-align: center; }
    .otp-box { background: #f8fafc; border: 2px dashed #0b2545; border-radius: 10px; padding: 18px; margin: 24px auto; max-width: 280px; }
    .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; color: #0b2545; letter-spacing: 6px; }
    .security-note { font-size: 11px; color: #64748b; background: #fef2f2; border-left: 3px solid #ef4444; padding: 10px 14px; text-align: left; border-radius: 0 6px 6px 0; margin-top: 24px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <h1 class="brand-title">JanSahayata | Security Verification</h1>
      <p style="margin: 4px 0 0; font-size: 11px; color: #f59e0b;">Government of India • Central Public Grievance Directorate</p>
    </div>

    <div class="content">
      <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 8px;">Password Change Authorization</h2>
      <p style="font-size: 13px; color: #475569; margin: 0;">
        Hello <strong>${name}</strong>,<br>
        A request was made to change the password for your account associated with <strong>${email}</strong>. Use the one-time verification code below to authorize this change:
      </p>

      <div class="otp-box">
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Your 6-Digit Verification OTP</div>
        <div class="otp-code">${otp}</div>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">
        ⏱ This verification code is valid for <strong>10 minutes</strong> only.
      </p>

      <div class="security-note">
        <strong>Security Alert:</strong> If you did not initiate this password change request, please contact the Super Administrator immediately. Never share your OTP with anyone.
      </div>
    </div>

    <div class="footer">
      © 2026 JanSahayata Grievance Intelligence Directorate • Government of India
    </div>
  </div>
</body>
</html>
    `;

    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const plainTextContent = `Hello ${name},

Your one-time verification code (OTP) for JanSahayata password update is:

${otp}

This verification code is valid for 10 minutes only.

If you did not initiate this request, please contact your portal administrator immediately.

Government of India • JanSahayata Grievance Redressal Portal`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Verification Code: ${otp}`,
      text: plainTextContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'JanSahayata Government Portal Mailer',
        'X-Priority': '3'
      }
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Live OTP sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE OTP]`);
      console.log(`To: ${email}`);
      console.log(`One-Time Password (OTP): ${otp}`);
      console.log(`Valid for 10 minutes`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode', otp, email };
    }
  } catch (error) {
    console.error('[sendOtpVerificationEmail Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Citizen Registration Email Confirmation OTP
 */
export const sendAccountConfirmationOtpEmail = async ({
  name,
  email,
  otp
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Citizen Account Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .brand-title { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 28px 24px; text-align: center; }
    .otp-box { background: #f8fafc; border: 2px dashed #0b2545; border-radius: 10px; padding: 18px; margin: 24px auto; max-width: 280px; }
    .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; color: #0b2545; letter-spacing: 6px; }
    .security-note { font-size: 11px; color: #64748b; background: #f0fdf4; border-left: 3px solid #22c55e; padding: 10px 14px; text-align: left; border-radius: 0 6px 6px 0; margin-top: 24px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <h1 class="brand-title">JanSahayata | Account Confirmation</h1>
      <p style="margin: 4px 0 0; font-size: 11px; color: #f59e0b;">Government of India • Central Public Grievance Directorate (CPGRAMS)</p>
    </div>

    <div class="content">
      <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 8px;">Verify Your Email Address</h2>
      <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
        Hello <strong>${name}</strong>,<br>
        Thank you for creating an account on the <strong>JanSahayata Public Grievance Portal</strong>. Please enter the 6-digit confirmation code below to verify your email and activate your citizen account:
      </p>

      <div class="otp-box">
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Account Confirmation Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">
        ⏱ This verification code is valid for <strong>10 minutes</strong>.
      </p>

      <div class="security-note">
        <strong>Security Notice:</strong> JanSahayata will never ask for your password or verification code over the phone or email. Do not share this OTP with anyone.
      </div>
    </div>

    <div class="footer">
      © 2026 JanSahayata Citizen Redressal Directorate • Government of India
    </div>
  </div>
</body>
</html>
    `;

    const plainTextContent = `Hello ${name},

Your 6-digit verification code to confirm and activate your JanSahayata citizen account is:

${otp}

This verification code is valid for 10 minutes only.

Government of India • JanSahayata Citizen Grievance Portal`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Account Confirmation Code: ${otp}`,
      text: plainTextContent,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Registration confirmation OTP sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE CITIZEN REGISTRATION OTP]`);
      console.log(`To: ${email}`);
      console.log(`Citizen: ${name}`);
      console.log(`Account Confirmation OTP: ${otp}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode', otp, email };
    }
  } catch (error) {
    console.error('[sendAccountConfirmationOtpEmail Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Citizen OLD Email Change Authorization OTP
 */
export const sendCitizenOldEmailChangeOtp = async ({
  name,
  email,
  otp
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Email Change Security Authorization</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .brand-title { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 28px 24px; text-align: center; }
    .otp-box { background: #f8fafc; border: 2px dashed #0b2545; border-radius: 10px; padding: 18px; margin: 24px auto; max-width: 280px; }
    .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; color: #0b2545; letter-spacing: 6px; }
    .security-note { font-size: 11px; color: #991b1b; background: #fef2f2; border-left: 3px solid #ef4444; padding: 10px 14px; text-align: left; border-radius: 0 6px 6px 0; margin-top: 24px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <h1 class="brand-title">JanSahayata | Security Authorization</h1>
      <p style="margin: 4px 0 0; font-size: 11px; color: #f59e0b;">Government of India • Central Public Grievance Directorate (CPGRAMS)</p>
    </div>

    <div class="content">
      <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 8px;">Authorize Email Address Change</h2>
      <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
        Hello <strong>${name}</strong>,<br>
        A request has been initiated to update the registered email address for your citizen account. Please enter the following 6-digit security code to authorize access from your current email (<strong>${email}</strong>):
      </p>

      <div class="otp-box">
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Current Email Authorization Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">
        ⏱ This authorization code is valid for <strong>10 minutes</strong>.
      </p>

      <div class="security-note">
        <strong>Security Warning:</strong> If you did not initiate this email change request, please change your password immediately or alert the Super Administrator. Never share this code.
      </div>
    </div>

    <div class="footer">
      © 2026 JanSahayata Citizen Redressal Directorate • Government of India
    </div>
  </div>
</body>
</html>
    `;

    const plainTextContent = `Hello ${name},

A request was initiated to update your citizen email address. Your security code is:

${otp}

Valid for 10 minutes. If you did not initiate this change, contact the portal administrator immediately.

Government of India • JanSahayata`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Email Change Security Code: ${otp}`,
      text: plainTextContent,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Old email change OTP sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE OLD EMAIL CHANGE OTP]`);
      console.log(`To Current Email: ${email}`);
      console.log(`Security Code: ${otp}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode', otp, email };
    }
  } catch (error) {
    console.error('[sendCitizenOldEmailChangeOtp Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Citizen NEW Email Verification OTP
 */
export const sendCitizenNewEmailVerificationOtp = async ({
  name,
  email,
  otp
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Verify New Email Address</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .brand-title { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 28px 24px; text-align: center; }
    .otp-box { background: #f8fafc; border: 2px dashed #0b2545; border-radius: 10px; padding: 18px; margin: 24px auto; max-width: 280px; }
    .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; color: #0b2545; letter-spacing: 6px; }
    .security-note { font-size: 11px; color: #047857; background: #ecfdf5; border-left: 3px solid #10b981; padding: 10px 14px; text-align: left; border-radius: 0 6px 6px 0; margin-top: 24px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <h1 class="brand-title">JanSahayata | Verify New Email Address</h1>
      <p style="margin: 4px 0 0; font-size: 11px; color: #f59e0b;">Government of India • Central Public Grievance Directorate (CPGRAMS)</p>
    </div>

    <div class="content">
      <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 8px;">Confirm New Email Inbox Access</h2>
      <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
        Hello <strong>${name}</strong>,<br>
        You have selected <strong>${email}</strong> as your new official citizen contact email. Enter the 6-digit verification code below in your JanSahayata portal to complete the email transfer:
      </p>

      <div class="otp-box">
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">New Email Verification Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">
        ⏱ This verification code is valid for <strong>10 minutes</strong>.
      </p>

      <div class="security-note">
        <strong>Information:</strong> Once verified, all future grievance tracking updates, OTPs, and notifications will be sent to this new email address.
      </div>
    </div>

    <div class="footer">
      © 2026 JanSahayata Citizen Redressal Directorate • Government of India
    </div>
  </div>
</body>
</html>
    `;

    const plainTextContent = `Hello ${name},

Your verification code to link ${email} to your JanSahayata citizen account is:

${otp}

Valid for 10 minutes.

Government of India • JanSahayata`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `Verify Your New JanSahayata Email Address: ${otp}`,
      text: plainTextContent,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] New email verification OTP sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE NEW EMAIL VERIFICATION OTP]`);
      console.log(`To New Email: ${email}`);
      console.log(`Verification Code: ${otp}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode', otp, email };
    }
  } catch (error) {
    console.error('[sendCitizenNewEmailVerificationOtp Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Dual Notifications for Citizen Email Change Success (to both old and new emails)
 */
export const sendCitizenEmailChangeDualNotice = async ({
  name,
  oldEmail,
  newEmail,
  adminApproved = false
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 1. Notice to OLD email
    const oldEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Citizen Email Address Updated</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .content { padding: 26px 24px; line-height: 1.6; }
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 12px; color: #991b1b; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <h1 style="font-size: 18px; margin: 0; color: #ffffff;">JanSahayata | Security Notification</h1>
      <p style="margin: 4px 0 0; font-size: 11px; color: #f59e0b;">Government of India • CPGRAMS</p>
    </div>
    <div class="content">
      <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 10px;">Registered Email Address Changed</h2>
      <p style="font-size: 13px; color: #475569; margin: 0;">
        Dear <strong>${name}</strong>,<br>
        This is an official confirmation that the registered email address for your JanSahayata Citizen Profile has been changed ${adminApproved ? 'with Super Administrator approval' : 'via dual-OTP verification'}.
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 12px;">
        <div><strong>Former Email:</strong> <span style="font-family: monospace; color: #b91c1c;">${oldEmail}</span></div>
        <div style="margin-top: 6px;"><strong>New Registered Email:</strong> <span style="font-family: monospace; color: #047857; font-weight: bold;">${newEmail}</span></div>
      </div>
      <div class="alert-box">
        <strong>Security Notice:</strong> This former email address (${oldEmail}) will no longer be able to log in to your account. If you did NOT authorize this change, please report it immediately to the national grievance helpline: <strong>1800-11-4000</strong>.
      </div>
    </div>
    <div class="footer">© 2026 JanSahayata Grievance Directorate • Government of India</div>
  </div>
</body>
</html>
    `;

    // 2. Notice to NEW email
    const newEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Email Address Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .content { padding: 26px 24px; line-height: 1.6; }
    .btn { display: inline-block; background: #ff671f; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 13px; margin-top: 14px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <h1 style="font-size: 18px; margin: 0; color: #ffffff;">JanSahayata | Email Update Confirmed</h1>
      <p style="margin: 4px 0 0; font-size: 11px; color: #f59e0b;">Government of India • CPGRAMS</p>
    </div>
    <div class="content">
      <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 10px;">Welcome to Your New Login Email</h2>
      <p style="font-size: 13px; color: #475569; margin: 0;">
        Dear <strong>${name}</strong>,<br>
        Your JanSahayata Citizen Profile has been successfully updated. All future grievance updates, department notices, and tracking notifications will now arrive at <strong>${newEmail}</strong>.
      </p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 12px; color: #166534;">
        ✓ Your citizen account is active and verified under <strong>${newEmail}</strong>.
      </div>
      <div style="text-align: center;">
        <a href="${clientUrl}/citizen/login" class="btn">Log In with New Email →</a>
      </div>
    </div>
    <div class="footer">© 2026 JanSahayata Grievance Directorate • Government of India</div>
  </div>
</body>
</html>
    `;

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      await Promise.allSettled([
        transporter.sendMail({
          from: sender,
          to: oldEmail,
          replyTo: gmailUser || sender,
          subject: 'JanSahayata Citizen Email Address Updated',
          html: oldEmailHtml
        }),
        transporter.sendMail({
          from: sender,
          to: newEmail,
          replyTo: gmailUser || sender,
          subject: 'JanSahayata New Email Address Confirmed',
          html: newEmailHtml
        })
      ]);
      console.log(`[EmailService] Dual citizen email change notices sent to ${oldEmail} and ${newEmail}`);
    } else {
      console.log(`[EmailService - DEV PREVIEW MODE] Dual citizen email change notices logged for ${oldEmail} -> ${newEmail}`);
    }
  } catch (error) {
    console.error('[sendCitizenEmailChangeDualNotice Error]', error.message);
  }
};

/**
 * Send Email Update Confirmation to the OLD Email Address
 */
export const sendEmailChangeOldAddressNotice = async ({
  officerName,
  employeeId,
  departmentName,
  oldEmail,
  newEmail,
  adminNotes = ''
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Official Email Transition Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 22px 26px; }
    .top-strip { font-size: 11px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .brand-title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; }
    .brand-sub { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 3px; }
    .content { padding: 28px 26px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-value { color: #0f172a; font-weight: 700; }
    .badge-old { color: #b91c1c; font-family: monospace; background: #fee2e2; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .badge-new { color: #047857; font-family: monospace; background: #d1fae5; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .security-alert { font-size: 11px; color: #991b1b; background: #fef2f2; border-left: 3px solid #ef4444; padding: 12px 14px; border-radius: 0 6px 6px 0; margin-top: 20px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 18px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <div class="top-strip">भारत सरकार | Government of India • DARPG</div>
      <h1 class="brand-title">JanSahayata <span style="font-size: 15px; font-weight: normal; color: #93c5fd;">जनसहायता</span></h1>
      <div class="brand-sub">Centralized Public Grievance Redress and Monitoring System (CPGRAMS)</div>
    </div>

    <div class="content">
      <div class="greeting">Official Email Transition Notification</div>
      <p style="font-size: 13px; color: #475569;">
        Dear <strong>${officerName}</strong>,<br>
        Your formal request to update the registered official email address associated with Employee ID <strong>${employeeId}</strong> has been <strong>APPROVED</strong> by the Super Administrator.
      </p>

      <div class="card-box">
        <div class="detail-row">
          <span class="detail-label">Designated Officer:</span>
          <span class="detail-value">${officerName} (${employeeId})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Department:</span>
          <span class="detail-value">${departmentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Previous Login Email:</span>
          <span class="detail-value"><span class="badge-old">${oldEmail}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">New Official Email:</span>
          <span class="detail-value"><span class="badge-new">${newEmail}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Effective Date:</span>
          <span class="detail-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
        </div>
        ${adminNotes ? `
        <div class="detail-row">
          <span class="detail-label">Admin Remarks:</span>
          <span class="detail-value" style="font-style: italic;">${adminNotes}</span>
        </div>` : ''}
      </div>

      <p style="font-size: 12px; color: #475569;">
        From this point onward, sign-in to the JanSahayata Grievance Portal using this former address (<code>${oldEmail}</code>) is disabled. Please log in using your newly confirmed email: <strong>${newEmail}</strong>. Your existing account password remains active.
      </p>

      <div class="security-alert">
        <strong>Security & Audit Directive:</strong> If you did not initiate or authorize this change, please report this immediately to the Super Administrator or Cyber Security Cell at DARPG, Government of India.
      </div>
    </div>

    <div class="footer">
      Automated Security Transmission • Government of India • JanSahayata Directorate<br>
      © 2026 Ministry of Personnel, Public Grievances & Pensions. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `Hello ${officerName},

Your request to change your official email address on JanSahayata (CPGRAMS) has been APPROVED by the Super Administrator.

Officer Details:
- Officer Name: ${officerName}
- Employee ID: ${employeeId}
- Department: ${departmentName}
- Previous Email: ${oldEmail}
- New Official Email: ${newEmail}
- Status: Transferred to New Address

Going forward, please log in using your new email: ${newEmail}. Your password remains unchanged.

If you did not request this update, contact your Super Administrator immediately.

Government of India • Ministry of Personnel, Public Grievances & Pensions`;

    const mailOptions = {
      from: sender,
      to: oldEmail,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Portal: Official Email Transition Notice (${employeeId})`,
      text: plainText,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Old Email transition alert sent to ${oldEmail}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE (OLD EMAIL NOTICE)]`);
      console.log(`To: ${oldEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Notice: Account transitioned to ${newEmail}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode' };
    }
  } catch (error) {
    console.error('[sendEmailChangeOldAddressNotice Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Email Update Confirmation to the NEW Email Address
 */
export const sendEmailChangeNewAddressNotice = async ({
  officerName,
  employeeId,
  departmentName,
  oldEmail,
  newEmail,
  adminNotes = '',
  loginUrl = 'http://localhost:5173/staff/login'
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JanSahayata Email Update Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 22px 26px; }
    .top-strip { font-size: 11px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .brand-title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; }
    .brand-sub { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 3px; }
    .content { padding: 28px 26px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .card-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed #dcfce7; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #166534; font-weight: 600; }
    .detail-value { color: #0f172a; font-weight: 700; }
    .action-wrap { text-align: center; margin: 26px 0; }
    .action-btn { display: inline-block; background: #0b2545; color: #ffffff !important; padding: 12px 30px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 18px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <div class="top-strip">भारत सरकार | Government of India • DARPG</div>
      <h1 class="brand-title">JanSahayata <span style="font-size: 15px; font-weight: normal; color: #93c5fd;">जनसहायता</span></h1>
      <div class="brand-sub">Centralized Public Grievance Redress and Monitoring System (CPGRAMS)</div>
    </div>

    <div class="content">
      <div class="greeting">Official Email Activation Confirmed</div>
      <p style="font-size: 13px; color: #475569;">
        Dear <strong>${officerName}</strong>,<br>
        This email confirms that <strong>${newEmail}</strong> has been successfully registered and verified as your primary official login address on the JanSahayata CPGRAMS Portal.
      </p>

      <div class="card-box">
        <div class="detail-row">
          <span class="detail-label">Officer Name:</span>
          <span class="detail-value">${officerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Official Employee ID:</span>
          <span class="detail-value" style="font-family: monospace; color: #0b2545;">${employeeId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Assigned Department:</span>
          <span class="detail-value">${departmentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Primary Login Email:</span>
          <span class="detail-value" style="font-family: monospace; color: #047857;">${newEmail}</span>
        </div>
        ${adminNotes ? `
        <div class="detail-row">
          <span class="detail-label">Approval Remarks:</span>
          <span class="detail-value" style="font-style: italic;">${adminNotes}</span>
        </div>` : ''}
      </div>

      <div class="action-wrap">
        <a href="${loginUrl}" class="action-btn" target="_blank">
          Sign In to Officer Portal →
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        Direct URL: <a href="${loginUrl}" style="color: #0b2545;">${loginUrl}</a>
      </p>

      <p style="font-size: 12px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
        <strong>Password Notice:</strong> Your existing account password remains active. You can now use your newly updated email along with your current password to access the portal.
      </p>
    </div>

    <div class="footer">
      Automated Official Transmission • Ministry of Personnel, Public Grievances & Pensions<br>
      © 2026 JanSahayata Grievance Intelligence Directorate • Government of India.
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `Hello ${officerName},

Your new official email address has been successfully approved and activated on JanSahayata (CPGRAMS).

Officer Details:
- Officer Name: ${officerName}
- Employee ID: ${employeeId}
- Department: ${departmentName}
- Primary Login Email: ${newEmail}

Portal Login URL: ${loginUrl}

Your existing account password remains unchanged. You can now sign in using this email address.

Government of India • Ministry of Personnel, Public Grievances & Pensions
JanSahayata Grievance Redressal Directorate`;

    const mailOptions = {
      from: sender,
      to: newEmail,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Portal: Official Email Updated Successfully (${employeeId})`,
      text: plainText,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] New Email activation notice sent to ${newEmail}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW MODE (NEW EMAIL NOTICE)]`);
      console.log(`To: ${newEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Confirmation: Email active for ${employeeId}`);
      console.log(`Login URL: ${loginUrl}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode' };
    }
  } catch (error) {
    console.error('[sendEmailChangeNewAddressNotice Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Security Alert when Account Password is changed
 */
export const sendPasswordChangedConfirmation = async ({
  name,
  email,
  role = 'User'
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;
    const timestampStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Alert: Account Password Updated</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .tricolor { height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 20px 24px; }
    .top-strip { font-size: 10px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .brand-title { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 26px 24px; }
    .status-badge { display: inline-flex; align-items: center; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
    .detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 12px; }
    .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-val { color: #0f172a; font-weight: 700; }
    .security-note { font-size: 11px; color: #991b1b; background: #fef2f2; border-left: 3px solid #ef4444; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-top: 18px; }
    .footer { background: #07172b; color: #94a3b8; font-size: 11px; padding: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <div class="top-strip">भारत सरकार | Government of India • DARPG</div>
      <h1 class="brand-title">JanSahayata <span style="font-size: 14px; font-weight: normal; color: #93c5fd;">जनसहायता</span></h1>
    </div>

    <div class="content">
      <div class="status-badge">✓ PASSWORD UPDATED SUCCESSFULLY</div>
      
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        Dear <strong>${name}</strong>,<br>
        This security alert confirms that your login password for the JanSahayata Government Portal account associated with <strong>${email}</strong> was updated on <strong>${timestampStr} IST</strong>.
      </p>

      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Account User:</span>
          <span class="detail-val">${name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registered Email:</span>
          <span class="detail-val" style="font-family: monospace;">${email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Verification Mode:</span>
          <span class="detail-val">Real-Time OTP Authorization</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Effective Time:</span>
          <span class="detail-val">${timestampStr} IST</span>
        </div>
      </div>

      <div class="security-note">
        <strong>Cybersecurity Directive:</strong> If you performed this password update, you can safely disregard this notice. If you did <strong>NOT</strong> authorize this change, your credentials may be compromised. Please contact the Super Administrator immediately to lock your account.
      </div>
    </div>

    <div class="footer">
      Automated Security Transmission • Government of India • JanSahayata Directorate<br>
      © 2026 Ministry of Personnel, Public Grievances & Pensions.
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `Hello ${name},

Your password for your JanSahayata (CPGRAMS) account (${email}) was successfully updated on ${timestampStr} IST.

If you performed this change, no action is needed.
If you did NOT perform this update, please report to your administrator immediately.

Government of India • Ministry of Personnel, Public Grievances & Pensions`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Security Alert: Password Updated (${name})`,
      text: plainText,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Password changed notice sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW (PASSWORD CHANGED NOTICE)]`);
      console.log(`To: ${email}`);
      console.log(`Notice: Password changed on ${timestampStr}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode' };
    }
  } catch (error) {
    console.error('[sendPasswordChangedConfirmation Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Citizen Welcome Email with Project Highlights & How to File a Complaint
 */
export const sendCitizenWelcomeEmail = async ({
  name,
  email,
  phone = '',
  portalUrl = 'http://localhost:5173'
}) => {
  try {
    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const fileComplaintUrl = `${portalUrl}/report`;
    const trackUrl = `${portalUrl}/track`;
    const dashboardUrl = `${portalUrl}/citizen/dashboard`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to JanSahayata - Centralized Public Grievance Portal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .tricolor { height: 5px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 28px 32px; text-align: left; }
    .top-strip { font-size: 11px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .brand-title { font-size: 26px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
    .brand-sub { font-size: 13px; color: #f59e0b; font-weight: 600; margin-top: 4px; }
    .badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }
    .content { padding: 32px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 13px; color: #475569; margin-bottom: 24px; }
    
    .hero-highlight { background: linear-gradient(135deg, #0b2545 0%, #163b6b 100%); border-radius: 10px; padding: 20px; color: #ffffff; margin-bottom: 28px; }
    .hero-highlight h3 { margin: 0 0 6px 0; font-size: 15px; color: #fbbf24; font-weight: 800; }
    .hero-highlight p { margin: 0; font-size: 12px; color: #e2e8f0; line-height: 1.5; }

    .pillars-grid { margin-bottom: 28px; }
    .pillar-item { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0b2545; border-radius: 6px; padding: 12px 16px; margin-bottom: 10px; }
    .pillar-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .pillar-desc { font-size: 12px; color: #64748b; margin: 0; }

    .action-container { text-align: center; margin: 32px 0 20px 0; }
    .btn-primary { display: inline-block; background: #e86100; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(232, 97, 0, 0.3); }
    .btn-secondary { display: inline-block; background: #0b2545; color: #ffffff !important; font-size: 12px; font-weight: 600; text-decoration: none; padding: 10px 22px; border-radius: 6px; margin-left: 8px; }

    .helpline-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; text-align: center; font-size: 12px; color: #1e3a8a; margin-top: 24px; }
    .helpline-box strong { color: #1d4ed8; }

    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <div class="top-strip">Government of India • Ministry of Personnel, Public Grievances & Pensions</div>
      <div class="brand-title">JanSahayata <span style="font-size: 20px; font-weight: 600; color: #f8fafc;">जनसहायता</span></div>
      <div class="brand-sub">Centralized Public Grievance Redress & Monitoring System (CPGRAMS)</div>
      <span class="badge">Citizen Portal Account Activated</span>
    </div>

    <div class="content">
      <div class="greeting">Welcome, ${name}!</div>
      <div class="intro">
        Thank you for joining <strong>JanSahayata</strong>, the official single-window grievance platform of the Government of India. Your citizen account (<code>${email}</code>) has been successfully activated.
      </div>

      <div class="hero-highlight">
        <h3>🏛️ What is JanSahayata?</h3>
        <p>JanSahayata directly connects citizens to central and state government departments without intermediaries. Whether it's railway cleanliness, road damage, open drains, water leakage, or power outages — your voice is routed immediately to responsible field officers.</p>
      </div>

      <div style="font-size: 13px; font-weight: 800; color: #0b2545; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        Key Grievance Redressal Guarantees:
      </div>

      <div class="pillars-grid">
        <div class="pillar-item" style="border-left-color: #e86100;">
          <div class="pillar-title">1. Direct Department Routing (No Middlemen)</div>
          <p class="pillar-desc">Your complaint is analyzed with AI and instantly assigned to local executive engineers and station superintendents.</p>
        </div>

        <div class="pillar-item" style="border-left-color: #2563eb;">
          <div class="pillar-title">2. Guaranteed Resolution Time Limits (24–72 Hours)</div>
          <p class="pillar-desc">Every ticket has a strict Citizen Charter SLA. Unattended complaints automatically escalate to senior directorates.</p>
        </div>

        <div class="pillar-item" style="border-left-color: #046a38;">
          <div class="pillar-title">3. Photo Proof of Completed Work Required</div>
          <p class="pillar-desc">Government officers cannot close tickets with text only. They must upload field photos showing the problem resolved.</p>
        </div>

        <div class="pillar-item" style="border-left-color: #f59e0b;">
          <div class="pillar-title">4. Citizen Closes the Complaint</div>
          <p class="pillar-desc">You inspect the proof photos. If satisfied, you approve closure. If not, reopen or dispute with 1-click.</p>
        </div>
      </div>

      <div style="background: #f1f5f9; border-radius: 8px; padding: 18px; margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
          📝 How to File a Grievance in 3 Simple Steps:
        </div>
        <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.8;">
          <li>Click <strong>"File a Grievance"</strong> below.</li>
          <li>Describe the issue in your own words, speak an audio note, or snap photos of the problem.</li>
          <li>Submit to receive an instant <strong>Unique Tracking ID (JNS-2026-XXXXXX)</strong> to monitor live 24x7 progress.</li>
        </ol>
      </div>

      <div class="action-container">
        <a href="${fileComplaintUrl}" class="btn-primary">File a Grievance Now →</a>
        <a href="${dashboardUrl}" class="btn-secondary">My Citizen Dashboard</a>
      </div>

      <div class="helpline-box">
        📞 <strong>24x7 National Toll-Free Grievance Helpline:</strong> 1800-11-4000 &bull; Railway: 139 &bull; Emergency: 112
      </div>
    </div>

    <div class="footer">
      Government of India &bull; Department of Administrative Reforms & Public Grievances (DARPG)<br>
      Centralized Public Grievance Redress And Monitoring System (CPGRAMS)<br>
      This is an official system-generated notification sent to ${email}.
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `Welcome to JanSahayata, ${name}!

Your citizen account (${email}) has been activated.

JanSahayata (CPGRAMS) is the official public grievance portal of the Government of India.
Report civic issues directly to government departments (Railways, Municipal Corporation, Water, Roads, Electricity, etc.) and track resolution step-by-step.

Key Citizen Rights:
- Direct routing to responsible local officers
- Fixed resolution deadlines (24-72 hours)
- Photo proof mandatory before closing tickets
- You confirm and approve the fix

File a grievance anytime: ${fileComplaintUrl}
Track complaint status: ${trackUrl}
National Toll-Free Helpline: 1800-11-4000

Government of India • Ministry of Personnel, Public Grievances & Pensions`;

    const mailOptions = {
      from: sender,
      to: email,
      replyTo: gmailUser || sender,
      subject: `Welcome to JanSahayata: Citizen Grievance Portal Activated (${name})`,
      text: plainText,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Citizen welcome email sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW (CITIZEN WELCOME EMAIL)]`);
      console.log(`To: ${email} (${name})`);
      console.log(`Subject: Welcome to JanSahayata: Citizen Grievance Portal Activated`);
      console.log(`File Complaint URL: ${fileComplaintUrl}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode' };
    }
  } catch (error) {
    console.error('[sendCitizenWelcomeEmail Error]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Grievance Lodging Confirmation Email with Tracking ID & Direct Link
 */
export const sendComplaintConfirmationEmail = async ({
  complaintId,
  recipientEmail,
  recipientName = 'Citizen',
  departmentName = 'Public Department',
  category = 'Civic Issue',
  description = '',
  address = 'Specified Location',
  urgency = 'Medium',
  portalUrl = 'http://localhost:5173'
}) => {
  try {
    if (!recipientEmail || !recipientEmail.trim()) {
      return { success: false, message: 'No recipient email provided' };
    }

    const transporter = createTransporter();
    const sender = getSenderAddress();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;

    const trackingUrl = `${portalUrl}/complaint/${complaintId}`;
    const trackPageUrl = `${portalUrl}/track?id=${complaintId}`;

    let cleanRecipientName = (recipientName || 'Citizen').trim();
    if (/verified\s*citizen/i.test(cleanRecipientName)) {
      cleanRecipientName = 'Citizen';
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Grievance Registration Acknowledgement - ${complaintId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .tricolor { height: 5px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%); }
    .header { background: #0b2545; color: #ffffff; padding: 28px 32px; }
    .top-strip { font-size: 11px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .brand-title { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0; }
    .brand-sub { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 4px; }
    .content { padding: 32px; line-height: 1.6; }
    .title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    
    .tracking-card { background: #f8fafc; border: 2px dashed #0b2545; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .tracking-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; margin-bottom: 6px; }
    .tracking-id { font-size: 28px; font-family: monospace; font-weight: 900; color: #0b2545; letter-spacing: 1.5px; }
    
    .table-box { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table-box td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .table-box td.label { width: 35%; color: #64748b; font-weight: 600; }
    .table-box td.val { width: 65%; color: #0f172a; font-weight: 700; }
    
    .btn-track { display: inline-block; background: #0b2545; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(11, 37, 69, 0.3); }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="tricolor"></div>
    <div class="header">
      <div class="top-strip">Government of India • JanSahayata (CPGRAMS)</div>
      <div class="brand-title">Grievance Registered Successfully</div>
      <div class="brand-sub">Official Registration Acknowledgement & Tracking Pass</div>
    </div>

    <div class="content">
      <div class="title">Dear ${cleanRecipientName},</div>
      <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">
        Your grievance has been officially registered in the JanSahayata National Redressal Platform. It has been prioritized and dispatched to <strong>${departmentName}</strong> for inspection.
      </p>

      <div class="tracking-card">
        <div class="tracking-label">Official Grievance Reference ID</div>
        <div class="tracking-id">${complaintId}</div>
        <div style="font-size: 11px; color: #046a38; font-weight: 700; margin-top: 6px;">✓ Active & Ingested into Department Queue</div>
      </div>

      <table class="table-box">
        <tr>
          <td class="label">Assigned Department</td>
          <td class="val">${departmentName}</td>
        </tr>
        <tr>
          <td class="label">Grievance Category</td>
          <td class="val">${category}</td>
        </tr>
        <tr>
          <td class="label">Urgency Level</td>
          <td class="val">${urgency}</td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="val">${address}</td>
        </tr>
        <tr>
          <td class="label">Summary</td>
          <td class="val" style="font-weight: 500; color: #334155;">${description ? (description.length > 140 ? description.substring(0, 140) + '...' : description) : 'Registered civic grievance'}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackingUrl}" class="btn-track">Track Grievance Live (24x7) →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">
        Or paste this URL in any browser: <br>
        <a href="${trackingUrl}" style="color: #2563eb; word-break: break-all;">${trackingUrl}</a>
      </p>
    </div>

    <div class="footer">
      Government of India &bull; Centralized Public Grievance Redress And Monitoring System (CPGRAMS)<br>
      National Toll-Free Helpline: 1800-11-4000 &bull; 24x7 Citizen Assistance
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `Grievance Registration Acknowledgement

Complaint ID: ${complaintId}
Assigned Department: ${departmentName}
Category: ${category}
Urgency: ${urgency}
Location: ${address}

Track your grievance progress 24x7:
${trackingUrl}

Government of India • JanSahayata (CPGRAMS)
Toll Free: 1800-11-4000`;

    const mailOptions = {
      from: sender,
      to: recipientEmail,
      replyTo: gmailUser || sender,
      subject: `JanSahayata Grievance Registered: ${complaintId} (${category})`,
      text: plainText,
      html: htmlContent
    };

    const hasGmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    if (hasGmailConfig) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Grievance confirmation sent to ${recipientEmail} for ${complaintId}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'live_gmail', messageId: info.messageId };
    } else {
      console.log(`\n============================================================`);
      console.log(`[EmailService - DEV PREVIEW (GRIEVANCE CONFIRMATION)]`);
      console.log(`To: ${recipientEmail}`);
      console.log(`Complaint ID: ${complaintId}`);
      console.log(`Tracking URL: ${trackingUrl}`);
      console.log(`============================================================\n`);
      return { success: true, mode: 'preview_mode' };
    }
  } catch (error) {
    console.error('[sendComplaintConfirmationEmail Error]', error.message);
    return { success: false, error: error.message };
  }
};



