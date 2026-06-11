import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

/**
 * ReviewPage — Page 5 of signup book
 * Displays summary of all entered information for review
 */
function ReviewPage({
  formData,
  role,
  acceptTerms,
  onAcceptTermsChange,
  onPrevious,
  onSubmit,
  isLoading,
  errors,
}) {
  const isValid = acceptTerms;

  return (
    <div className={styles.bookPage}>
      {/* Progress Indicator */}
      <ProgressIndicator currentPage={5} totalPages={5} />

      {/* Heading */}
      <h1 className={styles.pageHeading}>Review Your Info</h1>

      {/* Form Summary */}
      <div
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px',
          backgroundColor: '#0f0f0f',
          borderRadius: '6px',
          border: '1px solid #3d3d3d',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '13px',
          maxHeight: '140px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#a8a8a8' }}>Name:</span>
          <span style={{ color: '#e8e8e8', fontWeight: '600' }}>
            {formData.first_name} {formData.last_name}
          </span>
        </div>
        <div style={{ height: '1px', backgroundColor: '#3d3d3d' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#a8a8a8' }}>Email:</span>
          <span style={{ color: '#e8e8e8', fontWeight: '600' }}>
            {formData.email}
          </span>
        </div>
        <div style={{ height: '1px', backgroundColor: '#3d3d3d' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#a8a8a8' }}>Role:</span>
          <span style={{ color: '#e8e8e8', fontWeight: '600' }}>
            {role === 'CUSTOMER' ? 'Customer' : 'Author'}
          </span>
        </div>
        {formData.phone && (
          <>
            <div style={{ height: '1px', backgroundColor: '#3d3d3d' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a8a8a8' }}>Phone:</span>
              <span style={{ color: '#e8e8e8', fontWeight: '600' }}>
                {formData.phone}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#d48080',
            borderRadius: '6px',
            marginTop: '10px',
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
            {errors.submit}
          </p>
        </div>
      )}

      {/* Terms Checkbox */}
      <div
        className={styles.checkboxContainer}
        style={{ marginTop: '12px' }}
      >
        <input
          id="terms"
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => onAcceptTermsChange(e.target.checked)}
          className={styles.checkboxInput}
        />
        <label htmlFor="terms" className={styles.checkboxLabel}>
          I agree to the{' '}
          <a href="#" style={{ color: '#d4933e', textDecoration: 'none' }}>
            Terms and Conditions
          </a>
        </label>
      </div>
      {errors.terms && (
        <div className={styles.formError} style={{ marginTop: '6px' }}>
          <span>✕</span>
          <span>{errors.terms}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={styles.buttonGroup} style={{ marginTop: '14px' }}>
        <button
          onClick={onPrevious}
          className={styles.previousButton}
        >
          ← Previous
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid || isLoading}
          className={styles.nextButton}
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}

export default ReviewPage;
