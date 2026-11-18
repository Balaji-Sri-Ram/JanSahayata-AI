"""
Official Government Email & Notification Service (JanSahayata - CPGRAMS)
Dispatches formatted HTML official communications using Python standard smtplib.
Gracefully operates in Development / Simulated mode when SMTP credentials are not configured.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, parseaddr
from email.header import Header
from datetime import datetime

OFFICIAL_SENDER_NAME = "Government of India • JanSahayata (CPGRAMS)"

def get_sender_address():
    gmail_user = os.getenv('GMAIL_USER', '').strip()
    if gmail_user:
        return formataddr((str(Header(OFFICIAL_SENDER_NAME, 'utf-8')), gmail_user))
    
    raw_from = os.getenv('EMAIL_FROM', '').strip()
    if raw_from:
        parsed_name, parsed_addr = parseaddr(raw_from)
        clean_name = parsed_name.strip('\"\'') or OFFICIAL_SENDER_NAME
        clean_addr = parsed_addr or 'no-reply@jansahayata.gov.in'
        return formataddr((str(Header(clean_name, 'utf-8')), clean_addr))
        
    return formataddr((str(Header(OFFICIAL_SENDER_NAME, 'utf-8')), 'no-reply@jansahayata.gov.in'))

def send_email(to_email, subject, html_content, text_content=None):
    gmail_user = os.getenv('GMAIL_USER', '').strip()
    gmail_pass = os.getenv('GMAIL_APP_PASSWORD', '').strip().replace(' ', '')

    smtp_host = os.getenv('SMTP_HOST', '').strip()
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER', '').strip()
    smtp_pass = os.getenv('SMTP_PASS', os.getenv('SMTP_PASSWORD', '')).strip()
    smtp_use_tls = os.getenv('SMTP_USE_TLS', 'True').lower() in ('true', '1', 'yes')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = Header(subject, 'utf-8')
    msg['From'] = get_sender_address()
    msg['To'] = to_email

    reply_to = gmail_user or os.getenv('REPLY_TO', '').strip()
    if reply_to:
        msg['Reply-To'] = reply_to

    if text_content:
        msg.attach(MIMEText(text_content, 'plain'))
    if html_content:
        msg.attach(MIMEText(html_content, 'html'))

    # 1. Attempt Gmail SMTP (SSL on 465)
    if gmail_user and gmail_pass:
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=12) as server:
                server.login(gmail_user, gmail_pass)
                server.sendmail(gmail_user, [to_email], msg.as_string())
            print(f"[Email Service] Official email successfully dispatched to {to_email} via Gmail SMTP.")
            return True
        except Exception as e:
            print(f"[Email Service Error] Failed sending via Gmail SMTP: {e}. Falling back to simulation.")

    # 2. Attempt Generic SMTP Server (e.g. Brevo, SendGrid, Mailgun, Outlook, custom)
    elif smtp_host and smtp_user and smtp_pass:
        try:
            if smtp_port == 465:
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12) as server:
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
                    if smtp_use_tls:
                        server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, [to_email], msg.as_string())
            print(f"[Email Service] Official email successfully dispatched to {to_email} via {smtp_host}.")
            return True
        except Exception as e:
            print(f"[Email Service Error] Failed sending via custom SMTP ({smtp_host}): {e}. Falling back to simulation.")

    # 3. Development simulation fallback
    print("================================================================================")
    print(f" [EMAIL DISPATCH - DEV SIMULATOR] To: {to_email}")
    print(f" Subject: {subject}")
    print(f" Timestamp: {datetime.now().isoformat()}")
    print(" NOTE: Live SMTP is not configured in .env (GMAIL_USER & GMAIL_APP_PASSWORD are empty).")
    print(" To send REAL emails to actual inboxes:")
    print("  1. Enable 2-Step Verification on your Google Account.")
    print("  2. Generate a 16-character App Password at: https://myaccount.google.com/apppasswords")
    print("  3. Set GMAIL_USER=your_email@gmail.com and GMAIL_APP_PASSWORD=your_16_char_code in .env")
    print("================================================================================")
    return True

def send_officer_welcome_email(name, email, employee_id, department_name, designation, temporary_password, login_url=None):
    if not login_url:
        client_base = os.getenv('CLIENT_URL', 'http://127.0.0.1:8000').rstrip('/')
        login_url = f"{client_base}/staff/login"
    subject = f"Official Credential Issuance — JanSahayata Portal ({department_name})"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Official Credentials</title></head>
    <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden;">
        <div style="height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%);"></div>
        <div style="background: #0b2545; color: #ffffff; padding: 24px;">
          <h2 style="margin: 0; font-size: 20px;">JanSahayata AI — Government of India</h2>
          <p style="margin: 4px 0 0; color: #f59e0b; font-size: 13px;">Official Department Officer Onboarding</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>{name}</strong>,</p>
          <p>You have been officially registered as a Grievance Redressal Officer on the JanSahayata National Redressal Platform.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Employee ID:</strong> {employee_id}</p>
            <p style="margin: 4px 0;"><strong>Department:</strong> {department_name}</p>
            <p style="margin: 4px 0;"><strong>Designation:</strong> {designation}</p>
            <p style="margin: 4px 0;"><strong>Official Email:</strong> {email}</p>
            <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">{temporary_password}</code></p>
          </div>
          <p style="color: #b91c1c; font-size: 13px;">* For security compliance, you will be prompted to reset this temporary password immediately upon your initial login.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="{login_url}" style="background: #0b2545; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Officer Dashboard</a>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
          Government of India • Ministry of Public Grievance & Administrative Reforms
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(email, subject, html)

def send_otp_verification_email(email, otp, name="User", action="Password Change"):
    subject = f"Your JanSahayata Verification OTP: {otp}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden;">
        <div style="height: 4px; background: linear-gradient(90deg, #ff671f 0%, #ffffff 50%, #046a38 100%);"></div>
        <div style="background: #0b2545; color: #ffffff; padding: 20px;">
          <h3 style="margin: 0; color: #ffffff;">JanSahayata (CPGRAMS) • Security Verification</h3>
        </div>
        <div style="padding: 24px; text-align: center;">
          <p style="text-align: left;">Dear <strong>{name}</strong>,</p>
          <p style="text-align: left;">Use the following One-Time Password (OTP) to complete your <strong>{action}</strong> request:</p>
          <div style="letter-spacing: 6px; font-size: 32px; font-weight: bold; color: #0b2545; margin: 24px 0; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #cbd5e1;">
            {otp}
          </div>
          <p style="font-size: 13px; color: #64748b;">This code is strictly confidential and valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(email, subject, html)

def send_account_confirmation_otp_email(email, otp, name="Citizen"):
    return send_otp_verification_email(email, otp, name, action="Citizen Registration & Email Verification")

def send_citizen_old_email_change_otp(email, otp, name="Citizen"):
    return send_otp_verification_email(email, otp, name, action="Email Address Modification (Current Email Verification)")

def send_citizen_new_email_verification_otp(email, otp, name="Citizen"):
    return send_otp_verification_email(email, otp, name, action="Email Address Modification (New Email Confirmation)")

def send_citizen_email_change_dual_notice(old_email, new_email, name="Citizen"):
    subject = "Security Notice: Official Email Address Updated"
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>JanSahayata Grievance Portal</h2>
      <p>Dear {name},</p>
      <p>Your registered email address has been successfully updated from <strong>{old_email}</strong> to <strong>{new_email}</strong>.</p>
      <p>If you did not authorize this change, please contact the administrator immediately.</p>
    </div>
    """
    send_email(old_email, subject, html)
    send_email(new_email, subject, html)
    return True

def send_email_change_old_address_notice(old_email, new_email, name="Officer"):
    subject = "Administrative Notice: Email Update Applied"
    html = f"<p>Dear {name}, your official email change from {old_email} to {new_email} has been approved and applied.</p>"
    return send_email(old_email, subject, html)

def send_email_change_new_address_notice(new_email, name="Officer"):
    subject = "Administrative Notice: New Official Email Activated"
    html = f"<p>Dear {name}, your new official email address {new_email} is now active on the JanSahayata platform.</p>"
    return send_email(new_email, subject, html)

def send_password_changed_confirmation(email, name="User"):
    subject = "Security Alert: Password Successfully Updated"
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>JanSahayata Security Alert</h3>
      <p>Dear {name},</p>
      <p>Your account password was successfully updated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.</p>
      <p>If this was not done by you, please reach out to administrator support immediately.</p>
    </div>
    """
    return send_email(email, subject, html)

def send_citizen_welcome_email(name, email):
    subject = "Welcome to JanSahayata — Citizen Grievance Portal"
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to JanSahayata AI</h2>
      <p>Dear {name},</p>
      <p>Your citizen account has been successfully created with email: <strong>{email}</strong>.</p>
      <p>You can now submit civic & railway grievances with multi-modal AI assistance and track real-time resolution stages.</p>
    </div>
    """
    return send_email(email, subject, html)

def send_complaint_confirmation_email(email, complaint_id, category, department_name, problem_statement):
    subject = f"Grievance Registered Successfully — Reference ID: {complaint_id}"
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>JanSahayata Grievance Acknowledgment</h2>
      <p>Your grievance has been successfully submitted and forwarded to <strong>{department_name}</strong>.</p>
      <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 12px 0;">
        <p><strong>Grievance ID:</strong> {complaint_id}</p>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Summary:</strong> {problem_statement}</p>
      </div>
      <p>You can track the live status anytime on the citizen portal using your reference ID.</p>
    </div>
    """
    return send_email(email, subject, html)

