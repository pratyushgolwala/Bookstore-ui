import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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

  // Center the camera vertically on all shelves
  const totalHeight = (categories.length - 1) * 3;
  const centerY = -totalHeight / 2;

  return (
    <div className="relative w-full" style={{ height: '100%', minHeight: '600px' }}>
      <Canvas
        style={{ background: '#1A0F0A' }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        {/* Camera angled slightly for 3D depth perception */}
        <PerspectiveCamera
          makeDefault
          position={[2, centerY + 1, 14]}
          fov={55}
          near={0.1}
          far={100}
        />

        {/* Warm ambient light for cozy library atmosphere */}
        <ambientLight intensity={0.5} color="#FFF8E1" />

        {/* Key light — from upper right for 3D depth */}
        <directionalLight position={[8, 6, 8]} intensity={1.0} color="#FFFFFF" />

        {/* Fill light — softer from the left to reduce harsh shadows */}
        <directionalLight position={[-5, 3, 4]} intensity={0.3} color="#FFE4B5" />

        {/* Rim light from behind for edge definition */}
        <pointLight position={[0, centerY, -5]} intensity={0.4} color="#FFA500" />

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
            target={[0, centerY, 0]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.25}
            minDistance={6}
            maxDistance={25}
          />
        )}
      </Canvas>

      {/* Non-interactive overlay — reduced opacity to communicate non-interactivity */}
      {!interactive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
