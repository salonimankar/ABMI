const store = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const otpStore = {
  generate(email) {
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    store.set(email, { otp, expiresAt });
    return otp;
  },
  verify(email, otp) {
    const entry = store.get(email);
    if (!entry) return false;
    const valid = entry.otp === otp && Date.now() < entry.expiresAt;
    if (valid) store.delete(email);
    return valid;
  }
};



