import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookMarked, Menu, X, User, LogOut, ShoppingCart,
  Heart, Settings, Library, LogIn, Bell,
} from 'lucide-react';
import COLORS from '../../constants/colors';
import AuthPopup from '../auth-popup/AuthPopup';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { emitToast } from '../../utils/toastBus';
import { notificationsService } from '../../services/notificationsService';
import './Navbar.css';

const BRAND = 'Folio';

/**
 * Navbar — Folio bookstore navigation.
 * Left: brand. Center: Explore / Community. Right: account menu.
 * Hides on scroll-down, reveals on scroll-up.
 */
function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const cartCount = useSelector(selectCartCount);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const lastScrollY = useRef(0);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsService.getNotifications();
      const data = res.data?.results || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silent fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // silent fail
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setHidden(false);
      } else if (currentY > lastScrollY.current + 6) {
        setHidden(true);
        setActiveDropdown(null);
        setAccountMenuOpen(false);
      } else if (currentY < lastScrollY.current - 6) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const centerNav = [
    {
      label: 'Explore',
      submenu: [
        { label: 'All Books', href: '/books' },
        { label: 'Categories', href: '/categories' },
      ],
    },
    {
      label: 'Community',
      submenu: [
        { label: 'Authors', href: '/authors' },
        { label: 'Reviews', href: '/reviews' },
        { label: 'Discussions', href: '/discussions' },
      ],
    },
  ];

  const accountLinks = [
    // "My Books" is author-only — added conditionally below
    ...(currentUser?.role === 'AUTHOR'
      ? [{ label: 'My Books', href: '/author', icon: <Library size={15} /> }]
      : []),
    { label: 'Wishlist', href: '/wishlist', icon: <Heart size={15} /> },
    { label: 'Orders', href: '/orders', icon: <ShoppingCart size={15} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={15} /> },
  ];

  const go = (href) => {
    navigate(href);
    setActiveDropdown(null);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Cart requires login — otherwise prompt the user to sign in
  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      emitToast('warning', 'Please log in to view your cart.');
      setAuthPopupOpen(true);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${hidden ? 'navbar-hidden' : ''}`}>
        <div className="navbar-container">
          {/* ── LEFT: Brand — typographic wordmark, not an icon-in-a-box ── */}
          <div className="navbar-brand" onClick={() => navigate('/')}>
            <span className="brand-mark" aria-hidden="true">Fo</span>
            <span className="brand-name">{BRAND}</span>
            <span className="brand-sub">est. reading room</span>
          </div>

          {/* ── CENTER: Explore / Community ── */}
          <div className="navbar-center">
            {centerNav.map((item) => (
              <div
                key={item.label}
                className="nav-item-wrapper"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="nav-link">{item.label}</button>
                {activeDropdown === item.label && (
                  <div className="dropdown-menu">
                    {item.submenu.map((sub) => (
                      <button key={sub.label} className="dropdown-item" onClick={() => go(sub.href)}>
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── RIGHT: Account ── */}
          <div className="navbar-right">
            {/* Notification Bell — authenticated only */}
            {isAuthenticated && (
              <div
                className="nav-item-wrapper"
                onMouseEnter={() => setNotifOpen(true)}
                onMouseLeave={() => setNotifOpen(false)}
              >
                <button className="notif-btn" aria-label="Notifications">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="notif-badge">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="dropdown-menu dropdown-right notif-dropdown">
                    <div className="notif-header">
                      <span style={{ color: COLORS.text.primary, fontWeight: 600 }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button className="notif-mark-all" onClick={handleMarkAllRead}
                          style={{ color: COLORS.primary[600] }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="account-divider" />
                    {notifications.length === 0 ? (
                      <div className="notif-empty" style={{ color: COLORS.text.tertiary }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <div key={n.id}
                          className={`notif-item ${!n.is_read ? 'notif-unread' : ''}`}
                          style={{ borderColor: COLORS.border }}
                        >
                          <p className="notif-title" style={{ color: COLORS.text.primary }}>{n.title}</p>
                          <p className="notif-msg" style={{ color: COLORS.text.secondary }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart button — always visible */}
            <button
              className="cart-btn"
              onClick={handleCartClick}
              aria-label={`Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            >
              <ShoppingCart size={18} />
              {isAuthenticated && cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div
                className="nav-item-wrapper"
                onMouseEnter={() => setAccountMenuOpen(true)}
                onMouseLeave={() => setAccountMenuOpen(false)}
              >
                <button className="account-btn">
                  <User size={18} color="#f0e6d0" />
                </button>
                {accountMenuOpen && (
                  <div className="dropdown-menu dropdown-right">
                    <div className="account-header">
                      <span className="account-name">
                        {currentUser?.first_name || currentUser?.email?.split('@')[0] || 'Reader'}
                      </span>
                      {currentUser?.email && (
                        <span className="account-email">{currentUser.email}</span>
                      )}
                    </div>
                    <div className="account-divider" />
                    {accountLinks.map((link) => (
                      <button key={link.label} className="dropdown-item icon-item" onClick={() => go(link.href)}>
                        {link.icon}
                        {link.label}
                      </button>
                    ))}
                    <div className="account-divider" />
                    <button className="dropdown-item icon-item logout-item" onClick={handleLogout}>
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="signin-btn"
                onClick={() => setAuthPopupOpen(true)}
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {centerNav.map((item) => (
              <div key={item.label} className="mobile-nav-group">
                <div className="mobile-nav-label">{item.label}</div>
                <div className="mobile-submenu">
                  {item.submenu.map((sub) => (
                    <button key={sub.label} className="mobile-nav-item" onClick={() => go(sub.href)}>
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {isAuthenticated ? (
              <div className="mobile-nav-group">
                <div className="mobile-nav-label">Account</div>
                <div className="mobile-submenu">
                  <button className="mobile-nav-item" onClick={handleCartClick}>
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                  {accountLinks.map((link) => (
                    <button key={link.label} className="mobile-nav-item" onClick={() => go(link.href)}>
                      {link.label}
                    </button>
                  ))}
                  <button className="mobile-nav-item" style={{ color: COLORS.error }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="mobile-auth-btn"
                onClick={() => { setAuthPopupOpen(true); setMobileMenuOpen(false); }}
              >
                Sign In / Up
              </button>
            )}
          </div>
        )}
      </nav>

      <AuthPopup isOpen={authPopupOpen} onClose={() => setAuthPopupOpen(false)} />
    </>
  );
}

export default Navbar;
