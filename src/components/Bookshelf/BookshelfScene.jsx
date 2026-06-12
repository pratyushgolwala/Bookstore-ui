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
 * Lay books into rows that fit within SHELF_WIDTH. Each book's spine
 * thickness determines how much horizontal space it takes.
 * @param {object[]} books
 * @returns {{ book: object, x: number, row: number, index: number }[]}
 */
function layoutBooks(books) {
  const placements = [];
  let row = 0;
  let cursor = -SHELF_WIDTH / 2 + SIDE_MARGIN;

  books.forEach((book, index) => {
    const thickness = computeSpineThickness(book.pageCount);
    // Wrap to next row if this book would overflow the shelf width
    if (cursor + thickness > SHELF_WIDTH / 2 - SIDE_MARGIN) {
      row += 1;
      cursor = -SHELF_WIDTH / 2 + SIDE_MARGIN;
    }
    const x = cursor + thickness / 2;
    placements.push({ book, x, row, index, thickness });
    cursor += thickness + BOOK_GAP;
  });

  const rowCount = row + 1;
  return { placements, rowCount };
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
  const { placements, rowCount } = useMemo(() => layoutBooks(books), [books]);

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

        {/* Warm library lighting */}
        <ambientLight intensity={0.45} color="#FFE8C8" />
        <directionalLight position={[6, centerY + 6, 9]} intensity={0.85} color="#FFF0D4" />
        <directionalLight position={[-6, centerY + 2, 5]} intensity={0.25} color="#9a8cff" />
        <pointLight position={[0, centerY, 6]} intensity={0.5} color="#d4933e" distance={30} decay={2} />

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
          const y = topY - row * ROW_HEIGHT - ROW_HEIGHT / 2 + 1.05;
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
