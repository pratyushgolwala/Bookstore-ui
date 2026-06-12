import { useState, useRef } from 'react';
import { Text } from '@react-three/drei';
import { computeSpineThickness, assignSpineColor } from '../../utils/bookshelfUtils.js';

/**
 * BookSpine — A single 3D book mesh on the shelf.
 * Renders a box geometry with thickness proportional to page count,
 * colored from the spine palette, with title text on the front face.
 *
 * @param {Object} props
 * @param {Object} props.book - Book data object with title, pageCount, etc.
 * @param {number} props.index - Index used for color assignment
 * @param {[number, number, number]} props.position - 3D position [x, y, z]
 * @param {boolean} props.interactive - Whether hover/click interactions are enabled
 * @param {function} props.onSelect - Callback when book is clicked (receives book)
 */
function BookSpine({ book, index, position, interactive, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const thickness = computeSpineThickness(book.pageCount);
  const height = 2;
  const depth = 0.3;
  const color = assignSpineColor(index);

  const handlePointerOver = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    setHovered(false);
  };

  const handleClick = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect(book);
  };

  return (
    <group position={position} scale={hovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      <Text
        position={[0, 0, depth / 2 + 0.01]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.12}
        maxWidth={height * 0.85}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {book.title}
      </Text>
    </group>
  );
}

export default BookSpine;
