import { useEffect } from 'react';
import styles from '../Auth3DBook.module.css';

/**
 * PageTurnAnimation — Renders 3D book page-turn animation
 * Triggers onComplete callback after animation finishes
 *
 * @param {Object} props
 * @param {Function} props.onComplete - Callback after animation completes
 * @param {Number} props.pageCount - Number of page turns (5, 8, or 10)
 * @param {Number} props.duration - Total animation duration in ms (800-1000)
 * @param {Boolean} props.isSignup - Whether animation is for signup flow
 */
function PageTurnAnimation({ onComplete, pageCount = 8, duration = 900, isSignup = false }) {
  // Determine animation class based on page count
  const getAnimationClass = () => {
    switch (pageCount) {
      case 5:
        return styles.bookFlip5;
      case 8:
        return styles.bookFlip8;
      case 10:
        return styles.bookFlip10;
      default:
        return styles.bookFlip8;
    }
  };

  // Determine book container class
  const bookContainerClass = isSignup
    ? `${styles.bookFlipContainer} ${styles.signup}`
    : styles.bookFlipContainer;

  useEffect(() => {
    // Schedule callback after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className={styles.pageAnimation}>
      <div className={bookContainerClass}>
        <div
          className={getAnimationClass()}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1a1a1a',
            border: '1px solid #3d3d3d',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            transformStyle: 'preserve-3d',
          }}
        />
      </div>
    </div>
  );
}

export default PageTurnAnimation;
