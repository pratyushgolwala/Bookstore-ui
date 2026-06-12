import { useState, useRef, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

/**
 * OTPVerificationPage — Third page of login book
 * 6-digit OTP input — each box is independently typeable
 */
function OTPVerificationPage({ email, onSubmit, onResend, submitError, isLoading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first empty input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 50);
  }, []);

  const handleChange = (index, e) => {
    const raw = e.target.value;
    // Take only the last digit typed (handles autofill too)
    const digit = raw.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError('');

    // Move focus forward
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        // Clear current box
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move back and clear previous
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
      setOtpError('');
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill('');
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    setOtpError('');
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (code) => {
    if (isVerifying) return;
    if (!code || code.length < 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setIsVerifying(true);
    setOtpError('');
    await onSubmit(code);
    setIsVerifying(false);
  };

  const handleManualSubmit = () => {
    handleVerify(otp.join(''));
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    inputRefs.current[0]?.focus();
    await onResend();
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 8)) + c)
    : '';

  const allFilled = otp.every((d) => d !== '');
  const disableInputs = isVerifying;

  return (
    <div className={styles.bookPage}>
      {/* Submit Error banner */}
      {(submitError || otpError) && (
        <div
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'rgba(212,128,128,0.12)',
            border: '1px solid rgba(212,128,128,0.4)',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, fontSize: '13px', color: '#d48080', fontWeight: '500' }}>
            {otpError || submitError}
          </p>
        </div>
      )}

      {/* Icon + Heading */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(92,92,143,0.15), rgba(212,147,62,0.15))',
            border: '1px solid #3d3d3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={26} color="#d4933e" />
        </div>
        <h1 className={styles.pageHeading}>Verify Your Identity</h1>
        <p className={styles.pageSubheading}>
          Enter the 6-digit code sent to{' '}
          <span style={{ color: '#d4933e', fontWeight: '600', display: 'block', marginTop: '2px' }}>
            {maskedEmail}
          </span>
        </p>
      </div>

      {/* OTP Input Grid */}
      <div
        style={{ display: 'flex', gap: '10px', marginTop: '4px' }}
        onPaste={handlePaste}
      >
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={2}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disableInputs}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '700',
              backgroundColor: digit ? 'rgba(92,92,143,0.12)' : '#0f0f0f',
              border: `2px solid ${digit ? '#5c5c8f' : (otpError ? '#d48080' : '#3d3d3d')}`,
              borderRadius: '10px',
              color: '#e8e8e8',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
              caretColor: '#d4933e',
              cursor: disableInputs ? 'not-allowed' : 'text',
              boxShadow: digit ? '0 0 10px rgba(92,92,143,0.2)' : 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4933e';
              e.target.style.boxShadow = '0 0 0 3px rgba(212,147,62,0.15)';
              e.target.select();
            }}
            onBlur={(e) => {
              e.target.style.borderColor = digit ? '#5c5c8f' : (otpError ? '#d48080' : '#3d3d3d');
              e.target.style.boxShadow = digit ? '0 0 10px rgba(92,92,143,0.2)' : 'none';
            }}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleManualSubmit}
        disabled={!allFilled || disableInputs}
        className={styles.formButton}
        style={{ marginTop: '16px', width: '100%' }}
      >
        {isVerifying ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* Resend */}
      <p style={{ fontSize: '13px', color: '#a8a8a8', textAlign: 'center', marginTop: '12px' }}>
        Didn't receive the code?{' '}
        <button
          onClick={handleResend}
          disabled={isVerifying}
          style={{
            background: 'none',
            border: 'none',
            color: '#d4933e',
            fontWeight: '600',
            fontSize: '13px',
            cursor: isVerifying ? 'not-allowed' : 'pointer',
            padding: 0,
            textDecoration: 'underline',
            opacity: isVerifying ? 0.5 : 1,
          }}
        >
          Resend OTP
        </button>
      </p>
    </div>
  );
}

export default OTPVerificationPage;
