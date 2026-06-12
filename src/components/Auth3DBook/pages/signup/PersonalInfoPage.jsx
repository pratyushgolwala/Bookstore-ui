import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

function PersonalInfoPage({ firstName, lastName, onFirstNameChange, onLastNameChange, onPrevious, onNext, errors }) {
  const isValid = firstName.trim() && lastName.trim();

  return (
    <div className={styles.bookPage}>
      <ProgressIndicator currentPage={2} totalPages={5} />

      <h1 className={styles.pageHeading}>Personal information</h1>
      <p className={styles.pageSubheading}>How should we address you?</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className={styles.formField} style={{ marginBottom: 0 }}>
          <label htmlFor="fname" className={styles.formLabel}>First name</label>
          <input id="fname" type="text" placeholder="John" value={firstName} onChange={(e) => onFirstNameChange(e.target.value)}
            className={`${styles.formInput} ${errors.first_name ? styles.formInputError : ''}`} autoFocus autoComplete="given-name" />
          {errors.first_name && <div className={styles.formError}>{errors.first_name}</div>}
        </div>
        <div className={styles.formField} style={{ marginBottom: 0 }}>
          <label htmlFor="lname" className={styles.formLabel}>Last name</label>
          <input id="lname" type="text" placeholder="Doe" value={lastName} onChange={(e) => onLastNameChange(e.target.value)}
            className={`${styles.formInput} ${errors.last_name ? styles.formInputError : ''}`} autoComplete="family-name" />
          {errors.last_name && <div className={styles.formError}>{errors.last_name}</div>}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onPrevious} className={styles.previousButton}>← Back</button>
        <button onClick={onNext} disabled={!isValid} className={styles.nextButton}>Continue →</button>
      </div>
    </div>
  );
}

export default PersonalInfoPage;
