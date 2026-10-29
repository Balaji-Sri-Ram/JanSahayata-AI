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


