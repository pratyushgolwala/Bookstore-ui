import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { reviewsService } from '../../services/reviewsService';
import COLORS from '../../constants/colors';
import ScrollReelReviews from './ScrollReelReviews';

/* Deterministic sepia portrait per reviewer (backend reviews carry no
 * avatar). Same name → same face, so the reel is stable across renders. */
function portraitFor(seed) {
  const n = (Math.abs(hash(seed)) % 70) + 1; // pravatar has 1..70
  return `https://i.pravatar.cc/240?img=${n}`;
}

function hash(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/* The reviews API envelope can paginate; results may be at
 * data.results (paginated) or data (bare list). */
function extractReviews(env) {
  const data = env?.data ?? env;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * BookReviews — fetches a book's reviews and renders them in the
 * scroll-reel. Shown inside the book detail view.
 *
 * @param {{ bookId: string }} props
 */
export default function BookReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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
          .map((r) => {
            const author = r.user_name || r.user_email || 'Anonymous Reader';
            return {
              quote: r.body || r.title,
              author: r.rating ? `${author} · ${'★'.repeat(r.rating)}` : author,
              image: portraitFor(author),
              alt: `Portrait of ${author}`,
              rating: r.rating,
            };
          });
        setReviews(mapped);
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

  return (
    <div className="px-6 pb-6">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare size={18} style={{ color: COLORS.secondary[400] }} />
        <h3 className="text-base font-bold" style={{ color: COLORS.text.primary }}>
          Reader Reviews
        </h3>
        <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
          ({reviews.length})
        </span>
      </div>
      <ScrollReelReviews reviews={reviews} />
    </div>
  );
}
