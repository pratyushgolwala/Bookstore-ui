import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailValidationPage from './pages/EmailValidationPage';
import PasswordEntryPage from './pages/PasswordEntryPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import PageTurnAnimation from './animations/PageTurnAnimation';
import styles from './Auth3DBook.module.css';

/**
 * LoginBookFlow — Email → Password → OTP → JWT
 * page: 'email' | 'animating-to-password' | 'password' | 'animating-to-otp' | 'otp'
 */
function LoginBookFlow({ toast }) {
  const navigate = useNavigate();
  const [page, setPage] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailChange = (v) => {
    setEmail(v);
    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
  };

  const handleEmailNext = () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setPage('animating-to-password');
  };

  const handlePasswordChange = (v) => {
    setPassword(v);
    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
  };

  /**
   * Step 1 — POST /user/login/ — sends OTP to email
   */
  const handlePasswordSubmit = async () => {
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.status?.message || data?.details || 'Login failed';

        // 403 = not verified
        if (res.status === 403 && message.toLowerCase().includes('not verified')) {
          toast.warning('Please verify your email first. Check your inbox for the link.');
        } else {
          toast.error(message);
        }
        setErrors({ submit: message });
        setIsLoading(false);
        return;
      }

      toast.info(`OTP sent to ${email} — check your inbox`);
      setPage('animating-to-otp');
    } catch {
      toast.error('Connection error. Please check your network and try again.');
      setErrors({ submit: 'Connection error. Please try again.' });
      setIsLoading(false);
    }
  };

  /**
   * Step 2 — POST /user/verify-otp/ — returns JWT
   */
  const handleOTPSubmit = async (otp) => {
    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.status?.message || 'Invalid or expired OTP';
        toast.error(message);
        setErrors({ otp: message });
        setIsLoading(false);
        return;
      }

      // Store tokens + user
      localStorage.setItem('access_token', data.data.access);
      localStorage.setItem('refresh_token', data.data.refresh);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success(`Welcome back, ${data.data.user.full_name || 'there'}!`);

      const role = data.data.user.role;
      setTimeout(() => {
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'AUTHOR') navigate('/profile');
        else navigate('/books');
      }, 800);
    } catch {
      toast.error('Connection error. Please try again.');
      setErrors({ otp: 'Connection error. Please try again.' });
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP — call login again
   */
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.status?.message || 'Failed to resend OTP');
      } else {
        toast.success('New OTP sent — check your inbox');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAnimating =
    page === 'animating-to-password' || page === 'animating-to-otp';

  const getNextPage = () => {
    if (page === 'animating-to-password') return 'password';
    if (page === 'animating-to-otp') return 'otp';
    return page;
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBook}>
        {page === 'email' && (
          <EmailValidationPage
            email={email}
            onEmailChange={handleEmailChange}
            onNext={handleEmailNext}
            error={errors.email}
            submitError={errors.submit}
            isLoading={isLoading}
          />
        )}

        {page === 'password' && (
          <PasswordEntryPage
            password={password}
            onPasswordChange={handlePasswordChange}
            onSubmit={handlePasswordSubmit}
            error={errors.password}
            submitError={errors.submit}
            isLoading={isLoading}
          />
        )}

        {page === 'otp' && (
          <OTPVerificationPage
            email={email}
            onSubmit={handleOTPSubmit}
            onResend={handleResendOTP}
            error={errors.otp}
            submitError={errors.submit}
            isLoading={isLoading}
          />
        )}
      </div>

      {isAnimating && (
        <PageTurnAnimation
          onComplete={() => setPage(getNextPage())}
          pageCount={8}
          duration={900}
          isSignup={false}
        />
      )}
    </div>
  );
}

export default LoginBookFlow;
