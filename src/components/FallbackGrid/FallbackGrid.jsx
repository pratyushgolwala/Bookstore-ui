import BookCard from '../ui/BookCard';
import COLORS from '../../constants/colors';

/**
 * FallbackGrid — an asymmetric, densely-packed book wall.
 *
 * Cards flow into a CSS multi-column (masonry) layout. Their heights vary by
 * design — some promote a cover-forward "tall" treatment, some add a quote or
 * blurb, some are compact — so the columns interlock and pack flush with no
 * dead whitespace. A deterministic variant per book keeps it stable between
 * renders while still reading as a hand-arranged display rather than a grid.
 *
 * @param {{ books: Array, onBookSelect: (book: object) => void }} props
 */

// Cheap stable hash so a given book always gets the same variant.
function hashId(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h;
}

const VARIANTS = ['tall', 'standard', 'blurb', 'standard', 'compact', 'tall'];

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
        className="columns-2 md:columns-3 xl:columns-4 gap-5 sm:gap-6 [column-fill:_balance]"
        role="region"
        aria-label="Book catalog"
      >
        {books.map((book, i) => {
          const variant = VARIANTS[(hashId(book.id) + i) % VARIANTS.length];
          return (
            <div key={book.id} className="mb-5 sm:mb-6 break-inside-avoid">
              <BookCard book={book} onSelect={onBookSelect} variant={variant} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FallbackGrid;
