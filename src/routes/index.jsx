import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Auth3DBook from '../components/Auth3DBook/Auth3DBook';
import ProtectedRoute from '../components/common/ProtectedRoute';
import lazyWithReload from '../utils/lazyWithReload';

const LandingPage     = lazyWithReload(() => import('../pages/Landing/LandingPage'));
const BooksPage       = lazyWithReload(() => import('../pages/Books/BooksPage'));
const CartPage        = lazyWithReload(() => import('../pages/Cart/CartPage'));
const OrdersPage      = lazyWithReload(() => import('../pages/Orders/OrdersPage'));
const ProfilePage     = lazyWithReload(() => import('../pages/Profile/ProfilePage'));
const AdminPage       = lazyWithReload(() => import('../pages/Admin/AdminPage'));
const NotFoundPage    = lazyWithReload(() => import('../pages/NotFound/NotFoundPage'));
const VerifyEmailPage = lazyWithReload(() => import('../pages/Auth/VerifyEmailPage'));

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - without MainLayout */}
      <Route path="login"        element={<Auth3DBook />}     />
      <Route path="register"     element={<Auth3DBook />}     />
      <Route path="verify-email" element={<VerifyEmailPage />} />

      {/* Main app routes - with MainLayout */}
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route index element={<LandingPage />} />

        {/* Protected — require login */}
        <Route path="books"   element={<ProtectedRoute><BooksPage /></ProtectedRoute>}   />
        <Route path="cart"    element={<ProtectedRoute><CartPage /></ProtectedRoute>}    />
        <Route path="orders"  element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}  />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="admin"   element={<ProtectedRoute><AdminPage /></ProtectedRoute>}   />

        <Route path="*"       element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
