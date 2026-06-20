import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Auth3DBook from '../components/Auth3DBook/Auth3DBook';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import lazyWithReload from '../utils/lazyWithReload';

const LandingPage      = lazyWithReload(() => import('../pages/Landing/LandingPage'));
const BooksPage        = lazyWithReload(() => import('../pages/Books/BooksPage'));
const CategoriesPage   = lazyWithReload(() => import('../pages/Categories/CategoriesPage'));
const AuthorsPage      = lazyWithReload(() => import('../pages/Authors/AuthorsPage'));
const CartPage         = lazyWithReload(() => import('../pages/Cart/CartPage'));
const OrdersPage       = lazyWithReload(() => import('../pages/Orders/OrdersPage'));
const CheckoutPage     = lazyWithReload(() => import('../pages/Checkout/CheckoutPage'));
const ProfilePage      = lazyWithReload(() => import('../pages/Profile/ProfilePage'));
const AdminPage        = lazyWithReload(() => import('../pages/Admin/AdminPage'));
const AuthorDashboard  = lazyWithReload(() => import('../pages/Author/AuthorDashboard'));
const DiscussionPage   = lazyWithReload(() => import('../pages/Discussion/DiscussionPage'));
const ReviewsPage      = lazyWithReload(() => import('../pages/Reviews/ReviewsPage'));
const WishlistPage     = lazyWithReload(() => import('../pages/Wishlist/WishlistPage'));
const SettingsPage     = lazyWithReload(() => import('../pages/Settings/SettingsPage'));
const TrackingPage     = lazyWithReload(() => import('../pages/Tracking/TrackingPage'));
const NotFoundPage     = lazyWithReload(() => import('../pages/NotFound/NotFoundPage'));
const VerifyEmailPage  = lazyWithReload(() => import('../pages/Auth/VerifyEmailPage'));
const AdminSSO         = lazyWithReload(() => import('../pages/Auth/AdminSSO'));

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - without MainLayout */}
      <Route path="login"        element={<Auth3DBook />}     />
      <Route path="register"     element={<Auth3DBook />}     />
      <Route path="verify-email" element={<VerifyEmailPage />} />
      {/* SSO handoff from the Django admin — reads tokens from the URL hash */}
      <Route path="admin/sso"    element={<AdminSSO />} />

      {/* Main app routes - with MainLayout */}
      <Route element={<MainLayout />}>
        {/* Public — guests may browse, search and read freely */}
        <Route index element={<LandingPage />} />
        <Route path="books"       element={<BooksPage />} />
        <Route path="categories"  element={<CategoriesPage />} />
        <Route path="authors"     element={<AuthorsPage />} />
        <Route path="discussions" element={<DiscussionPage />} />
        <Route path="reviews"     element={<ReviewsPage />} />

        {/* Protected — require login (write operations / personal data) */}
        <Route path="cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>}     />
        <Route path="orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}   />
        <Route path="orders/:orderId/track" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}  />
        <Route path="admin"    element={<AdminRoute><AdminPage /></AdminRoute>}    />
        <Route path="author"   element={<ProtectedRoute><AuthorDashboard /></ProtectedRoute>} />
        <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
