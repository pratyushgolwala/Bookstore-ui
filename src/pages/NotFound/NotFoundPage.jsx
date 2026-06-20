import { Link } from 'react-router-dom';
import COLORS from '../../constants/colors';

/**
 * NotFoundPage — 404 fallback.
 */
function NotFoundPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }} className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 style={{ color: COLORS.brass }} className="text-8xl font-bold mb-4">404</h1>
      <h2 style={{ color: COLORS.text.primary }} className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p style={{ color: COLORS.text.secondary }} className="mb-8">The page you are looking for does not exist.</p>
      <Link
        to="/"
        style={{
          backgroundColor: COLORS.cloth,
          color: '#fdf6e6',
        }}
        className="px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
