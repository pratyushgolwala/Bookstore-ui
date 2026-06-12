import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { computeSpineThickness, assignSpineColor } from '../../utils/bookshelfUtils.js';
import { createSpineTexture } from '../../utils/textureGenerators.js';

/**
 * Creates a rounded spine shape using an extruded geometry.
 * The spine is the curved left edge of the book — makes it look like a real bound book.
 */
function createSpineGeometry(thickness, height, radius) {
  const shape = new THREE.Shape();
  // Create a rounded rectangle for the spine cross-section
  const w = thickness;
  const h = height;
  const r = radius;

  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  return shape;
}

/**
 * BookSpine — A realistic 3D book model with:
 * - Rounded spine edge (extruded shape)
 * - Separate front/back covers with slight overhang
 * - Visible page block (cream-colored, inset from covers)
 * - Headband detail at top and bottom
 * - Gold foil title on spine
 */
function BookSpine({ book, index, position, interactive, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const thickness = computeSpineThickness(book.pageCount);
  const baseHeight = 2;
  const depth = 1.2;
  const color = assignSpineColor(index);

  // Slight height variation per book
  const height = baseHeight + (book.pageCount % 7) * 0.03 - 0.1;

  // Cover overhang beyond the pages
  const coverOverhang = 0.02;
  const coverThickness = 0.035;
  const pageInset = 0.04; // Pages are slightly inset from the cover edges
  const spineRadius = thickness * 0.3; // Rounded spine curve

  const spineTexture = useMemo(() => createSpineTexture(128, 256, color), [color]);

  // Create extruded spine geometry
  const spineGeo = useMemo(() => {
    const shape = createSpineGeometry(thickness, height, Math.min(spineRadius, 0.08));
    const extrudeSettings = {
      steps: 1,
      depth: coverThickness,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [thickness, height, spineRadius]);

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

  // Darken/lighten color for cover variation
  const coverColor = color;
  const pageColor = '#f5f0e6';
  const headbandColor = '#d4933e'; // Gold accent

  return (
    <group
      position={position}
      scale={hovered ? [1.04, 1.04, 1.04] : [1, 1, 1]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* === SPINE (rounded left edge) === */}
      <mesh
        position={[-thickness / 2 + coverThickness / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <primitive object={spineGeo} attach="geometry" />
        <meshStandardMaterial
          map={spineTexture}
          color={coverColor}
          roughness={0.6}
          metalness={0.05}
          emissive={hovered ? '#d4933e' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* === FRONT COVER === */}
      <mesh position={[0, 0, depth / 2 - coverThickness / 2]}>
        <boxGeometry args={[thickness, height + coverOverhang * 2, coverThickness]} />
        <meshStandardMaterial
          color={coverColor}
          roughness={0.55}
          metalness={0.08}
          emissive={hovered ? '#d4933e' : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {/* === BACK COVER === */}
      <mesh position={[0, 0, -depth / 2 + coverThickness / 2]}>
        <boxGeometry args={[thickness, height + coverOverhang * 2, coverThickness]} />
        <meshStandardMaterial
          color={coverColor}
          roughness={0.55}
          metalness={0.08}
          emissive={hovered ? '#d4933e' : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {/* === PAGE BLOCK (cream-colored, inset) === */}
      <mesh position={[pageInset / 2, 0, 0]}>
        <boxGeometry args={[
          thickness - pageInset * 2,
          height - 0.02,
          depth - coverThickness * 2 - 0.01
        ]} />
        <meshStandardMaterial
          color={pageColor}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* === TOP PAGE EDGES (visible from above) === */}
      <mesh position={[pageInset / 2, height / 2, 0]}>
        <boxGeometry args={[
          thickness - pageInset * 2,
          0.015,
          depth - coverThickness * 2 - 0.02
        ]} />
        <meshStandardMaterial color="#ede8db" roughness={1} metalness={0} />
      </mesh>

      {/* === HEADBAND (colored strip at top of spine) === */}
      <mesh position={[-thickness / 2 + 0.02, height / 2 - 0.01, 0]}>
        <boxGeometry args={[0.04, 0.025, 0.12]} />
        <meshStandardMaterial color={headbandColor} roughness={0.4} metalness={0.2} />
      </mesh>

      {/* === HEADBAND (bottom) === */}
      <mesh position={[-thickness / 2 + 0.02, -height / 2 + 0.01, 0]}>
        <boxGeometry args={[0.04, 0.025, 0.12]} />
        <meshStandardMaterial color={headbandColor} roughness={0.4} metalness={0.2} />
      </mesh>

      {/* === SPINE TITLE TEXT === */}
      <Text
        position={[-thickness / 2 - 0.01, 0, 0]}
        rotation={[0, -Math.PI / 2, Math.PI / 2]}
        fontSize={0.09}
        maxWidth={height * 0.75}
        color={hovered ? '#f0b870' : '#e6a657'}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        fontWeight="bold"
      >
        {book.title}
      </Text>

      {/* === FRONT COVER TITLE (subtle, smaller) === */}
      <Text
        position={[0, 0.2, depth / 2 + 0.001]}
        fontSize={0.07}
        maxWidth={thickness * 0.85}
        color={hovered ? '#f0b870' : '#e6a657'}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {book.title}
      </Text>

      {/* === FRONT COVER AUTHOR (even smaller below title) === */}
      <Text
        position={[0, -0.15, depth / 2 + 0.001]}
        fontSize={0.05}
        maxWidth={thickness * 0.85}
        color="#a8a8a8"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {book.author}
      </Text>
    </group>
  );
}

export default BookSpine;
