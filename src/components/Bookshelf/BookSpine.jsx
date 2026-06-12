import { useState, useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { computeSpineThickness, assignSpineColor } from '../../utils/bookshelfUtils.js';
import { createSpineTexture } from '../../utils/textureGenerators.js';

/**
 * BookSpine — A single 3D book on the shelf with textured leather-like material.
 * Features spine decoration, gold text, and interactive hover glow.
 */
function BookSpine({ book, index, position, interactive, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const thickness = computeSpineThickness(book.pageCount);
  const height = 2;
  const depth = 1.2;
  const color = assignSpineColor(index);

  // Generate a spine texture for this book
  const spineTexture = useMemo(() => createSpineTexture(128, 256, color), [color]);

  const handlePointerOver = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect(book);
  };

  // Slightly varied height per book for realism
  const heightVariation = height + (book.pageCount % 7) * 0.03 - 0.1;

  return (
    <group position={position} scale={hovered ? [1.04, 1.04, 1.04] : [1, 1, 1]}>
      {/* Main book body */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[thickness, heightVariation, depth]} />
        <meshStandardMaterial
          map={spineTexture}
          color={color}
          roughness={0.65}
          metalness={0.05}
          emissive={hovered ? '#d4933e' : '#000000'}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>

      {/* Page edges — visible on the top, a lighter cream color */}
      <mesh position={[0, heightVariation / 2 + 0.01, 0]}>
        <boxGeometry args={[thickness - 0.02, 0.02, depth - 0.04]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.9} metalness={0} />
      </mesh>

      {/* Spine title text — warm gold like site's secondary accent */}
      <Text
        position={[0, 0, depth / 2 + 0.01]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.1}
        maxWidth={heightVariation * 0.8}
        color={hovered ? '#f0b870' : '#e6a657'}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        fontWeight="bold"
      >
        {book.title}
      </Text>
    </group>
  );
}

export default BookSpine;
