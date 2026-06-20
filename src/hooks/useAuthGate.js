import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { openAuthGate } from '../utils/authGateBus';

/**
 * useAuthGate — centralized guard for guest-restricted ACTIONS.
 *
 * Guests may freely browse, search and read. But any action that writes data
 * (add to cart, review, discussion, reply, like, wishlist, follow, rate,
 * purchase, publish…) must be gated behind authentication.
 *
 * Returns a `requireAuth(action)` function:
 *   - If the user is authenticated, it runs `action()` immediately and returns
 *     its result.
 *   - If the user is a guest, it opens the themed "Sign in to continue" modal
 *     (remembering the current page so login can return here) and does NOT run
 *     the action. Returns false.
 *
 * Example:
 *   const requireAuth = useAuthGate();
 *   const handleAddToCart = () => requireAuth(() => dispatch(addToCart(book)));
 */
export default function useAuthGate() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  return function requireAuth(action) {
    if (isAuthenticated) {
      return typeof action === 'function' ? action() : true;
    }
    // Guest — block the action and prompt sign-in, remembering this page.
    openAuthGate({ from: location.pathname + location.search });
    return false;
  };
}
