import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookMarked } from 'lucide-react';
import COLORS from '../../constants/colors';
import { subscribeAuthGate } from '../../utils/authGateBus';
import '../auth-popup/AuthPopup.css';
import './AuthGateModal.css';

/**
 * AuthGateModal — the single, app-wide "Sign in to continue" dialog.
 *
 * Mounted once in MainLayout. Any guest action calls openAuthGate() (usually
 * via the useAuthGate hook), which this component listens for. It reuses the
 * existing AuthPopup styling/animation so it matches the Folio theme exactly.
 *
 * On choosing Sign In / Create Account, we stash the "return to" path in the
 * navigation state so the auth flow can send the user back where they were.
 */
function AuthGateModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [returnTo, setReturnTo] = useState(null);

  // Subscribe to global open events.
  useEffect(() => {
    const unsub = subscribeAuthGate(({ from } = {}) => {
      setReturnTo(from || null);
      setIsOpen(true);
      setIsVisible(true);
    });
    return unsub;
  }, []);

  const close = () => {
    setIsOpen(false);
    const t = setTimeout(() => setIsVisible(false), 300);
    return () => clearTimeout(t);
  };

  const goSignIn = () => {
    setIsOpen(false);
    setIsVisible(false);
    navigate('/login', returnTo ? { state: { from: returnTo } } : undefined);
  };

  const goSignUp = () => {
    setIsOpen(false);
    setIsVisible(false);
    navigate('/register', returnTo ? { state: { from: returnTo } } : undefined);
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`auth-popup-backdrop auth-gate-backdrop ${isOpen ? 'open' : ''}`}
        onClick={close}
        style={{ backgroundColor: 'rgba(15, 15, 15, 0.5)' }}
      />

      <div
        className={`auth-popup auth-gate-popup ${isOpen ? 'open' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceLight} 100%)`,
          border: `1px solid ${COLORS.border}`,
          boxShadow: `0 16px 48px rgba(153, 95, 47, 0.3)`,
        }}
      >
        <button className="auth-popup-close" onClick={close} style={{ color: COLORS.text.primary }}>
          <X size={24} />
        </button>

        <div className="auth-popup-content">
          {/* Brand mark to keep it feeling native to Folio */}
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: COLORS.gradient.primary,
            }}
          >
            <BookMarked size={26} color="#fff" />
          </div>

          <h2 className="auth-popup-title" style={{ color: COLORS.text.primary }}>
            Sign in to continue
          </h2>
          <p className="auth-popup-subtitle" style={{ color: COLORS.text.secondary }}>
            Join Folio to participate in discussions, leave reviews, build your
            library, and support authors.
          </p>

          <div className="auth-popup-buttons">
            <button
              className="auth-popup-btn primary"
              onClick={goSignIn}
              style={{ background: COLORS.gradient.primary, color: COLORS.text.inverse }}
            >
              Sign In
            </button>

            <button
              className="auth-popup-btn secondary"
              onClick={goSignUp}
              style={{ borderColor: COLORS.primary[500], color: COLORS.primary[500] }}
            >
              Create Account
            </button>
          </div>

          <div className="auth-popup-divider" style={{ borderColor: COLORS.border }}>
            <span style={{ color: COLORS.text.tertiary }}>or</span>
          </div>

          <button
            className="auth-popup-btn ghost"
            onClick={close}
            style={{ color: COLORS.text.primary, borderColor: COLORS.border }}
          >
            Keep browsing
          </button>
        </div>
      </div>
    </>
  );
}

export default AuthGateModal;
