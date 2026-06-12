import styles from '../Auth3DBook.module.css';

/**
 * ProgressIndicator — clean minimal progress bar + dot trail
 */
function ProgressIndicator({ currentPage, totalPages }) {
  const percentage = (currentPage / totalPages) * 100;
  const dots = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.progressContainer}>
      {/* Thin gradient bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>

      {/* Dot row + step label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className={styles.progressDotContainer}>
          {dots.map((page) => (
            <div
              key={page}
              className={`${styles.progressDot} ${page <= currentPage ? styles.active : ''}`}
            />
          ))}
        </div>
        <span className={styles.progressText} style={{ fontSize: '10px' }}>
          {currentPage} / {totalPages}
        </span>
      </div>
    </div>
  );
}

export default ProgressIndicator;
