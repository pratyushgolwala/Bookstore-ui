import { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { MapControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import BookSpine from './BookSpine';
import BookshelfFrame from './BookshelfFrame';
import { computeSpineThickness } from '../../utils/bookshelfUtils.js';
import { loadBrickTexture } from '../../utils/textureGenerators.js';

const SHELF_WIDTH = 14; // interior usable width
const ROW_HEIGHT = 2.9;
const ROW_DEPTH = 1.6;
const BOOK_GAP = 0.06;
const SIDE_MARGIN = 0.4;

/**
 * Lay books into rows filling the shelf width compactly (no category grouping).
 * @param {object[]} books
 * @returns {{ placements, rowCount, rowLabels }}
 */
function layoutBooks(books) {
  const placements = [];
  let row = 0;
  let cursor = -SHELF_WIDTH / 2 + SIDE_MARGIN;

  books.forEach((book, index) => {
    const thickness = computeSpineThickness(book.pageCount);
    if (cursor + thickness > SHELF_WIDTH / 2 - SIDE_MARGIN) {
      row += 1;
      cursor = -SHELF_WIDTH / 2 + SIDE_MARGIN;
    }
    const x = cursor + thickness / 2;
    placements.push({ book, x, row, index, thickness });
    cursor += thickness + BOOK_GAP;
  });

  const rowCount = row + 1;
  return { placements, rowCount, rowLabels: [] };
}

/** Brick wall backdrop behind the bookcase. */
function BrickWall({ centerY, height }) {
  const [tex, setTex] = useState(() => loadBrickTexture((loaded) => setTex(loaded)));
  return (
    <mesh position={[0, centerY, -ROW_DEPTH / 2 - 1.2]}>
      <planeGeometry args={[60, Math.max(40, height + 20)]} />
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
  );
}

/**
 * Locks MapControls panning to the bookshelf bounds and disables rotation.
 * Camera moves only on X and Y (no orbit around the shelf).
 */
function ClampedControls({ minX, maxX, minY, maxY, target }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(target[0], target[1], 0);
      controlsRef.current.update();
    }
  }, [target]);

  return (
    <MapControls
      ref={controlsRef}
      enableRotate={false}
      enableDamping
      dampingFactor={0.08}
      screenSpacePanning
      minDistance={6}
      maxDistance={18}
      onChange={() => {
        const c = controlsRef.current;
        if (!c) return;
        // Clamp the pan target to shelf bounds
        c.target.x = THREE.MathUtils.clamp(c.target.x, minX, maxX);
        c.target.y = THREE.MathUtils.clamp(c.target.y, minY, maxY);
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, minY, maxY);
      }}
    />
  );
}

/**
 * BookshelfScene — a realistic wooden bookcase against a brick wall.
 * Books fill horizontal rows; the camera pans on X/Y only (no rotation).
 */
export default function BookshelfScene({
  books = [],
  interactive = true,
  onBookSelect,
}) {
  const { placements, rowCount, rowLabels } = useMemo(() => layoutBooks(books), [books]);

  const topY = ROW_HEIGHT * 0.5;
  const totalHeight = rowCount * ROW_HEIGHT;
  const centerY = topY - totalHeight / 2;

  // Camera framing
  const camY = centerY;
  const panRangeY = totalHeight / 2;

  return (
    <div className="relative w-full" style={{ height: '100%', minHeight: '600px' }}>
      <Canvas
        style={{ background: '#0f0f0f' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, camY, 13]} fov={55} near={0.1} far={120} />

        {/* Bright library lighting — books should be clearly visible */}
        <ambientLight intensity={1.2} color="#FFFFFF" />
        <directionalLight position={[4, centerY + 5, 12]} intensity={1.5} color="#FFFAF0" />
        <directionalLight position={[-4, centerY + 2, 8]} intensity={0.6} color="#E8E0FF" />
        <pointLight position={[0, centerY + 2, 8]} intensity={1.0} color="#FFD700" distance={40} decay={2} />
        <pointLight position={[-5, centerY, 6]} intensity={0.4} color="#FFFFFF" distance={25} decay={2} />

        {/* Brick wall backdrop */}
        <BrickWall centerY={centerY} height={totalHeight} />

        {/* Wooden bookcase frame */}
        <BookshelfFrame
          width={SHELF_WIDTH}
          rowCount={rowCount}
          rowHeight={ROW_HEIGHT}
          rowDepth={ROW_DEPTH}
        />

        {/* Books standing on each shelf */}
        {placements.map(({ book, x, row, index }) => {
          // Shelf plank Y for this row (matches BookshelfFrame logic)
          const frameThickness = 0.35;
          const plankY = topY - frameThickness / 2 - (row + 1) * ROW_HEIGHT + 0.02;
          const plankTopY = plankY + 0.06; // half plank height (0.12/2)
          // Book height varies per book; approximate center above plank
          const bookHeight = 1.9 + (book.pageCount % 9) * 0.035;
          const y = plankTopY + bookHeight / 2;
          return (
            <BookSpine
              key={book.id || index}
              book={book}
              index={index}
              position={[x, y, 0]}
              interactive={interactive}
              onSelect={onBookSelect}
            />
          );
        })}

        {interactive && (
          <ClampedControls
            minX={-SHELF_WIDTH / 2}
            maxX={SHELF_WIDTH / 2}
            minY={centerY - panRangeY}
            maxY={centerY + panRangeY}
            target={[0, camY, 0]}
          />
        )}
      </Canvas>

      {!interactive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.25)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
