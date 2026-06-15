import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import BookSpine from './BookSpine';
import { computeSpineThickness } from '../../utils/bookshelfUtils.js';
import { createWoodTexture, createWoodBumpMap } from '../../utils/textureGenerators.js';

/**
 * ShelfRow — A horizontal shelf that holds books of a single category.
 * Renders a richly-textured vintage wood shelf plank, a category label,
 * and maps books to BookSpine components positioned left-to-right.
 */
function ShelfRow({ category, books, yPosition, interactive, onBookSelect }) {
  // Shelf plank dimensions
  const shelfWidth = 12;
  const shelfHeight = 0.18;
  const shelfDepth = 1.6;

  // Generate wood textures once per component instance
  const woodTexture = useMemo(() => createWoodTexture(512, 256, '#3D2817', '#2A1B0F'), []);
  const woodBump = useMemo(() => createWoodBumpMap(), []);

  // Calculate x positions for books left-to-right with spacing
  const spacing = 0.06;
  const bookPositions = [];
  let currentX = -shelfWidth / 2 + 0.4;

  books.forEach((book) => {
    const thickness = computeSpineThickness(book.pageCount);
    const xCenter = currentX + thickness / 2;
    bookPositions.push(xCenter);
    currentX += thickness + spacing;
  });

  return (
    <group position={[0, yPosition, 0]}>
      {/* Main shelf plank — vintage dark wood */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[shelfWidth, shelfHeight, shelfDepth]} />
        <meshStandardMaterial
          map={woodTexture}
          bumpMap={woodBump}
          bumpScale={0.02}
          roughness={0.75}
          metalness={0.05}
          color="#5a3d14"
        />
      </mesh>

      {/* Shelf front lip — a thin raised edge for depth */}
      <mesh position={[0, -1.05 + shelfHeight / 2 + 0.04, shelfDepth / 2 - 0.05]}>
        <boxGeometry args={[shelfWidth, 0.08, 0.1]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.7}
          metalness={0.08}
          color="#4a3320"
        />
      </mesh>

      {/* Vertical side panel — left */}
      <mesh position={[-shelfWidth / 2 - 0.08, 0, 0]}>
        <boxGeometry args={[0.16, 2.4, shelfDepth]} />
        <meshStandardMaterial
          map={woodTexture}
          bumpMap={woodBump}
          bumpScale={0.015}
          roughness={0.8}
          metalness={0.05}
          color="#3D2817"
        />
      </mesh>

      {/* Vertical side panel — right */}
      <mesh position={[shelfWidth / 2 + 0.08, 0, 0]}>
        <boxGeometry args={[0.16, 2.4, shelfDepth]} />
        <meshStandardMaterial
          map={woodTexture}
          bumpMap={woodBump}
          bumpScale={0.015}
          roughness={0.8}
          metalness={0.05}
          color="#3D2817"
        />
      </mesh>

      {/* Category label — gold-accented text matching site secondary color */}
      <Text
        position={[-shelfWidth / 2 + 0.4, 1.35, 0.85]}
        fontSize={0.22}
        color="#d4933e"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.05}
      >
        {category.toUpperCase()}
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
