import Toast from './Toast';
import styles from './Toast.module.css';

/**
 * ToastContainer — renders active toasts in the bottom-right corner
 */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
