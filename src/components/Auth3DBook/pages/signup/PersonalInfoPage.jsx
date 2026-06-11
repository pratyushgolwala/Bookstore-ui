import { User } from 'lucide-react';
import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

/**
 * PersonalInfoPage — Page 2 of signup book
 * Collects first name and last name
 */
function PersonalInfoPage({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onPrevious,
  onNext,
  errors,
}) {
  const isValid = firstName.trim() && lastName.trim();

  return (
    <div className={styles.bookPage}>
      {/* Progress Indicator */}
      <ProgressIndicator currentPage={2} totalPages={5} />

      {/* Heading */}
      <h1 className={styles.pageHeading}>Personal Information</h1>

      {/* First Name Field */}
      <div className={styles.formField}>
        <label htmlFor="first_name" className={styles.formLabel}>
          First Name
        </label>
        <input
          id="first_name"
          type="text"
          placeholder="John"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className={`${styles.formInput} ${errors.first_name ? styles.formInputError : ''}`}
          autoFocus
        />
        {errors.first_name && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{errors.first_name}</span>
          </div>
        )}
      </div>

      {/* Last Name Field */}
      <div className={styles.formField}>
        <label htmlFor="last_name" className={styles.formLabel}>
          Last Name
        </label>
        <input
          id="last_name"
          type="text"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className={`${styles.formInput} ${errors.last_name ? styles.formInputError : ''}`}
        />
        {errors.last_name && (
          <div className={styles.formError}>
            <span>✕</span>
            <span>{errors.last_name}</span>
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

export default PersonalInfoPage;
