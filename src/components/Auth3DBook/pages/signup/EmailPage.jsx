import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

function EmailPage({ email, confirmEmail, onEmailChange, onConfirmEmailChange, onPrevious, onNext, errors }) {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = validEmail && email === confirmEmail && confirmEmail;

  return (
    <div className={styles.bookPage}>
      <ProgressIndicator currentPage={3} totalPages={5} />

      <h1 className={styles.pageHeading}>Your email address</h1>
      <p className={styles.pageSubheading}>We'll use this to verify your account</p>

      <div className={styles.formField}>
        <label htmlFor="s-email" className={styles.formLabel}>Email</label>
        <input id="s-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => onEmailChange(e.target.value)}
          className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`} autoFocus autoComplete="email" />
        {errors.email && <div className={styles.formError}>{errors.email}</div>}
      </div>

      <div className={styles.formField}>
        <label htmlFor="s-email-confirm" className={styles.formLabel}>Confirm email</label>
        <input id="s-email-confirm" type="email" placeholder="you@example.com" value={confirmEmail} onChange={(e) => onConfirmEmailChange(e.target.value)}
          className={`${styles.formInput} ${errors.confirm_email ? styles.formInputError : ''}`} autoComplete="email" />
        {errors.confirm_email && <div className={styles.formError}>{errors.confirm_email}</div>}
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onPrevious} className={styles.previousButton}>← Back</button>
        <button onClick={onNext} disabled={!isValid} className={styles.nextButton}>Continue →</button>
      </div>
    </div>
  );
}

export default EmailPage;
