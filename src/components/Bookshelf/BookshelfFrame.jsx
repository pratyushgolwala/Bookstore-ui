import { useMemo } from 'react';
import { createWoodTexture, createWoodBumpMap } from '../../utils/textureGenerators.js';

/**
 * BookshelfFrame — a solid wooden bookcase: side panels, top/bottom, back panel,
 * a horizontal shelf plank under each row, and vertical dividers that split each
 * row into equal sections like a real library shelf.
 */
function BookshelfFrame({
  width,
  rowCount,
  rowHeight,
  rowDepth,
  sectionsPerRow = 4,
  dividerThickness = 0.16,
}) {
  const wood = useMemo(() => createWoodTexture(512, 256, '#6B4226', '#4A2F1A'), []);
  const woodDark = useMemo(() => createWoodTexture(512, 256, '#5C3A22', '#3D2515'), []);
  const bump = useMemo(() => createWoodBumpMap(), []);

  const frameThickness = 0.35;
  const totalHeight = rowCount * rowHeight + frameThickness;
  const topY = rowHeight * 0.5;
  const bottomY = topY - totalHeight;
  const centerY = (topY + bottomY) / 2;
  const halfW = width / 2 + frameThickness / 2;

  const woodMat = {
    map: wood,
    bumpMap: bump,
    bumpScale: 0.03,
    roughness: 0.78,
    metalness: 0.04,
    color: '#8B6340',
  };

  const dividerMat = {
    map: wood,
    bumpMap: bump,
    bumpScale: 0.02,
    roughness: 0.8,
    metalness: 0.04,
    color: '#6B4226',
  };

  // X positions of interior vertical dividers (excludes the outer side panels)
  const sectionOuterWidth = width / sectionsPerRow;
  const dividerXs = [];
  for (let s = 1; s < sectionsPerRow; s += 1) {
    dividerXs.push(-width / 2 + s * sectionOuterWidth);
  }

  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, centerY, -rowDepth / 2 - 0.05]}>
        <boxGeometry args={[width + frameThickness * 2, totalHeight, 0.1]} />
        <meshStandardMaterial
          map={woodDark}
          bumpMap={bump}
          bumpScale={0.02}
          roughness={0.85}
          metalness={0.03}
          color="#4A2F1A"
        />
      </mesh>

      {/* Left side panel */}
      <mesh position={[-halfW, centerY, 0]}>
        <boxGeometry args={[frameThickness, totalHeight, rowDepth + 0.1]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[halfW, centerY, 0]}>
        <boxGeometry args={[frameThickness, totalHeight, rowDepth + 0.1]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, topY, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, rowDepth + 0.1]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, bottomY, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, rowDepth + 0.1]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>

      {/* Per-row shelf plank + vertical section dividers */}
      {Array.from({ length: rowCount }).map((_, i) => {
        const plankY = topY - frameThickness / 2 - (i + 1) * rowHeight + 0.02;
        // Centre Y of the compartment ABOVE this plank
        const compartmentCenterY = plankY + rowHeight / 2;
        const dividerHeight = rowHeight - 0.14;

        return (
          <group key={i}>
            {/* Shelf plank */}
            <mesh position={[0, plankY, 0]}>
              <boxGeometry args={[width, 0.12, rowDepth]} />
              <meshStandardMaterial {...woodMat} />
            </mesh>
            {/* Front lip */}
            <mesh position={[0, plankY + 0.08, rowDepth / 2 - 0.04]}>
              <boxGeometry args={[width, 0.06, 0.08]} />
              <meshStandardMaterial {...woodMat} color="#4a3320" />
            </mesh>

            {/* Vertical dividers splitting this row into sections */}
            {dividerXs.map((dx, di) => (
              <mesh key={di} position={[dx, compartmentCenterY, 0]}>
                <boxGeometry args={[dividerThickness, dividerHeight, rowDepth - 0.1]} />
                <meshStandardMaterial {...dividerMat} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

export default BookshelfFrame;
