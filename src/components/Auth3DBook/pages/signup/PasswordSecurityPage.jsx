import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

function PasswordSecurityPage({ password, confirmPassword, onPasswordChange, onConfirmPasswordChange, onPrevious, onNext, errors }) {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const checks = {
    len:   password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    num:   /\d/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['', '#c2562f', '#e6a657', '#7bc8a4', '#00d084'][score];
  const isValid = Object.values(checks).every(Boolean) && password === confirmPassword && confirmPassword;

  return (
    <div className={styles.bookPage}>
      <ProgressIndicator currentPage={4} totalPages={5} />

      <h1 className={styles.pageHeading}>Create a password</h1>
      <p className={styles.pageSubheading}>Make it strong and memorable</p>

      <div className={styles.formField}>
        <label htmlFor="s-pw" className={styles.formLabel}>Password</label>
        <div style={{ position: 'relative' }}>
          <input id="s-pw" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
            style={{ paddingRight: '40px' }} autoFocus autoComplete="new-password" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', display: 'flex' }}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {/* Strength bar */}
        {password && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(score / 4) * 100}%`, background: strengthColor, transition: 'width 0.25s ease, background 0.25s ease' }} />
            </div>
            <span style={{ fontSize: '11px', color: strengthColor, fontWeight: '600', fontFamily: 'Inter, sans-serif', minWidth: '36px' }}>{strengthLabel}</span>
          </div>
        )}
        {errors.password && <div className={styles.formError}>{errors.password}</div>}
      </div>

      {/* Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: '16px' }}>
        {[
          { ok: checks.len,   label: '8+ characters' },
          { ok: checks.upper, label: 'Uppercase letter' },
          { ok: checks.lower, label: 'Lowercase letter' },
          { ok: checks.num,   label: 'One number' },
        ].map(({ ok, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: ok ? '#00d084' : 'rgba(255,255,255,0.22)', transition: 'color 0.2s ease' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ok ? '#00d084' : 'rgba(255,255,255,0.15)', flexShrink: 0, transition: 'background 0.2s ease' }} />
            {label}
          </div>
        ))}
      </div>

      <div className={styles.formField}>
        <label htmlFor="s-cpw" className={styles.formLabel}>Confirm password</label>
        <div style={{ position: 'relative' }}>
          <input id="s-cpw" type={showCpw ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className={`${styles.formInput} ${errors.confirm_password ? styles.formInputError : ''}`}
            style={{ paddingRight: '40px' }} autoComplete="new-password" />
          <button type="button" onClick={() => setShowCpw(!showCpw)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', display: 'flex' }}>
            {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.confirm_password && <div className={styles.formError}>{errors.confirm_password}</div>}
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onPrevious} className={styles.previousButton}>← Back</button>
        <button onClick={onNext} disabled={!isValid} className={styles.nextButton}>Continue →</button>
      </div>
    </div>
  );
}

export default PasswordSecurityPage;
