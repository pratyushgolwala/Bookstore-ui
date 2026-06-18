import { useState } from 'react';
import { ShoppingCart, Check, Quote } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from './Badge';
import WishlistButton from './WishlistButton';
import AuthorLink from './AuthorLink';

/**
 * BookCard — editorial book card for the asymmetric masonry wall.
 *
 * `variant` controls height so cards interlock and pack flush:
 *   • tall      — larger cover (2/3), cover-forward
 *   • standard  — 3/4 cover
 *   • compact   — shorter 4/5 cover, tight title block
 *   • blurb     — standard cover + a short pull-quote that fills the body
 *
 * Flat book-cloth palette, serif title, brass price. No gradients.
 */

const COVER_RATIO = {
  tall: '2 / 3',
  standard: '3 / 4',
  compact: '5 / 6',
  blurb: '3 / 4',
};

// Short rotating shelf-talker lines used for the "blurb" variant.
const SHELF_TALKERS = [
  'A staff favourite this season.',
  'Could not put it down.',
  'One for a long evening.',
  'Quietly brilliant.',
  'Worth the late night.',
  'A small, perfect thing.',
];

function BookCard({ book, onSelect, variant = 'standard' }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [added, setAdded] = useState(false);

  const quickAdd = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      emitToast('warning', 'Please log in to add books to your cart.');
      return;
    }
    try {
      await dispatch(addToCart({ bookId: book.id, quantity: 1 })).unwrap();
      emitToast('success', `"${book.title}" added to cart.`);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      emitToast('error', err || 'Could not add to cart.');
    }
  };

  const onImgError = (e) => {
    e.target.src = `https://picsum.photos/seed/${encodeURIComponent(book.id)}/320/440`;
  };

  const ratio = COVER_RATIO[variant] || COVER_RATIO.standard;
  const isBlurb = variant === 'blurb';
  const talker = SHELF_TALKERS[(book.id?.length || 0) % SHELF_TALKERS.length];

  return (
    <article
      onClick={() => onSelect?.(book)}
      className="group relative flex flex-col rounded-sm overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: ratio }}>
        <img
          src={book.coverImageUrl}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          onError={onImgError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
          style={{ background: 'linear-gradient(to top, rgba(20,12,6,0.92), transparent 65%)' }}
        >
          <button
            onClick={quickAdd}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-sm text-sm font-semibold transition-colors"
            style={{ backgroundColor: COLORS.cloth, color: '#fdf6e6' }}
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Added' : 'Add to Cart'}
          </button>
        </div>
        {book.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">{book.category}</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton book={book} size={16} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-display text-base font-semibold leading-snug"
          style={{ color: COLORS.text.primary }}
        >
          {book.title}
        </h3>
        <AuthorLink
          author={book.author}
          className="text-xs mt-1 line-clamp-1 block w-fit max-w-full italic"
          style={{ color: COLORS.text.tertiary }}
        />

        {/* blurb variant fills the body with a shelf-talker quote */}
        {isBlurb && (
          <div
            className="mt-3 pl-3 border-l-2 flex gap-1.5"
            style={{ borderColor: COLORS.brass }}
          >
            <Quote size={13} style={{ color: COLORS.brass }} className="shrink-0 mt-0.5" />
            <p className="text-xs italic leading-relaxed" style={{ color: COLORS.text.secondary }}>
              {talker}
            </p>
          </div>
        )}

        <p className="font-display text-lg font-bold mt-3" style={{ color: COLORS.brass }}>
          {formatCurrency(book.price)}
        </p>
      </div>
    </article>
  );
}

export default BookCard;
