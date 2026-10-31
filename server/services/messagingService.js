/**
 * JanSahayata Government SMS & WhatsApp Messaging Service
 * 
 * Supports:
 * - SMS dispatch (via Twilio REST API, Fast2SMS, or Developer Simulator)
 * - WhatsApp dispatch (via Twilio WhatsApp or Meta WhatsApp Cloud API or Developer Simulator)
 * - Number normalization (E.164 format)
 * - Privacy masking
 */

// Format mobile number to E.164 (+91XXXXXXXXXX)
export const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  if (String(phone).startsWith('+')) {
    return `+${digits}`;
  }
  return `+${digits}`;
};

// Mask phone for display: +91 98*** 12345
export const maskPhoneNumber = (phone) => {
  if (!phone) return 'Registered Mobile';
  const clean = String(phone).replace(/[^\d+]/g, '');
  if (clean.length >= 10) {
    const last4 = clean.slice(-4);
    const prefix = clean.startsWith('+91') ? '+91 ' : clean.slice(0, 3) + ' ';
    return `${prefix}••••• •${last4}`;
  }
  return phone;
};

/**
 * Dispatch 6-Digit OTP via SMS
 */
export const sendOtpSms = async ({ phone, otp, name = 'User' }) => {
  const formattedPhone = formatPhoneNumber(phone);
  const masked = maskPhoneNumber(phone);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER.replace(/\s+/g, '') : null;

  const smsText = `[Government of India • JanSahayata CPGRAMS]\nDear ${name}, your verification OTP for password change is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

  let lastError = null;

  // 1. Live Twilio SMS Dispatch if configured
  if (accountSid && authToken && fromNumber) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: formattedPhone,
        From: fromNumber,
        Body: smsText
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Twilio SMS failed');
      }

      console.log(`[MessagingService] Live SMS sent to ${formattedPhone} (SID: ${data.sid})`);
      return {
        success: true,
        mode: 'live_sms',
        channel: 'sms',
        sid: data.sid,
        maskedDestination: masked
      };
    } catch (err) {
      lastError = err.message;
      console.error('[MessagingService SMS Live Error]', err.message);
    }
  }

  // 2. Developer Mode / Console Simulator
  console.log(`\n============================================================`);
  console.log(`[MessagingService - GOVT SMS SIMULATOR] 📱`);
  if (lastError) {
    console.log(`[Live Dispatch Failed]: ${lastError}`);
  }
  console.log(`To: ${formattedPhone} (${masked})`);
  console.log(`Recipient: ${name}`);
  console.log(`Message:`);
  console.log(`------------------------------------------------------------`);
  console.log(smsText);
  console.log(`------------------------------------------------------------`);
  console.log(`OTP Code: [ ${otp} ] (Expires in 10 minutes)`);
  console.log(`============================================================\n`);

  return {
    success: true,
    mode: 'preview_mode',
    channel: 'sms',
    otp,
    maskedDestination: masked,
    liveError: lastError
  };
};

/**
 * Dispatch 6-Digit OTP via WhatsApp
 */
export const sendOtpWhatsApp = async ({ phone, otp, name = 'User' }) => {
  const formattedPhone = formatPhoneNumber(phone);
  const masked = maskPhoneNumber(phone);

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const rawWaNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  const twilioWhatsAppNumber = rawWaNumber.replace(/\s+/g, '');

  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const isMetaConfigured = Boolean(
    metaToken && 
    metaPhoneId && 
    !metaToken.includes('your_meta_token_here') && 
    !metaToken.includes('...')
  );

  const waText = `🇮🇳 *Government of India • JanSahayata (CPGRAMS)*\n\nHello *${name}*,\n\nYour 6-digit verification security code for password authorization is:\n\n🔑 *${otp}*\n\n⏱ Valid for *10 minutes* only.\n\n_Security Notice: JanSahayata officers will never ask for your OTP. Do not disclose this code to anyone._`;

  // 1. Meta WhatsApp Cloud API (Primary if configured with valid token)
  if (isMetaConfigured) {
    try {
      const url = `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`;
      const cleanDigits = formattedPhone.replace(/\+/g, '');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanDigits,
          type: 'text',
          text: { body: waText }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Meta WhatsApp dispatch failed');
      }

      console.log(`[MessagingService] Live Meta WhatsApp sent to ${formattedPhone}`);
      return {
        success: true,
        mode: 'live_meta_whatsapp',
        channel: 'whatsapp',
        maskedDestination: masked
      };
    } catch (err) {
      lastError = err.message;
      console.error('[MessagingService Meta WhatsApp Error]', err.message);
    }
  }

  // 2. Twilio WhatsApp fallback if configured
  if (accountSid && authToken) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: `whatsapp:${formattedPhone}`,
        From: twilioWhatsAppNumber.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`,
        Body: waText
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Twilio WhatsApp dispatch failed');
      }

      console.log(`[MessagingService] Live Twilio WhatsApp sent to ${formattedPhone} (SID: ${data.sid})`);
      return {
        success: true,
        mode: 'live_whatsapp',
        channel: 'whatsapp',
        sid: data.sid,
        maskedDestination: masked
      };
    } catch (err) {
      lastError = err.message;
      console.error('[MessagingService Twilio WhatsApp Error]', err.message);
    }
  }

  // 3. Developer Mode / Console Simulator
  console.log(`\n============================================================`);
  console.log(`[MessagingService - GOVT WHATSAPP SIMULATOR] 💬🟢`);
  if (lastError) {
    console.log(`[Live Dispatch Failed]: ${lastError}`);
  }
  console.log(`To: ${formattedPhone} (${masked})`);
  console.log(`Recipient: ${name}`);
  console.log(`WhatsApp Message Content:`);
  console.log(`------------------------------------------------------------`);
  console.log(waText);
  console.log(`------------------------------------------------------------`);
  console.log(`OTP Code: [ ${otp} ] (Expires in 10 minutes)`);
  console.log(`============================================================\n`);

  return {
    success: true,
    mode: 'preview_mode',
    channel: 'whatsapp',
    otp,
    maskedDestination: masked,
    liveError: lastError
  };
};

