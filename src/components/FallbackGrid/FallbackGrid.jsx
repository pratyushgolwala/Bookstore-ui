import BookCard from '../ui/BookCard';
import COLORS from '../../constants/colors';

/**
 * FallbackGrid — responsive 2D book grid for mobile / non-WebGL devices,
 * and reused as the "grid view" on the Books page.
 *
 * @param {{ books: Array, onBookSelect: (book: object) => void }} props
 */
function FallbackGrid({ books, onBookSelect }) {
  if (!books || books.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: COLORS.text.tertiary }}>
        No books to display.
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 p-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      role="region"
      aria-label="Book catalog"
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onBookSelect} />
      ))}
    </div>
  );
}

export default FallbackGrid;
