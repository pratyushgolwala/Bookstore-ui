import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import styles from '../../Auth3DBook.module.css';

function SuccessPage({ onRedirectToLogin, isLoading }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => setCountdown((p) => p - 1), 1000);
    const timeout  = setTimeout(() => onRedirectToLogin(), 3000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [onRedirectToLogin]);

  return (
    <div className={styles.bookPage} style={{ alignItems: 'center', textAlign: 'center' }}>
      {/* Icon */}
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(0,208,132,0.12)', marginBottom: '20px' }}>
        <CheckCircle size={28} color="#00d084" />
      </div>

      <h1 className={styles.pageHeading}>Account created!</h1>
      <p className={styles.pageSubheading} style={{ marginBottom: '28px' }}>
        Welcome to Folio. Check your inbox for a verification link before signing in.
      </p>

      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}>
        Redirecting in <span style={{ color: '#995F2F', fontWeight: '600' }}>{countdown}s</span>
      </p>

      <button onClick={onRedirectToLogin} disabled={isLoading} className={styles.formButton}>
        {isLoading ? 'Redirecting…' : 'Go to login'}
      </button>
    </div>
  );
}

export default SuccessPage;
