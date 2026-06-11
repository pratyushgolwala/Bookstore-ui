import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import COLORS from '../../constants/colors';
import AuthPopup from '../auth-popup/AuthPopup';
import './Navbar.css';

/**
 * Navbar — Clean, minimal navigation with smooth dropdown and auth popup
 */
function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

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

          {/* Right Side - Auth Button */}
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
          </div>
        )}
      </nav>

      {/* Auth Popup */}
      <AuthPopup isOpen={authPopupOpen} onClose={() => setAuthPopupOpen(false)} />
    </>
  );
}

export default Navbar;
