import { useState, useRef, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

/**
 * OTPVerificationPage — Third page of login book
 * 6-digit OTP input sent to user's email
 */
function OTPVerificationPage({ email, onSubmit, onResend, error, submitError, isLoading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (newOtp.every((d) => d !== '') && digit) {
      onSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    // Focus last filled or last box
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
    if (pasted.length === 6) {
      onSubmit(newOtp.join(''));
    }
  };

  const handleManualSubmit = () => {
    const code = otp.join('');
    if (code.length === 6) onSubmit(code);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : '';

  return (
    <div className={styles.bookPage}>
      {/* Submit Error */}
      {submitError && (
        <div style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(212,128,128,0.15)', border: '1px solid #d48080', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#d48080', fontWeight: '500' }}>{submitError}</p>
        </div>
      )}

      {/* Icon + Heading */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #5c5c8f22, #d4933e22)', border: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={26} color="#d4933e" />
        </div>
        <h1 className={styles.pageHeading}>Verify Your Identity</h1>
        <p className={styles.pageSubheading}>
          Enter the 6-digit code sent to<br />
          <span style={{ color: '#d4933e', fontWeight: '600' }}>{maskedEmail}</span>
        </p>
      </div>

      {/* OTP Input Grid */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }} onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '700',
              backgroundColor: digit ? 'rgba(92,92,143,0.12)' : '#0f0f0f',
              border: `2px solid ${digit ? '#5c5c8f' : error ? '#d48080' : '#3d3d3d'}`,
              borderRadius: '10px',
              color: '#e8e8e8',
              outline: 'none',
              transition: 'all 0.15s ease',
              caretColor: '#d4933e',
              boxShadow: digit ? '0 0 10px rgba(92,92,143,0.2)' : 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4933e';
              e.target.style.boxShadow = '0 0 0 3px rgba(212,147,62,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = digit ? '#5c5c8f' : error ? '#d48080' : '#3d3d3d';
              e.target.style.boxShadow = digit ? '0 0 10px rgba(92,92,143,0.2)' : 'none';
            }}
          />
        ))}
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: '#d48080', margin: '4px 0 0', textAlign: 'center' }}>{error}</p>
      )}

      {/* Submit Button */}
      <button
        onClick={handleManualSubmit}
        disabled={otp.join('').length < 6 || isLoading}
        className={styles.formButton}
        style={{ marginTop: '16px', width: '100%' }}
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* Resend */}
      <p style={{ fontSize: '13px', color: '#a8a8a8', textAlign: 'center', marginTop: '12px' }}>
        Didn't receive the code?{' '}
        <button
          onClick={onResend}
          className={styles.linkPrimary}
          disabled={isLoading}
        >
          Resend OTP
        </button>
      </p>
    </div>
  );
}

export default OTPVerificationPage;
