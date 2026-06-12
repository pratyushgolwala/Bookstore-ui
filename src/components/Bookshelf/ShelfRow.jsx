import { Text } from '@react-three/drei';
import BookSpine from './BookSpine';
import { computeSpineThickness } from '../../utils/bookshelfUtils.js';

/**
 * ShelfRow — A horizontal shelf that holds books of a single category.
 * Renders a wood-textured shelf plank, a 3D category label, and
 * maps books to BookSpine components positioned left-to-right.
 *
 * @param {Object} props
 * @param {string} props.category - The category name displayed as a label
 * @param {Array} props.books - Array of book objects to render on this shelf
 * @param {number} props.yPosition - Vertical placement in the scene
 * @param {boolean} props.interactive - Whether book interactions are enabled
 * @param {function} props.onBookSelect - Callback when a book is selected
 */
function ShelfRow({ category, books, yPosition, interactive, onBookSelect }) {
  // Shelf plank dimensions
  const shelfWidth = 12;
  const shelfHeight = 0.1;
  const shelfDepth = 0.5;

  // Calculate x positions for books left-to-right with spacing
  const spacing = 0.05;
  const bookPositions = [];
  let currentX = -shelfWidth / 2 + 0.3; // Start with a small left margin

  books.forEach((book) => {
    const thickness = computeSpineThickness(book.pageCount);
    // Position is at the center of the book spine
    const xCenter = currentX + thickness / 2;
    bookPositions.push(xCenter);
    currentX += thickness + spacing;
  });

  return (
    <group position={[0, yPosition, 0]}>
      {/* Wood-textured shelf plank */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[shelfWidth, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Category label — 3D text above the shelf on the left side */}
      <Text
        position={[-shelfWidth / 2 + 0.2, 1.2, 0.3]}
        fontSize={0.2}
        color="#5C3D2E"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        {category}
      </Text>

      {/* Books positioned left-to-right */}
      {books.map((book, index) => (
        <BookSpine
          key={book.id}
          book={book}
          index={index}
          position={[bookPositions[index], 0, 0]}
          interactive={interactive}
          onSelect={onBookSelect}
        />
      ))}
    </group>
  );
}

export default ShelfRow;
