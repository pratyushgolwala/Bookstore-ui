import ProgressIndicator from '../../components/ProgressIndicator';
import styles from '../../Auth3DBook.module.css';

function ReviewPage({ formData, role, acceptTerms, onAcceptTermsChange, onPrevious, onSubmit, isLoading, errors }) {
  const rows = [
    { key: 'Name',  val: `${formData.first_name} ${formData.last_name}` },
    { key: 'Email', val: formData.email },
    { key: 'Role',  val: role === 'CUSTOMER' ? 'Customer' : 'Author' },
    ...(formData.phone ? [{ key: 'Phone', val: formData.phone }] : []),
  ];

  return (
    <div className={styles.bookPage}>
      <ProgressIndicator currentPage={5} totalPages={5} />

      <h1 className={styles.pageHeading}>Review & confirm</h1>
      <p className={styles.pageSubheading}>Double-check your details before creating your account</p>

      {/* Summary */}
      <div className={styles.summaryCard}>
        {rows.map((row, i) => (
          <div key={row.key}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>{row.key}</span>
              <span className={styles.summaryVal}>{row.val}</span>
            </div>
            {i < rows.length - 1 && <div className={styles.summaryDivider} style={{ marginTop: '10px' }} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {errors.submit && (
        <div style={{ padding: '10px 14px', background: 'rgba(212,128,128,0.1)', border: '1px solid rgba(212,128,128,0.3)', borderRadius: '8px', marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#d48080' }}>{errors.submit}</p>
        </div>
      )}

      {/* Terms */}
      <div className={styles.checkboxRow}>
        <input id="terms" type="checkbox" checked={acceptTerms} onChange={(e) => onAcceptTermsChange(e.target.checked)} className={styles.checkboxInput} />
        <label htmlFor="terms" className={styles.checkboxLabel}>
          I agree to the{' '}
          <a href="#" style={{ color: '#d4933e', textDecoration: 'none', fontWeight: '500' }}>Terms and Conditions</a>
        </label>
      </div>
      {errors.terms && <div className={styles.formError} style={{ marginTop: '6px' }}>{errors.terms}</div>}

      <div className={styles.buttonGroup}>
        <button onClick={onPrevious} className={styles.previousButton}>← Back</button>
        <button onClick={onSubmit} disabled={!acceptTerms || isLoading} className={styles.nextButton}>
          {isLoading ? 'Creating…' : 'Create account'}
        </button>
      </div>
    </div>
  );
}

export default ReviewPage;
