import { useState, useRef, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

function OTPVerificationPage({ email, onSubmit, onResend, submitError }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 60);
  }, []);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setOtpError('');
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
    if (digit && next.every((d) => d !== '')) handleVerify(next.join(''));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...otp];
      if (next[i]) { next[i] = ''; setOtp(next); }
      else if (i > 0) { next[i - 1] = ''; setOtp(next); inputRefs.current[i - 1]?.focus(); }
      setOtpError('');
    }
    if (e.key === 'ArrowLeft'  && i > 0) { e.preventDefault(); inputRefs.current[i - 1]?.focus(); }
    if (e.key === 'ArrowRight' && i < 5) { e.preventDefault(); inputRefs.current[i + 1]?.focus(); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const next = Array(6).fill('');
    digits.split('').forEach((d, idx) => { if (idx < 6) next[idx] = d; });
    setOtp(next);
    setOtpError('');
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
    if (digits.length === 6) handleVerify(next.join(''));
  };

  const handleVerify = async (code) => {
    if (isVerifying || code.length < 6) { if (code.length < 6) setOtpError('Enter all 6 digits'); return; }
    setIsVerifying(true);
    setOtpError('');
    await onSubmit(code);
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    inputRefs.current[0]?.focus();
    await onResend();
  };

  const masked = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 8)) + c)
    : '';

  const allFilled = otp.every((d) => d !== '');
  const hasError = otpError || submitError;

  return (
    <div className={styles.bookPage}>
      {/* Icon */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(92,92,143,0.15),rgba(212,147,62,0.15))', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={22} color="#d4933e" />
        </div>
      </div>

      <h1 className={styles.pageHeading} style={{ textAlign: 'center' }}>Check your email</h1>
      <p className={styles.pageSubheading} style={{ textAlign: 'center' }}>
        We sent a 6-digit code to <span style={{ color: '#d4933e', fontWeight: '500' }}>{masked}</span>
      </p>

      {/* Error */}
      {hasError && (
        <div style={{ padding: '10px 14px', background: 'rgba(212,128,128,0.1)', border: '1px solid rgba(212,128,128,0.3)', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#d48080' }}>{otpError || submitError}</p>
        </div>
      )}

      {/* OTP boxes */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }} onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={2}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isVerifying}
            onFocus={(e) => { e.target.select(); e.target.style.borderColor = '#d4933e'; e.target.style.boxShadow = '0 0 0 3px rgba(212,147,62,0.12)'; }}
            onBlur={(e) => { e.target.style.borderColor = digit ? 'rgba(92,92,143,0.6)' : (hasError ? 'rgba(212,128,128,0.5)' : 'rgba(255,255,255,0.09)'); e.target.style.boxShadow = digit ? '0 0 8px rgba(92,92,143,0.15)' : 'none'; }}
            style={{
              width: '46px', height: '54px', textAlign: 'center',
              fontSize: '20px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
              background: digit ? 'rgba(92,92,143,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${digit ? 'rgba(92,92,143,0.6)' : hasError ? 'rgba(212,128,128,0.5)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: '10px', color: '#f0f0f0', outline: 'none',
              transition: 'all 0.15s ease', caretColor: '#d4933e',
              cursor: isVerifying ? 'not-allowed' : 'text',
              WebkitAppearance: 'none',
            }}
          />
        ))}
      </div>

      <button onClick={() => handleVerify(otp.join(''))} disabled={!allFilled || isVerifying} className={styles.formButton}>
        {isVerifying ? 'Verifying…' : 'Verify Code'}
      </button>

      <div className={styles.divider} />

      <p className={styles.helperText} style={{ margin: 0 }}>
        Didn't receive it?{' '}
        <button onClick={handleResend} disabled={isVerifying} className={styles.linkPrimary}>
          Resend code
        </button>
      </p>
    </div>
  );
}

export default OTPVerificationPage;
