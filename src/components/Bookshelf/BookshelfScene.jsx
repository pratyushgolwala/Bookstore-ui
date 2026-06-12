import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ShelfRow from './ShelfRow';
import { groupBooksByCategory } from '../../utils/bookshelfUtils.js';

/**
 * BookshelfScene — Root 3D canvas component for the interactive bookshelf.
 * Renders a vintage wooden bookshelf with books organized by category.
 * Lazy-loaded via React.lazy for performance.
 *
 * @param {Object} props
 * @param {Array} props.books - Flat array of book objects to display
 * @param {boolean} [props.interactive=true] - When false, disables interactions and applies overlay
 * @param {function} props.onBookSelect - Callback invoked when a book spine is clicked
 */
export default function BookshelfScene({ books = [], interactive = true, onBookSelect }) {
  const booksByCategory = groupBooksByCategory(books);
  const categories = Object.keys(booksByCategory);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: '#2C1810' }}
      >
        {/* Warm ambient light for cozy library atmosphere */}
        <ambientLight intensity={0.6} color="#FFF8E1" />

        {/* Directional light simulating window light */}
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        {/* Shelf rows — one per category, vertically spaced */}
        {categories.map((category, index) => (
          <ShelfRow
            key={category}
            category={category}
            books={booksByCategory[category]}
            yPosition={-index * 3}
            interactive={interactive}
            onBookSelect={onBookSelect}
          />
        ))}

        {/* OrbitControls for camera interaction, only when interactive */}
        {interactive && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
        )}
      </Canvas>

      {/* Non-interactive overlay — reduced opacity to communicate non-interactivity */}
      {!interactive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
