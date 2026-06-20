import { useEffect, useState } from 'react';
import { MessageSquare, Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsService } from '../../services/reviewsService';
import COLORS from '../../constants/colors';

/* The reviews API envelope can paginate; results may be at
 * data.results (paginated) or data (bare list). */
function extractReviews(env) {
  const data = env?.data ?? env;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stars({ rating = 0, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? COLORS.secondary[500] : 'transparent'}
          color={i <= rating ? COLORS.secondary[500] : COLORS.neutral[600]}
        />
      ))}
    </span>
  );
}

/**
 * BookReviews — fetches a book's reviews and shows them in a clean
 * single-card carousel. Shown inside the book detail view.
 *
 * @param {{ bookId: string }} props
 */
export default function BookReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!bookId) return undefined;
    let cancelled = false;
    setLoading(true);
    reviewsService
      .getReviews({ book: bookId })
      .then((env) => {
        if (cancelled) return;
        const mapped = extractReviews(env)
          .filter((r) => (r.body || r.title || '').trim())
          .map((r) => ({
            id: r.id,
            name: r.user_name || r.user_email || 'Anonymous Reader',
            title: r.title || '',
            body: r.body || r.title,
            rating: r.rating || 0,
            createdAt: r.created_at,
          }));
        setReviews(mapped);
        setActive(0);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (loading) {
    return (
      <div className="px-6 py-8 text-center text-sm" style={{ color: COLORS.text.tertiary }}>
        Loading reviews…
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div
        className="mx-6 mb-6 flex items-center gap-3 rounded-xl px-5 py-6 text-sm"
        style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, color: COLORS.text.tertiary }}
      >
        <MessageSquare size={18} style={{ color: COLORS.secondary[400] }} />
        No reviews yet — be the first to share your thoughts on this book.
      </div>
    );
  }

  const count = reviews.length;
  const r = reviews[active];
  const go = (dir) => setActive((i) => Math.min(Math.max(i + dir, 0), count - 1));
  const avg = (reviews.reduce((s, x) => s + (x.rating || 0), 0) / count).toFixed(1);

  return (
    <div className="px-6 pb-6">
      {/* Header with average rating */}
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare size={18} style={{ color: COLORS.secondary[400] }} />
        <h3 className="text-base font-bold" style={{ color: COLORS.text.primary }}>
          Reader Reviews
        </h3>
        <span className="text-xs" style={{ color: COLORS.text.tertiary }}>({count})</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs" style={{ color: COLORS.text.secondary }}>
          <Stars rating={Math.round(avg)} size={13} />
          <span className="font-semibold" style={{ color: COLORS.text.primary }}>{avg}</span>
          <span style={{ color: COLORS.text.tertiary }}>avg</span>
        </span>
      </div>

      {/* Review card */}
      <div
        className="relative rounded-xl p-5 sm:p-6"
        style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}
      >
        <Quote size={28} style={{ color: `${COLORS.secondary[400]}55` }} aria-hidden="true" />

        <div key={r.id || active} className="book-review-fade mt-2 min-h-[96px]" aria-live="polite">
          {r.title && (
            <p className="text-sm font-bold mb-1" style={{ color: COLORS.text.primary }}>
              {r.title}
            </p>
          )}
          <p className="text-[15px] leading-relaxed" style={{ color: COLORS.text.secondary }}>
            {r.body}
          </p>
        </div>

        {/* Reviewer row */}
        <div className="mt-5 flex items-center gap-3 pt-4 border-t" style={{ borderColor: COLORS.border }}>
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
            style={{ background: COLORS.gradient.primary, color: '#fff' }}
          >
            {(r.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate" style={{ color: COLORS.text.primary }}>{r.name}</p>
            <div className="flex items-center gap-2">
              <Stars rating={r.rating} size={12} />
              {r.createdAt && (
                <span className="text-[11px]" style={{ color: COLORS.text.tertiary }}>· {timeAgo(r.createdAt)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to review ${i + 1}`}
                onClick={() => setActive(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === active ? 18 : 6,
                  backgroundColor: i === active ? COLORS.secondary[500] : COLORS.border,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: COLORS.text.tertiary }}>{active + 1} / {count}</span>
            <NavButton onClick={() => go(-1)} disabled={active === 0} label="Previous review" icon={<ChevronLeft size={15} />} />
            <NavButton onClick={() => go(1)} disabled={active === count - 1} label="Next review" icon={<ChevronRight size={15} />} />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ onClick, disabled, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full transition-transform duration-200 hover:enabled:scale-110 active:enabled:scale-95 disabled:opacity-40"
      style={{ border: `1px solid ${COLORS.border}`, backgroundColor: 'transparent', color: COLORS.text.secondary }}
    >
      {icon}
    </button>
  );
}
