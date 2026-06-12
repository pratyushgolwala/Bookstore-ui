import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import styles from '../Auth3DBook.module.css';

function PasswordEntryPage({ password, onPasswordChange, onSubmit, error, submitError, isLoading }) {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.bookPage}>
      <h1 className={styles.pageHeading}>Enter your password</h1>
      <p className={styles.pageSubheading}>Almost there — one more step</p>

      {submitError && (
        <div style={{ padding: '10px 14px', background: 'rgba(212,128,128,0.1)', border: '1px solid rgba(212,128,128,0.3)', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#d48080' }}>{submitError}</p>
        </div>
      )}

      <div className={styles.formField}>
        <label htmlFor="login-pass" className={styles.formLabel}>Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
          <input
            id="login-pass"
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password && !isLoading && onSubmit()}
            className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
            style={{ paddingLeft: '38px', paddingRight: '40px' }}
            disabled={isLoading}
            autoFocus
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShow(!show)} disabled={isLoading}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: '4px', display: 'flex' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <div className={styles.formError}>{error}</div>}
      </div>

      <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-8px' }}>
        <button className={styles.linkPrimary} style={{ fontSize: '12px' }}>Forgot password?</button>
      </div>

      <button onClick={onSubmit} disabled={!password || isLoading} className={styles.formButton}>
        {isLoading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className={styles.divider} />

      <p className={styles.helperText} style={{ margin: 0 }}>
        No account?{' '}
        <a href="/register" className={styles.linkPrimary}>Create one</a>
      </p>
    </div>
  );
}

export default PasswordEntryPage;
