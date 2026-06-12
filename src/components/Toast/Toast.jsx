import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

/**
 * Individual Toast notification
 * Crazy attractive dark-theme toasts with animated glow effects
 */
function Toast({ id, type = 'info', message, duration = 4000, onRemove }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(id), 400);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  const config = {
    success: {
      icon: <CheckCircle size={20} />,
      className: styles.toastSuccess,
      progressClass: styles.progressSuccess,
    },
    error: {
      icon: <XCircle size={20} />,
      className: styles.toastError,
      progressClass: styles.progressError,
    },
    warning: {
      icon: <AlertTriangle size={20} />,
      className: styles.toastWarning,
      progressClass: styles.progressWarning,
    },
    info: {
      icon: <Info size={20} />,
      className: styles.toastInfo,
      progressClass: styles.progressInfo,
    },
  };

  const { icon, className, progressClass } = config[type] || config.info;

  return (
    <div
      className={`${styles.toast} ${className} ${isLeaving ? styles.toastLeave : styles.toastEnter}`}
      style={{ '--duration': `${duration}ms` }}
    >
      {/* Glow overlay */}
      <div className={styles.toastGlow} />

      {/* Content */}
      <div className={styles.toastContent}>
        <div className={styles.toastIcon}>{icon}</div>
        <p className={styles.toastMessage}>{message}</p>
        <button className={styles.toastClose} onClick={handleRemove}>
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={`${styles.progressFill} ${progressClass}`} />
      </div>
    </div>
  );
}

export default Toast;
