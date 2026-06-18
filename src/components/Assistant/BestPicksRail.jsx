import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, AlertCircle, Clock, TrendingUp, Flame } from 'lucide-react';
import COLORS from '../../constants/colors';
import { booksService } from '../../services/booksService';
import { parseBooksResponse } from '../../utils/bookNormalizer';
import { formatCurrency } from '../../utils/formatters';

/**
 * BestPicksRail — a fast, catalog-driven rail of book picks.
 *
 * Renamed from the old LLM-backed "Picked for you" rail: that called the slow
 * /recommendations agent loop and frequently timed out. This version pulls a
 * pool of books straight from the Django catalog (one request) and derives
 * three tabs client-side, so it always loads quickly:
 *
 *   - New      — most recently published (published_year desc)
 *   - Popular  — fewest copies left in stock (a "selling well" proxy)
 *   - Trending — a deterministic rotation so the strip feels fresh
 *
 * The catalog has no per-book view tracking, so "Trending" is a stable,
 * seeded ordering rather than real view counts. Clicking a card opens it via
 * the provided onSelect handler.
 *
 * @param {{ onSelect?: (book) => void }} props
 */

const TABS = [
  { key: 'new', label: 'New', icon: Clock },
  { key: 'popular', label: 'Popular', icon: TrendingUp },
  { key: 'trending', label: 'Trending', icon: Flame },
];

const POOL_SIZE = 40; // books to fetch once, then slice into tabs
const RAIL_SIZE = 12; // cards shown per tab

/** Deterministic FNV-1a hash so "trending" order is stable across renders. */
function hashId(str = '') {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function BestPicksRail({ onSelect }) {
  const [pool, setPool] = useState([]);
  const [tab, setTab] = useState('new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const envelope = await booksService.getBooks({ page: 1, pageSize: POOL_SIZE });
      const { books } = parseBooksResponse(envelope);
      setPool(books);
    } catch (err) {
      setError(err.message || 'Could not load books right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derive the three orderings from the single fetched pool (no extra calls).
  const sections = useMemo(() => {
    const byNew = [...pool].sort(
      (a, b) => (b.publishedYear || 0) - (a.publishedYear || 0),
    );
    const byPopular = [...pool].sort(
      (a, b) => (a.stock ?? 0) - (b.stock ?? 0),
    );
    const byTrending = [...pool].sort(
      (a, b) => hashId(a.id) - hashId(b.id),
    );
    return {
      new: byNew.slice(0, RAIL_SIZE),
      popular: byPopular.slice(0, RAIL_SIZE),
      trending: byTrending.slice(0, RAIL_SIZE),
    };
  }, [pool]);

  const books = sections[tab] || [];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pt-6 pb-2">
      {/* Heading + tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
              Best Picks
            </h2>
            <p className="text-xs mt-1" style={{ color: COLORS.parchment.textSoft }}>
              Fresh from the Folio shelves
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-sm"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors"
                style={
                  active
                    ? { backgroundColor: COLORS.cloth, color: '#fdf6e6' }
                    : { backgroundColor: 'transparent', color: COLORS.text.secondary }
                }
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
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
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <RailSkeleton key={i} />)
          : books.map((book) => (
              <PickCard key={book.id} book={book} onSelect={onSelect} />
            ))}
        {!loading && !error && books.length === 0 && (
          <p className="text-sm py-6" style={{ color: COLORS.parchment.textSoft }}>
            No books to show yet.
          </p>
        )}
      </div>
    </section>
  );
}

function PickCard({ book, onSelect }) {
  return (
    <button
      onClick={() => onSelect?.(book)}
      className="group shrink-0 text-left rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 150,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
      title={book.title}
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

export default BestPicksRail;
