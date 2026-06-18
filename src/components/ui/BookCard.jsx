import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from './Badge';
import WishlistButton from './WishlistButton';
import AuthorLink from './AuthorLink';

/**
 * BookCard — an editorial 2D book card for the catalog grid.
 *
 * Equal-height, portrait cover with a title block underneath. Flat book-cloth
 * palette, serif title, brass price. No gradients.
 */
function BookCard({ book, onSelect }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [added, setAdded] = useState(false);

  const quickAdd = (e) => {
    e.stopPropagation();
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
    setTimeout(() => setAdded(false), 1500);
  };

  const onImgError = (e) => {
    e.target.src = `https://picsum.photos/seed/${encodeURIComponent(book.id)}/320/440`;
  };

  return (
    <article
      onClick={() => onSelect?.(book)}
      className="group relative flex flex-col rounded-sm overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
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
          className="font-display text-base font-semibold line-clamp-2 leading-snug min-h-[2.6em]"
          style={{ color: COLORS.text.primary }}
        >
          {book.title}
        </h3>
        <AuthorLink
          author={book.author}
          className="text-xs mt-1 line-clamp-1 block w-fit max-w-full italic"
          style={{ color: COLORS.text.tertiary }}
        />
        <p className="font-display text-lg font-bold mt-3" style={{ color: COLORS.brass }}>
          {formatCurrency(book.price)}
        </p>
      </div>
    </article>
  );
}

export default BookCard;
