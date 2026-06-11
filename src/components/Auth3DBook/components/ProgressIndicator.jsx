import styles from '../Auth3DBook.module.css';

/**
 * ProgressIndicator — Shows progress through signup form with animated bar and dots
 */
function ProgressIndicator({ currentPage, totalPages }) {
  const percentage = (currentPage / totalPages) * 100;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.progressContainer}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      {/* Progress Dots */}
      <div className={styles.progressDotContainer}>
        {pages.map((page) => (
          <div
            key={page}
            className={`${styles.progressDot} ${
              page <= currentPage ? styles.active : ''
            }`}
          />
        ))}
      </div>

      {/* Progress Text */}
      <div className={styles.progressText}>
        <span>Page {currentPage} of {totalPages}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default ProgressIndicator;
