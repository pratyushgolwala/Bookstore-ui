import { useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import BookSpine from './BookSpine';
import BookshelfFrame from './BookshelfFrame';
import { computeSpineThickness } from '../../utils/bookshelfUtils.js';
import {
  SECTIONS_PER_ROW,
  ROWS_PER_PAGE,
  BOOKS_PER_SECTION,
  SHELF_PAGE_SIZE,
} from '../../utils/bookshelfUtils.js';
import { createLibraryBackdrop } from '../../utils/textureGenerators.js';

const SHELF_WIDTH = 15;       // interior usable width
const ROW_HEIGHT = 3.0;       // vertical spacing between shelf planks
const ROW_DEPTH = 1.6;        // shelf depth
const DIVIDER_THICKNESS = 0.16;
const SECTION_MARGIN = 0.3;   // inner padding within each section

// Re-export so callers (e.g. tests) can reach it from the scene too
export { SHELF_PAGE_SIZE };

/**
 * Lay books into a fixed grid of sections (like a real library shelf):
 * each section holds up to BOOKS_PER_SECTION books, EVENLY spaced across the
 * section width so every compartment looks filled and balanced.
 */
function layoutBooks(books) {
  const placements = [];

  const sectionOuterWidth = SHELF_WIDTH / SECTIONS_PER_ROW;
  const sectionInnerWidth = sectionOuterWidth - SECTION_MARGIN * 2;
  const sectionLeftEdge = (s) =>
    -SHELF_WIDTH / 2 + s * sectionOuterWidth + SECTION_MARGIN;

  // Chunk books into fixed-size sections
  const sectionCount = Math.ceil(books.length / BOOKS_PER_SECTION);

  for (let sec = 0; sec < sectionCount; sec += 1) {
    const sectionBooks = books.slice(
      sec * BOOKS_PER_SECTION,
      sec * BOOKS_PER_SECTION + BOOKS_PER_SECTION
    );
    const row = Math.floor(sec / SECTIONS_PER_ROW);
    const sectionInRow = sec % SECTIONS_PER_ROW;

    // Even spacing: distribute the leftover width as equal gaps,
    // including margins before the first and after the last book.
    const thicknesses = sectionBooks.map((b) => computeSpineThickness(b.pageCount));
    const totalThickness = thicknesses.reduce((sum, t) => sum + t, 0);
    const gap = Math.max(
      0.04,
      (sectionInnerWidth - totalThickness) / (sectionBooks.length + 1)
    );

    let cursor = sectionLeftEdge(sectionInRow) + gap;
    sectionBooks.forEach((book, i) => {
      const thickness = thicknesses[i];
      const x = cursor + thickness / 2;
      placements.push({
        book,
        x,
        row,
        section: sectionInRow,
        index: sec * BOOKS_PER_SECTION + i,
        thickness,
      });
      cursor += thickness + gap;
    });
  }

  const rowCount = Math.max(ROWS_PER_PAGE, Math.ceil(sectionCount / SECTIONS_PER_ROW));
  return { placements, rowCount };
}

/** Subtle warm library backdrop plane behind the bookcase. */
function Backdrop({ centerY, height }) {
  const tex = useMemo(() => createLibraryBackdrop(), []);
  return (
    <mesh position={[0, centerY, -ROW_DEPTH / 2 - 2]}>
      <planeGeometry args={[70, Math.max(50, height + 30)]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/**
 * BookshelfScene — a STATIC, framed wooden bookcase against a subtle
 * library backdrop. No zoom / no pan (pagination handles navigation).
 * Clicking a book pulls it smoothly out of the shelf, then opens the detail card.
 */
export default function BookshelfScene({
  books = [],
  interactive = true,
  onBookSelect,
  selectedBookId = null,
}) {
  const { placements, rowCount } = useMemo(() => layoutBooks(books), [books]);

  const frameThickness = 0.35;
  const topY = ROW_HEIGHT * 0.5;
  const totalHeight = rowCount * ROW_HEIGHT + frameThickness;
  const centerY = topY - totalHeight / 2;

  // Track which book is animating out of the shelf
  const [pullingId, setPullingId] = useState(null);

  // Reset the pulled book when the detail card closes
  useEffect(() => {
    if (!selectedBookId) setPullingId(null);
  }, [selectedBookId]);

  // Camera distance to FIT the whole shelf in view (static framing)
  const fov = 50;
  const fitDist = useMemo(() => {
    const vFov = (fov * Math.PI) / 180;
    const fitH = (totalHeight + 1.5) / 2 / Math.tan(vFov / 2);
    const aspect = 16 / 9;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const fitW = (SHELF_WIDTH + 2) / 2 / Math.tan(hFov / 2);
    return Math.max(fitH, fitW) + 1.5;
  }, [totalHeight]);

  const handleBookClick = (book) => {
    if (!interactive) return;
    setPullingId(book.id);
  };

  // Target the book animates toward (in front, centred vertically)
  const pullTarget = [0, centerY, fitDist - 5];

  return (
    <div className="relative w-full" style={{ height: '100%', minHeight: '600px' }}>
      <Canvas
        style={{ background: '#0c0a08' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, centerY, fitDist]} fov={fov} near={0.1} far={200} />

        {/* Warm library lighting */}
        <ambientLight intensity={0.85} color="#fff4e6" />
        <directionalLight position={[5, centerY + 6, 14]} intensity={1.1} color="#FFE8C8" />
        <directionalLight position={[-5, centerY + 2, 9]} intensity={0.4} color="#cdd4ff" />
        <pointLight position={[0, centerY + 1, 7]} intensity={0.8} color="#FFC96B" distance={45} decay={2} />

        {/* Subtle backdrop */}
        <Backdrop centerY={centerY} height={totalHeight} />

        {/* Wooden bookcase with sectioned shelves */}
        <BookshelfFrame
          width={SHELF_WIDTH}
          rowCount={rowCount}
          rowHeight={ROW_HEIGHT}
          rowDepth={ROW_DEPTH}
          sectionsPerRow={SECTIONS_PER_ROW}
          dividerThickness={DIVIDER_THICKNESS}
        />

        {/* Books */}
        {placements.map(({ book, x, row, index }) => {
          const plankY = topY - frameThickness / 2 - (row + 1) * ROW_HEIGHT + 0.02;
          const plankTopY = plankY + 0.06;
          const bookHeight = 1.9 + (book.pageCount % 9) * 0.035;
          const y = plankTopY + bookHeight / 2;
          return (
            <BookSpine
              key={book.id || index}
              book={book}
              index={index}
              position={[x, y, 0]}
              interactive={interactive}
              pulling={pullingId === book.id}
              pullTarget={pullTarget}
              onSelect={handleBookClick}
              onPullComplete={() => onBookSelect?.(book)}
            />
          );
        })}
      </Canvas>

      {!interactive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(12, 10, 8, 0.25)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
