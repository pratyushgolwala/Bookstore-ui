import { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { computeSpineThickness, assignSpineColor } from '../../utils/bookshelfUtils.js';
import { createSpineTexture } from '../../utils/textureGenerators.js';

/**
 * Rounded-rectangle cross-section for the book, so the spine edge facing the
 * viewer has a soft curve like a real bound book.
 */
function roundedRectShape(w, h, r) {
  const shape = new THREE.Shape();
  const rad = Math.min(r, w / 2, h / 2);
  shape.moveTo(-w / 2 + rad, -h / 2);
  shape.lineTo(w / 2 - rad, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rad);
  shape.lineTo(w / 2, h / 2 - rad);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - rad, h / 2);
  shape.lineTo(-w / 2 + rad, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rad);
  shape.lineTo(-w / 2, -h / 2 + rad);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rad, -h / 2);
  return shape;
}

/**
 * BookSpine — a book standing on a shelf, SPINE FACING THE VIEWER (+Z).
 *
 * Dimensions:
 *   - thickness (X): how wide the spine is (from page count)
 *   - height   (Y): the book's height
 *   - depth    (Z): how deep the book sits into the shelf
 *
 * On hover the book eases forward and outward and the spine title glows gold.
 */
function BookSpine({ book, index, position, interactive, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  const thickness = computeSpineThickness(book.pageCount); // X
  const depth = 1.15; // Z — into the shelf
  const color = assignSpineColor(index);

  // Slight per-book height variation for realism
  const height = 1.9 + (book.pageCount % 9) * 0.035;

  const spineTexture = useMemo(() => createSpineTexture(128, 256, color), [color]);

  // Extruded body with a rounded spine edge (extrudes along Z = depth)
  const bodyGeo = useMemo(() => {
    const shape = roundedRectShape(thickness, height, Math.min(thickness * 0.18, 0.06));
    return new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
  }, [thickness, height, depth]);

  // Smoothly animate hover pop-forward
  const targetZ = hovered ? 0.45 : 0;
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      position[2] + targetZ,
      0.15
    );
    const s = hovered ? 1.05 : 1;
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, s, 0.15);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, s, 0.15);
  });

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

  const pageColor = '#efe7d6';
  const headbandColor = '#d4933e';

  // Truncate very long titles for the spine
  const spineTitle =
    book.title.length > 32 ? `${book.title.slice(0, 30)}…` : book.title;

  return (
    <group position={position} ref={groupRef}>
      {/* Book body — spine faces +Z (viewer), extruded toward -Z into shelf */}
      <mesh
        position={[0, 0, -depth / 2]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <primitive object={bodyGeo} attach="geometry" />
        <meshStandardMaterial
          map={spineTexture}
          color={color}
          roughness={0.62}
          metalness={0.06}
          emissive={hovered ? '#d4933e' : '#000000'}
          emissiveIntensity={hovered ? 0.22 : 0}
        />
      </mesh>

      {/* Page block on the back side (inside shelf), cream colored */}
      <mesh position={[0, 0, -depth - 0.001]}>
        <boxGeometry args={[thickness * 0.86, height * 0.96, 0.04]} />
        <meshStandardMaterial color={pageColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* Headbands at top & bottom of the spine */}
      <mesh position={[0, height / 2 - 0.04, 0.02]}>
        <boxGeometry args={[thickness * 0.9, 0.05, 0.05]} />
        <meshStandardMaterial color={headbandColor} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.04, 0.02]}>
        <boxGeometry args={[thickness * 0.9, 0.05, 0.05]} />
        <meshStandardMaterial color={headbandColor} roughness={0.4} metalness={0.25} />
      </mesh>

      {/* Decorative gold band near the top of the spine */}
      <mesh position={[0, height * 0.28, 0.07]}>
        <boxGeometry args={[thickness * 0.8, 0.02, 0.02]} />
        <meshStandardMaterial color="#d4933e" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* Spine title — always show, white text for readability */}
      <Text
        position={[0, 0, 0.09]}
        rotation={[0, 0, -Math.PI / 2]}
        fontSize={Math.min(0.14, Math.max(0.08, thickness * 0.35))}
        maxWidth={height * 0.82}
        color={hovered ? '#FFFFFF' : '#FFFDE8'}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        fontWeight="bold"
        outlineWidth={0.008}
        outlineColor="#000000"
      >
        {spineTitle}
      </Text>
    </group>
  );
}

export default BookSpine;
