import BookCard from '../ui/BookCard';
import COLORS from '../../constants/colors';

/**
 * FallbackGrid — responsive 2D book grid for mobile / non-WebGL devices,
 * and reused as the "grid view" on the Books page.
 *
 * Spacious, vintage-feel layout: fewer columns, generous gaps so each book
 * cover has room to breathe like a real display shelf.
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
      className="grid gap-8 sm:gap-10 px-4 sm:px-8 lg:px-12 py-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-w-7xl mx-auto rounded-2xl"
      role="region"
      aria-label="Book catalog"
      style={{ backgroundColor: COLORS.parchment.section }}
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onBookSelect} />
      ))}
    </div>
  );
}

export default FallbackGrid;
