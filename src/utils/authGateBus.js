/**
 * authGateBus — a tiny global pub/sub for the "Sign in to continue" gate.
 *
 * Guests can browse freely, but any action that modifies data (add to cart,
 * review, discussion, wishlist, follow, rate, purchase, publish, etc.) must be
 * gated. Instead of scattering auth checks + modal markup across the app, any
 * component calls `openAuthGate()` and a single <AuthGateModal/> (mounted in
 * MainLayout) renders the themed dialog.
 *
 * Usage (via the useAuthGate hook — preferred):
 *   const requireAuth = useAuthGate();
 *   requireAuth(() => dispatch(addToCart(book)));   // runs only if signed in
 *
 * Or directly:
 *   import { openAuthGate } from '../utils/authGateBus';
 *   openAuthGate({ from: '/books' });
 */
const listeners = new Set();

/**
 * Open the auth gate modal.
 * @param {object} [opts]
 * @param {string} [opts.from] Path to return to after login (defaults to the
 *                             current location in the modal component).
 */
export function openAuthGate(opts = {}) {
  listeners.forEach((fn) => fn(opts));
}

/**
 * Subscribe to auth-gate open events. Returns an unsubscribe function.
 * @param {(opts: object) => void} fn
 */
export function subscribeAuthGate(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
