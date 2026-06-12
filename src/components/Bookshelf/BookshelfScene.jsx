import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import ShelfRow from './ShelfRow';
import { groupBooksByCategory } from '../../utils/bookshelfUtils.js';

/**
 * BookshelfScene — Root 3D canvas for the interactive vintage bookshelf.
 * Background matches the site's dark theme (#0f0f0f).
 * Warm candlelight-style lighting for cozy library atmosphere.
 * Lazy-loaded via React.lazy for performance.
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
        style={{ background: '#0f0f0f' }}
        gl={{ antialias: true, toneMapping: 3 }}
        dpr={[1, 2]}
      >
        {/* Camera angled for 3D depth perception */}
        <PerspectiveCamera
          makeDefault
          position={[1.5, centerY + 1.5, 13]}
          fov={52}
          near={0.1}
          far={100}
        />

        {/* Subtle environment map for realistic reflections on wood */}
        <Environment preset="apartment" background={false} />

        {/* Warm ambient — candlelit library feel */}
        <ambientLight intensity={0.35} color="#FFE4B5" />

        {/* Key light — warm directional from upper right (like a desk lamp) */}
        <directionalLight
          position={[6, 4, 6]}
          intensity={0.9}
          color="#FFF0D4"
          castShadow
        />

        {/* Fill light — subtle cool indigo from left to add depth */}
        <directionalLight
          position={[-6, 2, 3]}
          intensity={0.2}
          color="#5c5c8f"
        />

        {/* Warm point light — simulating a nearby candle/lamp */}
        <pointLight
          position={[3, centerY + 2, 4]}
          intensity={0.6}
          color="#d4933e"
          distance={20}
          decay={2}
        />

        {/* Subtle backlight for rim separation */}
        <pointLight
          position={[-2, centerY, -3]}
          intensity={0.15}
          color="#5c5c8f"
          distance={15}
          decay={2}
        />

        {/* Background plane — fades into site's dark color */}
        <mesh position={[0, centerY, -3]}>
          <planeGeometry args={[30, 25]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* Shelf rows — one per category */}
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

        {/* OrbitControls for camera interaction */}
        {interactive && (
          <OrbitControls
            target={[0, centerY, 0]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI * 0.7}
            minPolarAngle={Math.PI * 0.3}
            minDistance={6}
            maxDistance={22}
            enableDamping={true}
            dampingFactor={0.05}
          />
        )}
      </Canvas>

      {/* Non-interactive overlay */}
      {!interactive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.3)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
