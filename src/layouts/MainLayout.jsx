import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import ToastHost from '../components/Toast/ToastHost';
import ChatWidget from '../components/Assistant/ChatWidget';
import AuthGateModal from '../components/common/AuthGateModal';
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
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const prevUserId = useRef(null);

  const userId = currentUser?.id ?? null;

  useEffect(() => {
    // Run on mount and whenever the user changes. On a page refresh the user is
    // already logged in, so we must fetch here too (not only on a login
    // transition) — otherwise the cart stays empty until something mutates it.
    if (userId) {
      // Logged in — load this user's cart from the backend (shared with the AI
      // assistant) + their wishlist.
      dispatch(fetchCart());
      dispatch(hydrateWishlist(userId));
    } else if (prevUserId.current) {
      // Transitioned to logged-out — clear the in-memory cart + wishlist.
      dispatch(resetCart());
      dispatch(resetWishlist());
    }
    prevUserId.current = userId;
  }, [userId, dispatch]);

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
                links={[
                  // Browse the catalog — public, no auth required.
                  { label: 'Browse Books', to: '/books' },
                  // "For Authors" routes to sign up (no dedicated author
                  // registration page exists, so use the normal signup).
                  { label: 'For Authors', to: '/register' },
                  // About Us → Landing / Home.
                  { label: 'About Us', to: '/' },
                ]}
                onNavigate={navigate}
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

      {/* App-wide "Sign in to continue" gate for guest actions */}
      <AuthGateModal />

      {/* Floating AI assistant — shown to logged-in users on all pages */}
      <ChatWidget />
    </div>
  );
}

/* Small editorial footer column — links styled as a quiet list.
 * Accepts either plain string labels (decorative, href="#") or
 * { label, to } objects that navigate via the router. */
function FooterCol({ title, links, onNavigate }) {
  return (
    <div>
      <h4
        className="text-xs font-bold mb-4 uppercase tracking-[0.18em]"
        style={{ color: COLORS.brass }}
      >
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => {
          const label = typeof link === 'string' ? link : link.label;
          const to = typeof link === 'string' ? null : link.to;
          return (
            <li key={label}>
              <a
                href={to || '#'}
                onClick={(e) => {
                  if (to && onNavigate) {
                    e.preventDefault();
                    onNavigate(to);
                  }
                }}
                className="transition-colors hover:text-cream"
                style={{ color: COLORS.text.secondary }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MainLayout;
