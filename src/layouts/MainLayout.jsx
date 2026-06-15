import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import ToastContainer from '../components/Toast/ToastContainer';
import useToast from '../hooks/useToast';
import COLORS from '../constants/colors';

/**
 * MainLayout — wraps all public-facing pages with professional styling
 */
function MainLayout() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex flex-col min-h-screen relative" style={{ backgroundColor: COLORS.background }}>
      <Navbar />

      <main className="flex-1 ">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="py-12 border-t mt-auto"
        style={{
          backgroundColor: COLORS.neutral[100],
          borderColor: COLORS.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            {/* Brand */}
            <div>
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                BookStore
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                Your premier platform for discovering and sharing books with readers worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className="text-sm font-bold mb-4 uppercase tracking-wide"
                style={{ color: COLORS.text.primary }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Browse Books
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    For Authors
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4
                className="text-sm font-bold mb-4 uppercase tracking-wide"
                style={{ color: COLORS.text.primary }}
              >
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4
                className="text-sm font-bold mb-4 uppercase tracking-wide"
                style={{ color: COLORS.text.primary }}
              >
                Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:opacity-80 hover:text-blue-400"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-t pt-8 text-center text-sm"
            style={{
              borderColor: COLORS.border,
              color: COLORS.text.tertiary,
            }}
          >
            <p>&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Global toast notifications — top-right, available on all pages */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default MainLayout;
