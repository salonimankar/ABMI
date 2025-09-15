import { Router } from 'express';
import { sendOtpEmail } from '../services/email.js';
import { otpStore } from '../services/otpStore.js';

const router = Router();

// Request OTP (registration or login)
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const otp = otpStore.generate(email);
    await sendOtpEmail(email, otp);
    return res.json({ ok: true, message: 'OTP sent' });
  } catch (error) {
    console.error('[auth] request-otp failed', { email, message: error?.message });
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
  const valid = otpStore.verify(email, String(otp));
  if (!valid) {
    console.warn('[auth] verify-otp invalid/expired', { email });
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }
  return res.json({ ok: true });
});

export default router;



