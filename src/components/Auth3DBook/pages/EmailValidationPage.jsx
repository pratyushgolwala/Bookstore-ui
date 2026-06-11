import { Mail } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

/**
 * EmailValidationPage — First page of login book
 * Collects email and validates format before proceeding
 */
function EmailValidationPage({
  email,
  onEmailChange,
  onNext,
  error,
  submitError,
  isLoading,
}) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isDisabled = !isValidEmail || isLoading;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDisabled) {
      onNext();
    }
  };

  return (
    <div className={styles.bookPage}>
      {/* Submit Error */}
      {submitError && (
        <div
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#d48080',
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: '600',
              color: '#0f0f0f',
            }}
          >
            {submitError}
          </p>
        </div>
      )}

      {/* Heading */}
      <h1 className={styles.pageHeading}>Welcome Back</h1>

      {/* Subheading */}
      <p className={styles.pageSubheading}>Enter your email to continue</p>

      {/* Email Field */}
      <div className={styles.formField} style={{ marginTop: '12px' }}>
        <label htmlFor="email" className={styles.formLabel}>
          Email Address
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Mail
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#a8a8a8',
              pointerEvents: 'none',
            }}
          />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
            style={{
              paddingLeft: '40px',
            }}
            disabled={isLoading}
            autoFocus
          />
        </div>
        {error && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={isDisabled}
        className={styles.formButton}
        style={{ marginTop: '20px', width: '100%' }}
      >
        {isLoading ? 'Loading...' : 'Next'}
      </button>

      {/* Sign Up Link */}
      <p
        style={{
          marginTop: '20px',
          fontSize: '13px',
          color: '#a8a8a8',
          textAlign: 'center',
        }}
      >
        Don't have an account?{' '}
        <a href="/register" className={styles.linkPrimary}>
          Sign up
        </a>
      </p>
    </div>
  );
}

export default EmailValidationPage;
