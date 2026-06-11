import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

/**
 * PasswordEntryPage — Second page of login book
 * Collects password and submits login request to API
 */
function PasswordEntryPage({
  password,
  onPasswordChange,
  onSubmit,
  error,
  submitError,
  isLoading,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isDisabled = !password || isLoading;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDisabled) {
      onSubmit();
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
      <h1 className={styles.pageHeading}>Enter Your Password</h1>

      {/* Subheading */}
      <p className={styles.pageSubheading}>Your password is secure</p>

      {/* Password Field */}
      <div className={styles.formField} style={{ marginTop: '12px' }}>
        <label htmlFor="password" className={styles.formLabel}>
          Password
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Lock
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#a8a8a8',
              pointerEvents: 'none',
            }}
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
            style={{
              paddingLeft: '40px',
              paddingRight: '40px',
            }}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#a8a8a8',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Forgot Password Link */}
      <a href="#" className={styles.linkPrimary} style={{ marginTop: '12px', fontSize: '13px' }}>
        Forgot password?
      </a>

      {/* Sign In Button */}
      <button
        onClick={onSubmit}
        disabled={isDisabled}
        className={styles.formButton}
        style={{ marginTop: '20px', width: '100%' }}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
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

export default PasswordEntryPage;
