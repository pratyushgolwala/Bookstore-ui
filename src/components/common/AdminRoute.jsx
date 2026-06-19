import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';

/**
 * AdminRoute — gates a route behind an ADMIN role.
 *
 * - Unauthenticated users are redirected to /login.
 * - Authenticated non-admins are redirected home with a toast.
 *
 * Usage:
 *   <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
 */
function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const warned = useRef(false);

  const isAdmin = user?.role === 'ADMIN' || user?.is_staff === true || user?.is_superuser === true;

  useEffect(() => {
    if (!warned.current && (!isAuthenticated || !isAdmin)) {
      warned.current = true;
      emitToast(
        'warning',
        isAuthenticated
          ? 'You need admin access to view this page.'
          : 'Please log in to access this page.',
      );
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
