import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';

/**
 * BookDetailCard — An HTML overlay displaying book details above the 3D canvas.
 * Shows title, author, price, cover image, category, and an "Add to Cart" button.
 * Closes on outside click (mousedown) or Escape key press.
 *
 * @param {{ book: object, onClose: () => void }} props
 * @param {object} props.book - Book object with id, title, author, price, coverImageUrl, category
 * @param {function} props.onClose - Callback to close the detail card
 */
export default function BookDetailCard({ book, onClose }) {
  const dispatch = useDispatch();
  const cardRef = useRef(null);

  const handleAddToCart = useCallback(() => {
    dispatch(
      addItem({
        id: book.id,
        title: book.title,
        price: book.price,
        quantity: 1,
      })
    );
  }, [dispatch, book]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on outside click (mousedown)
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  if (!book) return null;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`Book details for ${book.title}`}
      className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-200
        p-6 flex flex-col items-center gap-4
        max-h-[90vh] overflow-y-auto"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close book details"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700
          w-8 h-8 flex items-center justify-center rounded-full
          hover:bg-gray-100 transition-colors"
      >
        ✕
      </button>

      {/* Cover image */}
      <img
        src={book.coverImageUrl}
        alt={`Cover of ${book.title}`}
        className="w-32 h-48 object-cover rounded-lg shadow-md"
        onError={(e) => {
          e.target.src = 'https://picsum.photos/200/300?grayscale';
        }}
      />

      {/* Category badge */}
      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-900 bg-primary-50 rounded-full">
        {book.category}
      </span>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 text-center leading-tight">
        {book.title}
      </h2>

      {/* Author */}
      <p className="text-sm text-gray-600">
        by {book.author}
      </p>

      {/* Price */}
      <p className="text-2xl font-bold text-primary-500">
        ${typeof book.price === 'number' ? book.price.toFixed(2) : book.price}
      </p>

      {/* Add to Cart button */}
      <button
        onClick={handleAddToCart}
        aria-label={`Add ${book.title} to cart`}
        className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-900
          text-white font-semibold rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Add to Cart
      </button>
    </div>
  );
}
