import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ShoppingCart, Check, BookOpen, Globe, Calendar, Package } from 'lucide-react';
import { addItem } from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../ui/Badge';
import WishlistButton from '../ui/WishlistButton';
import AuthorLink from '../ui/AuthorLink';
import BookReviews from '../ui/BookReviews';
import MetalButton from '../ui/MetalButton';

/**
 * BookDetailCard — a polished modal overlay showing full book details.
 * Closes on outside click or Escape. Matches the dark library theme.
 */
export default function BookDetailCard({ book, onClose }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cardRef = useRef(null);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      emitToast('warning', 'Please log in to add books to your cart.');
      return;
    }
    dispatch(addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      quantity: 1,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
    }));
    emitToast('success', `"${book.title}" added to cart.`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const onDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  if (!book) return null;

  const inStock = (book.stock ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-label={`Book details for ${book.title}`}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.secondary }}
        >
          <X size={18} />
        </button>

        {/* Scrollable body: details row on top, reviews reel below */}
        <div className="overflow-y-auto flex flex-col">
          <div className="flex flex-col md:flex-row">
            {/* Cover */}
            <div
              className="md:w-2/5 flex items-center justify-center p-6 relative"
              style={{ background: COLORS.gradient.dark }}
            >
              {/* Wishlist heart — top-right of the image section */}
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton book={book} size={18} />
              </div>
              <img
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
                className="w-44 h-64 object-cover rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/${encodeURIComponent(book.id)}/240/360`;
                }}
              />
            </div>

            {/* Details */}
            <div className="md:w-3/5 p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {book.category && <Badge variant="secondary">{book.category}</Badge>}
                <Badge variant={inStock ? 'success' : 'neutral'}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>

              <h2 className="font-display text-3xl font-bold leading-tight" style={{ color: COLORS.text.primary }}>
                {book.title}
              </h2>
              <p className="text-sm italic" style={{ color: COLORS.text.secondary }}>
                by <AuthorLink author={book.author} onNavigate={onClose} />
              </p>

              {book.description && (
                <p className="text-sm leading-relaxed line-clamp-4" style={{ color: COLORS.text.secondary }}>
                  {book.description}
                </p>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {book.publishedYear && (
                  <Meta icon={<Calendar size={15} />} label="Published" value={book.publishedYear} />
                )}
                {book.language && (
                  <Meta icon={<Globe size={15} />} label="Language" value={book.language.toUpperCase()} />
                )}
                {book.pageCount && (
                  <Meta icon={<BookOpen size={15} />} label="Pages" value={book.pageCount} />
                )}
                <Meta icon={<Package size={15} />} label="Stock" value={book.stock ?? 0} />
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                <span className="font-display text-4xl font-bold" style={{ color: COLORS.brass }}>
                  {formatCurrency(book.price)}
                </span>
                <MetalButton
                  variant="gold"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="gap-2"
                >
                  {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {added ? 'Added!' : 'Add to Cart'}
                </MetalButton>
              </div>
            </div>
          </div>

          {/* Reviews — scroll-reel of reader reviews for this book */}
          <div className="border-t" style={{ borderColor: COLORS.border }}>
            <BookReviews bookId={book.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: COLORS.primary[600] }}>{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
          {label}
        </span>
        <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
          {value}
        </span>
      </div>
    </div>
  );
}
