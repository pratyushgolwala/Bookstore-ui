import BookCard from '../ui/BookCard';
import COLORS from '../../constants/colors';

/**
 * FallbackGrid — a clean, aligned catalog grid.
 *
 * Uniform columns and equal-height cards so the wall reads as a deliberate,
 * well-kept shelf rather than a ragged auto-layout. Generous gaps give each
 * cover room to breathe.
 *
 * @param {{ books: Array, onBookSelect: (book: object) => void }} props
 */
function FallbackGrid({ books, onBookSelect }) {
  if (!books || books.length === 0) {
    return (
      <div className="p-10 text-center" style={{ color: COLORS.text.tertiary }}>
        No books to display.
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7"
        role="region"
        aria-label="Book catalog"
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} onSelect={onBookSelect} />
        ))}
      </div>
    </div>
  );
}

export default FallbackGrid;
