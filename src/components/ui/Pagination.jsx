import { ChevronLeft, ChevronRight } from 'lucide-react';
import COLORS from '../../constants/colors';

/**
 * Pagination — page navigation with prev/next and a windowed page list.
 *
 * @param {Object} props
 * @param {number} props.currentPage
 * @param {number} props.numPages
 * @param {boolean} props.hasNext
 * @param {boolean} props.hasPrevious
 * @param {(page: number) => void} props.onPageChange
 * @param {boolean} [props.loading]
 */
function Pagination({ currentPage, numPages, hasNext, hasPrevious, onPageChange, loading }) {
  if (numPages <= 1) return null;

  // Build a windowed list of page numbers around the current page
  const window = 2;
  const pages = [];
  const start = Math.max(1, currentPage - window);
  const end = Math.min(numPages, currentPage + window);

  if (start > 1) pages.push(1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < numPages - 1) pages.push('…');
  if (end < numPages) pages.push(numPages);

  const baseBtn =
    'inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <nav className="flex items-center justify-center gap-2 flex-wrap" aria-label="Pagination">
      <button
        className={baseBtn}
        style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious || loading}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} style={{ color: COLORS.text.tertiary }} className="px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            className={baseBtn}
            style={
              p === currentPage
                ? { background: COLORS.gradient.primary, color: COLORS.text.inverse }
                : { backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary }
            }
            onClick={() => onPageChange(p)}
            disabled={loading}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={baseBtn}
        style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || loading}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

export default Pagination;
