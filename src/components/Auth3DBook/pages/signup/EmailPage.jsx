import { Mail } from 'lucide-react';
import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

/**
 * EmailPage — Page 3 of signup book
 * Collects and validates email with confirmation
 */
function EmailPage({
  email,
  confirmEmail,
  onEmailChange,
  onConfirmEmailChange,
  onPrevious,
  onNext,
  errors,
}) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailsMatch = email === confirmEmail;
  const isValid = isValidEmail && emailsMatch && confirmEmail;

  return (
    <div className={styles.bookPage}>
      {/* Progress Indicator */}
      <ProgressIndicator currentPage={3} totalPages={5} />

      {/* Heading */}
      <h1 className={styles.pageHeading}>Email Address</h1>

      {/* Email Field */}
      <div className={styles.formField}>
        <label htmlFor="email" className={styles.formLabel}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
          autoFocus
        />
        {errors.email && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      {/* Confirm Email Field */}
      <div className={styles.formField}>
        <label htmlFor="confirm_email" className={styles.formLabel}>
          Confirm Email
        </label>
        <input
          id="confirm_email"
          type="email"
          placeholder="you@example.com"
          value={confirmEmail}
          onChange={(e) => onConfirmEmailChange(e.target.value)}
          className={`${styles.formInput} ${errors.confirm_email ? styles.formInputError : ''}`}
        />
        {errors.confirm_email && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{errors.confirm_email}</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.buttonGroup} style={{ marginTop: '20px' }}>
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

export default EmailPage;
