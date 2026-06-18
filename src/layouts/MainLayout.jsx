import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import ToastHost from '../components/Toast/ToastHost';
import ChatWidget from '../components/Assistant/ChatWidget';
import { selectCurrentUser } from '../store/slices/authSlice';
import { fetchCart, resetCart } from '../store/slices/cartSlice';
import { hydrateWishlist, resetWishlist } from '../store/slices/wishlistSlice';
import COLORS from '../constants/colors';

/**
 * MainLayout — wraps all public-facing pages with professional styling.
 * Hosts the global toast renderer and keeps the cart + wishlist in sync with
 * the logged-in user (fetch on login, reset on logout).
 */
function MainLayout() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const prevUserId = useRef(currentUser?.id ?? null);

  useEffect(() => {
    const userId = currentUser?.id ?? null;
    if (userId === prevUserId.current) return;

    if (userId) {
      // Logged in (or switched user) — load that user's cart from the backend
      // (shared with the AI assistant) + their wishlist.
      dispatch(fetchCart());
      dispatch(hydrateWishlist(userId));
    } else {
      // Logged out — clear the in-memory cart + wishlist
      dispatch(resetCart());
      dispatch(resetWishlist());
    }
    prevUserId.current = userId;
  }, [currentUser, dispatch]);

  return (
    <div className="flex flex-col min-h-screen relative" style={{ backgroundColor: COLORS.background }}>
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer — asymmetric editorial colophon */}
      <footer
        className="border-t mt-auto"
        style={{
          backgroundColor: COLORS.neutral[100],
          borderColor: COLORS.border,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand — takes the wide left column */}
            <div className="lg:col-span-5">
              <h3
                className="font-display text-3xl font-bold mb-3"
                style={{ color: COLORS.text.primary }}
              >
                Folio
              </h3>
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: COLORS.text.secondary }}
              >
                An independent reading room on the web. We keep the lights low,
                the shelves full, and the coffee close. Pull up a chair.
              </p>
              <p
                className="text-xs mt-6 tracking-[0.2em] uppercase"
                style={{ color: COLORS.text.tertiary }}
              >
                Open all hours · Everywhere
              </p>
            </div>

            {/* Link columns — pushed to the right, uneven on purpose */}
            <div className="lg:col-span-2 lg:col-start-7">
              <FooterCol
                title="The Shop"
                links={['Browse Books', 'For Authors', 'About Us']}
              />
            </div>
            <div className="lg:col-span-2">
              <FooterCol
                title="Help"
                links={['Help Center', 'Contact Us', 'FAQs']}
              />
            </div>
            <div className="lg:col-span-2">
              <FooterCol
                title="Fine Print"
                links={['Terms', 'Privacy', 'Cookies']}
              />
            </div>
          </div>

          <div
            className="border-t mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            style={{
              borderColor: COLORS.border,
              color: COLORS.text.tertiary,
            }}
          >
            <p>&copy; {new Date().getFullYear()} Folio. Set in Fraunces &amp; Inter.</p>
            <p className="italic font-display">“So many books, so little time.”</p>
          </div>
        </div>
      </footer>

      {/* Global toast notifications — available on all pages via toastBus */}
      <ToastHost />

      {/* Floating AI assistant — shown to logged-in users on all pages */}
      <ChatWidget />
    </div>
  );
}

/* Small editorial footer column — links styled as a quiet list. */
function FooterCol({ title, links }) {
  return (
    <div>
      <h4
        className="text-xs font-bold mb-4 uppercase tracking-[0.18em]"
        style={{ color: COLORS.brass }}
      >
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((label) => (
          <li key={label}>
            <a
              href="#"
              className="transition-colors hover:text-cream"
              style={{ color: COLORS.text.secondary }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainLayout;
