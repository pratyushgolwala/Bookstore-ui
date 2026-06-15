import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';

/**
 * ProtectedRoute — gates a route behind authentication.
 * Unauthenticated users are redirected to /login and shown a toast.
 *
 * Usage:
 *   <Route path="books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const warned = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !warned.current) {
      warned.current = true;
      emitToast('warning', 'Please log in to access this page.');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Remember where they were headed so we can return after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
