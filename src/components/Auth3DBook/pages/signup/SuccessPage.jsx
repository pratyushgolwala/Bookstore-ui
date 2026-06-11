import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import styles from '../../Auth3DBook.module.css';

/**
 * SuccessPage — Page 6 of signup book (Success confirmation)
 * Shows success message and auto-redirects to login after 3 seconds
 */
function SuccessPage({ onRedirectToLogin, isLoading }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Auto-redirect after 3 seconds
    const redirectTimer = setTimeout(() => {
      onRedirectToLogin();
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [onRedirectToLogin]);

  return (
    <div className={styles.bookPage}>
      {/* Success Icon */}
      <CheckCircle size={48} color="#00d084" style={{ marginBottom: '12px' }} />

      {/* Heading */}
      <h1 className={styles.pageHeading}>Account Created!</h1>

      {/* Message */}
      <p className={styles.pageSubheading} style={{ marginTop: '12px' }}>
        Welcome to BookStore. Your account is ready to use.
      </p>

      {/* Countdown */}
      <p
        style={{
          marginTop: '20px',
          fontSize: '13px',
          color: '#a8a8a8',
          textAlign: 'center',
        }}
      >
        Redirecting to login in {countdown}s...
      </p>

      {/* Manual Redirect Button */}
      <button
        onClick={onRedirectToLogin}
        disabled={isLoading}
        className={styles.formButton}
        style={{ marginTop: '20px', width: '100%' }}
      >
        {isLoading ? 'Redirecting...' : 'Go to Login Now'}
      </button>
    </div>
  );
}

export default SuccessPage;
