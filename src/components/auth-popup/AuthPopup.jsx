import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import COLORS from '../../constants/colors';
import './AuthPopup.css';

/**
 * AuthPopup — Smooth popup with Sign In and Sign Up options
 */
function AuthPopup({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/register');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`auth-popup-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.5)',
        }}
      />

      {/* Popup */}
      <div
        className={`auth-popup ${isOpen ? 'open' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceLight} 100%)`,
          border: `1px solid ${COLORS.border}`,
          boxShadow: `0 16px 48px rgba(92, 92, 143, 0.3)`,
        }}
      >
        {/* Close Button */}
        <button
          className="auth-popup-close"
          onClick={onClose}
          style={{ color: COLORS.text.primary }}
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="auth-popup-content">
          <h2
            className="auth-popup-title"
            style={{ color: COLORS.text.primary }}
          >
            Welcome to BookStore
          </h2>
          <p
            className="auth-popup-subtitle"
            style={{ color: COLORS.text.secondary }}
          >
            Choose how you'd like to continue
          </p>

          {/* Buttons */}
          <div className="auth-popup-buttons">
            <button
              className="auth-popup-btn primary"
              onClick={handleSignIn}
              style={{
                background: COLORS.gradient.primary,
                color: COLORS.text.inverse,
              }}
            >
              Sign In
            </button>

            <button
              className="auth-popup-btn secondary"
              onClick={handleSignUp}
              style={{
                borderColor: COLORS.primary[500],
                color: COLORS.primary[500],
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Divider */}
          <div
            className="auth-popup-divider"
            style={{ borderColor: COLORS.border }}
          >
            <span style={{ color: COLORS.text.tertiary }}>or</span>
          </div>

          {/* Guest Option */}
          <p
            className="auth-popup-guest"
            style={{ color: COLORS.text.secondary }}
          >
            Continue browsing as guest
          </p>
          <button
            className="auth-popup-btn ghost"
            onClick={onClose}
            style={{
              color: COLORS.text.primary,
              borderColor: COLORS.border,
            }}
          >
            Browse Books
          </button>
        </div>
      </div>
    </>
  );
}

export default AuthPopup;
