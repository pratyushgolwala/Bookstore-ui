import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Auth3DBook from '../components/Auth3DBook/Auth3DBook';
import ProtectedRoute from '../components/common/ProtectedRoute';

const LandingPage     = lazy(() => import('../pages/Landing/LandingPage'));
const BooksPage       = lazy(() => import('../pages/Books/BooksPage'));
const CategoriesPage  = lazy(() => import('../pages/Categories/CategoriesPage'));
const CartPage        = lazy(() => import('../pages/Cart/CartPage'));
const OrdersPage      = lazy(() => import('../pages/Orders/OrdersPage'));
const ProfilePage     = lazy(() => import('../pages/Profile/ProfilePage'));
const AdminPage       = lazy(() => import('../pages/Admin/AdminPage'));
const DiscussionPage  = lazy(() => import('../pages/Discussion/DiscussionPage'));
const ReviewsPage     = lazy(() => import('../pages/Reviews/ReviewsPage'));
const WishlistPage    = lazy(() => import('../pages/Wishlist/WishlistPage'));
const SettingsPage    = lazy(() => import('../pages/Settings/SettingsPage'));
const NotFoundPage    = lazy(() => import('../pages/NotFound/NotFoundPage'));
const VerifyEmailPage = lazy(() => import('../pages/Auth/VerifyEmailPage'));

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
        <Route path="categories"  element={<CategoriesPage />} />
        <Route path="discussions" element={<DiscussionPage />} />
        <Route path="reviews"     element={<ReviewsPage />}    />

        {/* Protected — require login */}
        <Route path="books"    element={<ProtectedRoute><BooksPage /></ProtectedRoute>}    />
        <Route path="cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>}     />
        <Route path="orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}   />
        <Route path="profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}  />
        <Route path="admin"    element={<ProtectedRoute><AdminPage /></ProtectedRoute>}    />
        <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*"       element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
