import nodemailer from 'nodemailer';

function mask(value) {
  if (!value) return '';
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

export async function sendOtpEmail(email, otp) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const err = new Error('SMTP env not configured: require SMTP_HOST, SMTP_USER, SMTP_PASS');
    console.error('[email] configuration error', err.message, {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: mask(SMTP_USER),
      from: SMTP_FROM ? SMTP_FROM : '(not set)'
    });
    throw err;
  }

  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.verify();
  } catch (e) {
    console.error('[email] SMTP verify failed', {
      host: SMTP_HOST,
      port,
      user: mask(SMTP_USER),
      message: e?.message,
      code: e?.code,
      command: e?.command
    });
    throw e;
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: email,
      subject: 'Your ABMI verification code',
      text: `Your One-Time Password is ${otp}. It expires in 5 minutes.`,
      html: `<div style="font-family:Inter,system-ui,sans-serif;color:#e5e7eb;background:#0b0f14;padding:24px">
      <h2 style="color:#fff;margin:0 0 8px">ABMI Verification</h2>
      <p style="margin:0 0 16px">Use the code below to continue. It expires in 5 minutes.</p>
      <div style="font-size:32px;letter-spacing:6px;background:#111827;color:#22d3ee;padding:12px 16px;border-radius:8px;display:inline-block">${otp}</div>
    </div>`
    });
    console.log('[email] OTP sent', { to: email, messageId: info?.messageId });
    return info.messageId;
  } catch (e) {
    console.error('[email] send failed', {
      to: email,
      message: e?.message,
      code: e?.code,
      response: e?.response,
      responseCode: e?.responseCode
    });
    throw e;
  }
}



