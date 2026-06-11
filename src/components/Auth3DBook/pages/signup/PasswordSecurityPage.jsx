import { useState } from 'react';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

/**
 * PasswordSecurityPage — Page 4 of signup book
 * Collects password with strength indicator and validation
 */
function PasswordSecurityPage({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onPrevious,
  onNext,
  errors,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: '#767676' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#d48080' };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#e6a657' };
    return { score: 3, label: 'Strong', color: '#00d084' };
  };

  const strength = getPasswordStrength();

  // Validation checks
  const has8Chars = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword;

  const isValid = has8Chars && hasLowercase && hasUppercase && hasNumber && passwordsMatch;

  return (
    <div className={styles.bookPage}>
      {/* Progress Indicator */}
      <ProgressIndicator currentPage={4} totalPages={5} />

      {/* Heading */}
      <h1 className={styles.pageHeading}>Password & Security</h1>

      {/* Password Field */}
      <div className={styles.formField}>
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
            className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
            style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{errors.password}</span>
          </div>
        )}

        {/* Strength Indicator */}
        {password && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                height: '4px',
                flex: 1,
                backgroundColor: '#3d3d3d',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(strength.score / 3) * 100}%`,
                  backgroundColor: strength.color,
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '12px', color: strength.color, fontWeight: '600' }}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className={styles.formField}>
        <label htmlFor="confirm_password" className={styles.formLabel}>
          Confirm Password
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
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className={`${styles.formInput} ${errors.confirm_password ? styles.formInputError : ''}`}
            style={{ paddingLeft: '40px', paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirm_password && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{errors.confirm_password}</span>
          </div>
        )}
      </div>

      {/* Requirements Checklist */}
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '12px', color: '#a8a8a8', fontWeight: '600', margin: 0 }}>
          Requirements:
        </p>
        <div
          style={{
            fontSize: '12px',
            color: has8Chars ? '#00d084' : '#767676',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {has8Chars && <Check size={14} />}
          <span>At least 8 characters</span>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: hasUppercase ? '#00d084' : '#767676',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {hasUppercase && <Check size={14} />}
          <span>One uppercase letter</span>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: hasLowercase ? '#00d084' : '#767676',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {hasLowercase && <Check size={14} />}
          <span>One lowercase letter</span>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: hasNumber ? '#00d084' : '#767676',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {hasNumber && <Check size={14} />}
          <span>One number</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.buttonGroup} style={{ marginTop: '16px' }}>
        <button
          onClick={onPrevious}
          className={styles.previousButton}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={styles.nextButton}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default PasswordSecurityPage;
