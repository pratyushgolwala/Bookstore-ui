/**
 * toastBus — a tiny global pub/sub so any component (navbar, cards, etc.)
 * can trigger a toast without prop-drilling or context boilerplate.
 *
 * A single <ToastHost /> (mounted in MainLayout) subscribes and renders them.
 *
 * Usage:
 *   import { emitToast } from '../../utils/toastBus';
 *   emitToast('warning', 'Please log in to view your cart.');
 */
const listeners = new Set();
let counter = 0;

/**
 * Broadcast a toast to the mounted ToastHost.
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} message
 * @param {number} [duration=4000] ms before auto-dismiss
 */
export function emitToast(type, message, duration = 4000) {
  const toast = {
    id: `gt-${Date.now()}-${counter++}`,
    type,
    message,
    duration,
  };
  listeners.forEach((fn) => fn(toast));
}

/**
 * Subscribe to toast events. Returns an unsubscribe function.
 * @param {(toast: object) => void} fn
 */
export function subscribeToast(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
