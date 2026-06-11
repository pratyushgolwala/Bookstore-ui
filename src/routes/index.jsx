import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Auth3DBook from '../components/Auth3DBook/Auth3DBook';

// Lazy-loaded pages — keeps initial bundle small
// TODO: Add a ProtectedRoute wrapper once auth is implemented in a later phase
const LandingPage  = lazy(() => import('../pages/Landing/LandingPage'));
const BooksPage    = lazy(() => import('../pages/Books/BooksPage'));
const CartPage     = lazy(() => import('../pages/Cart/CartPage'));
const OrdersPage   = lazy(() => import('../pages/Orders/OrdersPage'));
const ProfilePage  = lazy(() => import('../pages/Profile/ProfilePage'));
const AdminPage    = lazy(() => import('../pages/Admin/AdminPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - without MainLayout */}
      <Route path="login"    element={<Auth3DBook />}  />
      <Route path="register" element={<Auth3DBook />}  />

      {/* Main app routes - with MainLayout */}
      <Route element={<MainLayout />}>
        <Route index          element={<LandingPage />}  />
        <Route path="books"   element={<BooksPage />}    />
        <Route path="cart"    element={<CartPage />}     />
        <Route path="orders"  element={<OrdersPage />}   />
        <Route path="profile" element={<ProfilePage />}  />
        <Route path="admin"   element={<AdminPage />}    />
        <Route path="*"       element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
