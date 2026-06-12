import { Mail } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

function EmailValidationPage({ email, onEmailChange, onNext, error, submitError, isLoading }) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className={styles.bookPage}>
      {/* Heading block */}
      <h1 className={styles.pageHeading}>Welcome back</h1>
      <p className={styles.pageSubheading}>Sign in to your BookStore account</p>

      {/* Error banner */}
      {submitError && (
        <div style={{ padding: '10px 14px', background: 'rgba(212,128,128,0.1)', border: '1px solid rgba(212,128,128,0.3)', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#d48080' }}>{submitError}</p>
        </div>
      )}

      {/* Email field */}
      <div className={styles.formField}>
        <label htmlFor="login-email" className={styles.formLabel}>Email address</label>
        <div style={{ position: 'relative' }}>
          <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !(!isValidEmail || isLoading) && onNext()}
            className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
            style={{ paddingLeft: '38px' }}
            disabled={isLoading}
            autoFocus
            autoComplete="email"
          />
        </div>
        {error && <div className={styles.formError}><span>{error}</span></div>}
      </div>

      {/* CTA */}
      <button onClick={onNext} disabled={!isValidEmail || isLoading} className={styles.formButton} style={{ marginTop: '8px' }}>
        {isLoading ? 'Please wait…' : 'Continue'}
      </button>

      <div className={styles.divider} />

      {/* Footer */}
      <p className={styles.helperText} style={{ margin: 0 }}>
        No account?{' '}
        <a href="/register" className={styles.linkPrimary}>Create one</a>
      </p>
    </div>
  );
}

export default EmailValidationPage;
