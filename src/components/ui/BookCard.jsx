import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from './Badge';

/**
 * BookCard — a polished 2D book card for grids.
 * Shows cover, title, author, price, category, and a quick add-to-cart.
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

  return (
    <div
      onClick={() => onSelect?.(book)}
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
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
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%)' }}
        >
          <button
            onClick={quickAdd}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold"
            style={{ background: COLORS.gradient.primary, color: COLORS.text.inverse }}
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
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3
          className="text-sm font-semibold line-clamp-2 leading-snug"
          style={{ color: COLORS.text.primary }}
        >
          {book.title}
        </h3>
        <p className="text-xs mt-1 line-clamp-1" style={{ color: COLORS.text.tertiary }}>
          {book.author}
        </p>
        <p className="text-base font-bold mt-auto pt-2" style={{ color: COLORS.secondary[500] }}>
          {formatCurrency(book.price)}
        </p>
      </div>
    </div>
  );
}

export default BookCard;
