"""
JanSahayata Government SMS & WhatsApp Messaging Service
Handles multi-channel OTP delivery via Twilio API or Developer Simulator.
"""

import os
import re
import requests

def format_phone_number(phone):
    if not phone:
        return None
    digits = re.sub(r'\D', '', str(phone))
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith('91'):
        return f"+{digits}"
    if len(digits) == 11 and digits.startswith('0'):
        return f"+91{digits[1:]}"
    return f"+{digits}"

def mask_phone_number(phone):
    if not phone:
        return "Registered Mobile"
    clean = re.sub(r'[^\d+]', '', str(phone))
    if len(clean) >= 10:
        last4 = clean[-4:]
        prefix = "+91 " if clean.startswith('+91') else clean[:3] + " "
        return f"{prefix}••••• •{last4}"
    return phone

def send_otp_sms(phone, otp, name="User"):
    formatted = format_phone_number(phone)
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_number = os.getenv('TWILIO_PHONE_NUMBER', '').replace(' ', '')

    text = f"[Government of India • JanSahayata CPGRAMS]\nDear {name}, your verification OTP for password change is {otp}. Valid for 10 minutes. Do not share this code with anyone."

    if account_sid and auth_token and from_number and formatted:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            resp = requests.post(
                url,
                data={'To': formatted, 'From': from_number, 'Body': text},
                auth=(account_sid, auth_token),
                timeout=10
            )
            if resp.status_code in (200, 201):
                print(f"[SMS Dispatch] Live Twilio SMS sent to {mask_phone_number(phone)}")
                return True
        except Exception as e:
            print(f"[SMS Error] Twilio dispatch failed: {e}")

    # Simulator fallback
    print("================================================================================")
    print(f" [GOVERNMENT SMS GATEWAY - SIMULATOR] To: {mask_phone_number(phone)} ({formatted})")
    print(f" Body: {text}")
    print("================================================================================")
    return True

def send_otp_whatsapp(phone, otp, name="User"):
    formatted = format_phone_number(phone)
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    whatsapp_from = os.getenv('TWILIO_WHATSAPP_NUMBER')

    text = f"🏛️ *Government of India • JanSahayata (CPGRAMS)*\n\nDear *{name}*,\n\nYour One-Time Password (OTP) for JanSahayata security verification is:\n\n👉 *{otp}*\n\n_Valid for 10 minutes. Please do not disclose this OTP to anyone._"

    if account_sid and auth_token and whatsapp_from and formatted:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            resp = requests.post(
                url,
                data={
                    'To': f"whatsapp:{formatted}",
                    'From': f"whatsapp:{whatsapp_from}",
                    'Body': text
                },
                auth=(account_sid, auth_token),
                timeout=10
            )
            if resp.status_code in (200, 201):
                print(f"[WhatsApp Dispatch] Live WhatsApp message sent to {mask_phone_number(phone)}")
                return True
        except Exception as e:
            print(f"[WhatsApp Error] Twilio dispatch failed: {e}")

    print("================================================================================")
    print(f" [GOVERNMENT WHATSAPP GATEWAY - SIMULATOR] To: {mask_phone_number(phone)}")
    print(f" Body: {text}")
    print("================================================================================")
    return True

