import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Menu, X, User, LogOut, ShoppingCart } from 'lucide-react';
import COLORS from '../../constants/colors';
import AuthPopup from '../auth-popup/AuthPopup';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../store/slices/authSlice';
import './Navbar.css';

/**
 * Navbar — Clean, minimal navigation with smooth dropdown and auth popup
 */
function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Explore',
      submenu: [
        { label: 'All Books', href: '/books' },
        { label: 'Categories', href: '/categories' },
        { label: 'Featured', href: '/featured' },
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
    {
      label: 'Account',
      submenu: [
        { label: 'My Books', href: '/my-books' },
        { label: 'Wishlist', href: '/wishlist' },
        { label: 'Settings', href: '/settings' },
      ],
    },
  ];

  const handleNavClick = (href) => {
    navigate(href);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className="navbar"
        style={{
          backgroundColor: COLORS.background,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div className="navbar-container">
          {/* Mobile Menu Button - Left */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: COLORS.text.primary }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo - Center */}
          <div
            className="navbar-logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="logo-icon"
              style={{
                background: COLORS.gradient.primary,
              }}
            >
              <BookOpen size={20} color="white" strokeWidth={2.5} />
            </div>
            <span
              className="logo-text"
              style={{
                background: COLORS.gradient.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              BookStore
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="nav-item-wrapper"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className="nav-link"
                  style={{ color: COLORS.text.primary }}
                >
                  {item.label}
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === item.label && (
                  <div
                    className="dropdown-menu"
                    style={{
                      boxShadow: `0 8px 32px rgba(92, 92, 143, 0.3)`,
                    }}
                  >
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.label}
                        className="dropdown-item"
                        onClick={() => handleNavClick(subitem.href)}
                        style={{ color: COLORS.text.primary }}
                      >
                        {subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side - Auth / User Menu */}
          {isAuthenticated ? (
            <div
              className="nav-item-wrapper"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
              style={{ position: 'relative' }}
            >
              <button
                className="auth-toggle"
                style={{
                  background: COLORS.gradient.primary,
                  color: COLORS.text.inverse,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <User size={16} />
                {currentUser?.first_name || currentUser?.email?.split('@')[0] || 'Profile'}
              </button>

              {userMenuOpen && (
                <div
                  className="dropdown-menu"
                  style={{
                    boxShadow: `0 8px 32px rgba(92, 92, 143, 0.3)`,
                    right: 0,
                    left: 'auto',
                  }}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => { handleNavClick('/profile'); setUserMenuOpen(false); }}
                    style={{ color: COLORS.text.primary }}
                  >
                    <User size={14} style={{ marginRight: '8px' }} />
                    My Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { handleNavClick('/orders'); setUserMenuOpen(false); }}
                    style={{ color: COLORS.text.primary }}
                  >
                    <ShoppingCart size={14} style={{ marginRight: '8px' }} />
                    My Orders
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      dispatch(logout());
                      setUserMenuOpen(false);
                      navigate('/');
                    }}
                    style={{ color: COLORS.error }}
                  >
                    <LogOut size={14} style={{ marginRight: '8px' }} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="auth-toggle"
              onClick={() => setAuthPopupOpen(true)}
              style={{
                background: COLORS.gradient.primary,
                color: COLORS.text.inverse,
              }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu"
            style={{
              backgroundColor: COLORS.surfaceLight,
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            {navItems.map((item) => (
              <div key={item.label} className="mobile-nav-group">
                <div
                  className="mobile-nav-label"
                  style={{ color: COLORS.text.primary }}
                >
                  {item.label}
                </div>
                <div className="mobile-submenu">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.label}
                      className="mobile-nav-item"
                      onClick={() => handleNavClick(subitem.href)}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {isAuthenticated ? (
              <>
                <button
                  className="mobile-nav-item"
                  onClick={() => handleNavClick('/profile')}
                  style={{ color: COLORS.text.secondary }}
                >
                  My Profile
                </button>
                <button
                  className="mobile-nav-item"
                  onClick={() => handleNavClick('/orders')}
                  style={{ color: COLORS.text.secondary }}
                >
                  My Orders
                </button>
                <button
                  className="mobile-auth-btn"
                  onClick={() => {
                    dispatch(logout());
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  style={{
                    background: COLORS.gradient.accent,
                    color: COLORS.text.inverse,
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="mobile-auth-btn"
                onClick={() => {
                  setAuthPopupOpen(true);
                  setMobileMenuOpen(false);
                }}
                style={{
                  background: COLORS.gradient.primary,
                  color: COLORS.text.inverse,
                }}
              >
                Sign In / Up
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Auth Popup */}
      <AuthPopup isOpen={authPopupOpen} onClose={() => setAuthPopupOpen(false)} />
    </>
  );
}

export default Navbar;
