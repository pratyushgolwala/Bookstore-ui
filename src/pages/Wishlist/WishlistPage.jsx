import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import {
  selectWishlistItems,
  removeFromWishlist,
  clearWishlist,
} from '../../store/slices/wishlistSlice';
import { addItem } from '../../store/slices/cartSlice';
import { emitToast } from '../../utils/toastBus';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';
import AuthorLink from '../../components/ui/AuthorLink';

const cover = (item) =>
  item.coverImageUrl || `https://picsum.photos/seed/${item.id}/240/360`;

function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectWishlistItems);

  const handleAddToCart = (book) => {
    dispatch(addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      quantity: 1,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
    }));
    emitToast('success', `"${book.title}" added to cart.`);
  };

  const handleRemove = (book) => {
    dispatch(removeFromWishlist(book.id));
    emitToast('info', 'Removed from wishlist.');
  };

  /* ── Empty state ───────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6 pb-16"
        style={{ minHeight: 'calc(100vh - 90px)', backgroundColor: COLORS.parchment.bg }}
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent[200]} 0%, ${COLORS.accent[50]} 100%)`,
            border: `1px solid ${COLORS.accent[300]}`,
            boxShadow: `0 0 48px ${COLORS.accent[400]}22`,
          }}
        >
          <Heart size={46} style={{ color: COLORS.accent[400] }} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: COLORS.parchment.text }}>
          Your wishlist is empty
        </h1>
        <p className="mb-8 max-w-sm leading-relaxed" style={{ color: COLORS.parchment.textSoft }}>
          Tap the heart on any book to save it here for later.
        </p>
        <Button size="lg" onClick={() => navigate('/books')} rightIcon={<ArrowRight size={18} />}>
          Browse the Library
        </Button>
      </div>
    );
  }

  /* ── List ──────────────────────────────────────────────── */
  return (
    <div
      className="px-4 sm:px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: 'calc(100vh - 90px)', backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart size={26} style={{ color: COLORS.accent[400] }} fill={COLORS.accent[400]} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.parchment.text }}>My Wishlist</h1>
            <p className="text-sm mt-1" style={{ color: COLORS.parchment.textSoft }}>
              {items.length} book{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        <button
          onClick={() => { dispatch(clearWishlist()); emitToast('info', 'Wishlist cleared.'); }}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ color: COLORS.error, border: `1px solid ${COLORS.error}33`, backgroundColor: `${COLORS.error}11` }}
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((book) => (
          <div
            key={book.id}
            className="flex gap-4 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
          >
            <img
              src={cover(book)}
              alt={book.title}
              className="w-16 h-24 object-cover rounded-lg shrink-0"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${book.id}/120/180`; }}
            />
            <div className="flex-1 min-w-0 flex flex-col">
              <h3 className="font-semibold text-sm line-clamp-2 leading-snug" style={{ color: COLORS.text.primary }}>
                {book.title}
              </h3>
              {book.author && (
                <AuthorLink
                  author={book.author}
                  className="text-xs mt-0.5 block w-fit max-w-full"
                  style={{ color: COLORS.text.tertiary }}
                />
              )}
              <p className="text-sm font-bold mt-1" style={{ color: COLORS.secondary[500] }}>
                {formatCurrency(book.price)}
              </p>

              <div className="flex items-center gap-2 mt-auto pt-2">
                <button
                  onClick={() => handleAddToCart(book)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
                  style={{ background: COLORS.gradient.primary, color: '#fff' }}
                >
                  <ShoppingCart size={13} /> Add to cart
                </button>
                <button
                  onClick={() => handleRemove(book)}
                  aria-label="Remove from wishlist"
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80 active:scale-90"
                  style={{ color: COLORS.error, backgroundColor: `${COLORS.error}18` }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
