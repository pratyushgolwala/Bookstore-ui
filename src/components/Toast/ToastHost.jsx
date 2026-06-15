import { useState, useEffect, useCallback } from 'react';
import ToastContainer from './ToastContainer';
import { subscribeToast } from '../../utils/toastBus';
import { playToastSound } from '../../utils/playSound';

/**
 * ToastHost — mounts once (in MainLayout) and renders any toast broadcast
 * through the global toastBus. Lets the navbar, book cards, and other
 * non-auth components raise toasts app-wide.
 */
function ToastHost() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      playToastSound(toast.type);
      setToasts((prev) => [...prev, toast]);
    });
    return unsubscribe;
  }, []);

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}

export default ToastHost;
