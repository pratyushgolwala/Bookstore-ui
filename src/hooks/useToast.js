import { useState, useCallback } from 'react';

/**
 * useToast — manages toast notifications
 * Returns { toasts, toast } where toast.success/error/warning/info adds a toast
 */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast('success', message, duration),
    error:   (message, duration) => addToast('error',   message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info:    (message, duration) => addToast('info',    message, duration),
  };

  return { toasts, toast, removeToast };
}

export default useToast;
