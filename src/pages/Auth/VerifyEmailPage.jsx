import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import COLORS from '../../constants/colors';
import ToastContainer from '../../components/Toast/ToastContainer';
import useToast from '../../hooks/useToast';

/**
 * VerifyEmailPage — handles /verify-email?uid=...&token=...
 * Calls POST /user/verify-email/ and redirects to login
 */
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one.');
      return;
    }
    verifyEmail();
  }, []);

  // Countdown redirect after success
  useEffect(() => {
    if (status !== 'success') return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const verifyEmail = async () => {
    setStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/verify-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.status?.message || 'Verification failed. The link may be expired.';
        setStatus('error');
        setMessage(errMsg);
        toast.error(errMsg, 6000);
        return;
      }

      setStatus('success');
      setMessage(data?.status?.message || 'Email verified successfully. You can now log in.');
      toast.success('Email verified successfully! Redirecting to login...', 5000);
    } catch {
      setStatus('error');
      setMessage('Connection error. Please try again or request a new link.');
      toast.error('Connection error. Please check your network.', 5000);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          backgroundColor: COLORS.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '16px',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Loading */}
          {status === 'loading' && (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${COLORS.primary[500]}22, ${COLORS.secondary[400]}22)`,
                  border: `1px solid ${COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Loader
                  size={28}
                  color={COLORS.secondary[400]}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text.primary, margin: '0 0 12px' }}>
                Verifying Your Email
              </h1>
              <p style={{ fontSize: '14px', color: COLORS.text.secondary, margin: 0 }}>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0,208,132,0.1)',
                  border: '1px solid rgba(0,208,132,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 0 24px rgba(0,208,132,0.15)',
                }}
              >
                <CheckCircle size={32} color="#00d084" />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text.primary, margin: '0 0 12px' }}>
                Email Verified!
              </h1>
              <p style={{ fontSize: '14px', color: COLORS.text.secondary, margin: '0 0 32px', lineHeight: 1.6 }}>
                {message}
              </p>
              <p style={{ fontSize: '13px', color: COLORS.text.tertiary, margin: '0 0 20px' }}>
                Redirecting to login in{' '}
                <span style={{ color: COLORS.secondary[400], fontWeight: '700' }}>{countdown}s</span>
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: COLORS.gradient.primary,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#160e07',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(92,92,143,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Go to Login Now
              </button>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(212,128,128,0.1)',
                  border: '1px solid rgba(212,128,128,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 0 24px rgba(212,128,128,0.15)',
                }}
              >
                <XCircle size={32} color="#d48080" />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text.primary, margin: '0 0 12px' }}>
                Verification Failed
              </h1>
              <p style={{ fontSize: '14px', color: COLORS.text.secondary, margin: '0 0 32px', lineHeight: 1.6 }}>
                {message}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={verifyEmail}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: COLORS.gradient.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: '#160e07',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%',
                    padding: '13px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.text.secondary,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Spinner CSS */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default VerifyEmailPage;
