import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Sparkles, RotateCcw, AlertCircle } from 'lucide-react';
import COLORS from '../../constants/colors';
import { assistantService } from '../../services/assistantService';
import { booksService } from '../../services/booksService';
import { normalizeBook } from '../../utils/bookNormalizer';
import { formatCurrency } from '../../utils/formatters';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

/**
 * RecommendationsRail — an AI-curated horizontal rail of book picks.
 *
 * Calls the assistant's /recommendations endpoint, then enriches each pick
 * with full catalog detail (cover, price, author) so they render as real
 * cards. Clicking a card opens it via the provided onSelect handler.
 *
 * Renders nothing for logged-out users (the assistant requires a token) or
 * when the service yields no picks, so it degrades quietly.
 *
 * @param {{ query?: string, onSelect?: (book) => void }} props
 */
function RecommendationsRail({ query = null, onSelect }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [books, setBooks] = useState([]);
  const [reasons, setReasons] = useState({}); // book_id -> reason
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assistantService.recommend({ query, limit: 8 });
      const picks = res?.results ?? [];

      if (picks.length === 0) {
        setBooks([]);
        return;
      }

      // Enrich each pick with full catalog detail. Some picks may 404 if the
      // model returns a stale id — those are dropped silently.
      const reasonMap = {};
      picks.forEach((p) => { reasonMap[String(p.book_id)] = p.reason; });
      setReasons(reasonMap);

      const detailed = await Promise.all(
        picks.map(async (p) => {
          try {
            const envelope = await booksService.getBookById(p.book_id);
            const raw = envelope?.data ?? envelope;
            return normalizeBook(raw);
          } catch {
            return null;
          }
        }),
      );

      setBooks(detailed.filter(Boolean));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  // Hide entirely for logged-out users.
  if (!isAuthenticated) return null;

  // Hide quietly if there's nothing to show and we're not mid-load/error.
  if (!loading && !error && books.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pt-6 pb-2">
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: COLORS.cloth }}
          >
            <Sparkles size={16} color="#fdf6e6" />
          </span>
          <div>
            <h2
              className="font-display text-xl font-bold leading-none"
              style={{ color: COLORS.parchment.text }}
            >
              Picked for you
            </h2>
            <p className="text-xs mt-1" style={{ color: COLORS.parchment.textSoft }}>
              {query ? `Because you searched “${query}”` : 'Curated by the Folio assistant'}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-sm transition-colors disabled:opacity-50"
          style={{ color: COLORS.cloth, border: `1px solid ${COLORS.parchment.border}` }}
          title="Refresh recommendations"
        >
          <RotateCcw size={13} className={loading ? 'cw-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-sm mb-2"
          style={{ backgroundColor: `${COLORS.error}18`, color: COLORS.error, border: `1px solid ${COLORS.error}33` }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Rail */}
      <div className="flex gap-4 overflow-x-auto pb-3 cw-rail">
        {loading && books.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <RailSkeleton key={i} />)
          : books.map((book) => (
              <RecCard
                key={book.id}
                book={book}
                reason={reasons[String(book.id)]}
                onSelect={onSelect}
              />
            ))}
      </div>
    </section>
  );
}

function RecCard({ book, reason, onSelect }) {
  return (
    <button
      onClick={() => onSelect?.(book)}
      className="group shrink-0 text-left rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 150,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
      title={reason || book.title}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '2 / 3' }}>
        <img
          src={book.coverImageUrl}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(book.id)}/240/360`;
          }}
        />
      </div>
      <div className="p-2.5">
        <h3
          className="font-display text-sm font-semibold line-clamp-2 leading-snug"
          style={{ color: COLORS.text.primary }}
        >
          {book.title}
        </h3>
        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: COLORS.text.tertiary }}>
          {book.author}
        </p>
        <p className="font-display text-sm font-bold mt-1" style={{ color: COLORS.brass }}>
          {formatCurrency(book.price)}
        </p>
        {reason && (
          <p className="text-[11px] mt-1.5 line-clamp-2 leading-snug" style={{ color: COLORS.text.secondary }}>
            {reason}
          </p>
        )}
      </div>
    </button>
  );
}

function RailSkeleton() {
  return (
    <div
      className="shrink-0 rounded-sm overflow-hidden animate-pulse"
      style={{ width: 150, backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div style={{ aspectRatio: '2 / 3', backgroundColor: COLORS.surfaceLight }} />
      <div className="p-2.5 space-y-2">
        <div className="h-3 w-full rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
      </div>
    </div>
  );
}

export default RecommendationsRail;
