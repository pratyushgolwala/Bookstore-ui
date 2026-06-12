import { useMemo } from 'react';
import { createWoodTexture, createWoodBumpMap } from '../../utils/textureGenerators.js';

/**
 * BookshelfFrame — a solid wooden bookcase: two side panels, top and bottom,
 * a back panel, and a horizontal shelf plank under each row of books.
 *
 * @param {Object} props
 * @param {number} props.width - Interior width of the shelf
 * @param {number} props.rowCount - Number of shelf rows
 * @param {number} props.rowHeight - Vertical spacing between rows
 * @param {number} props.rowDepth - Depth of the shelf
 */
function BookshelfFrame({ width, rowCount, rowHeight, rowDepth }) {
  const wood = useMemo(() => createWoodTexture(512, 256, '#3a2718', '#241606'), []);
  const woodDark = useMemo(() => createWoodTexture(512, 256, '#2c1d12', '#1a1008'), []);
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
    color: '#5a3d1f',
  };

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
          color="#3a2718"
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

      {/* Horizontal shelf plank beneath each row */}
      {Array.from({ length: rowCount }).map((_, i) => {
        const y = topY - frameThickness / 2 - (i + 1) * rowHeight + 0.02;
        return (
          <group key={i}>
            <mesh position={[0, y, 0]}>
              <boxGeometry args={[width, 0.12, rowDepth]} />
              <meshStandardMaterial {...woodMat} />
            </mesh>
            {/* Front lip for depth */}
            <mesh position={[0, y + 0.08, rowDepth / 2 - 0.04]}>
              <boxGeometry args={[width, 0.06, 0.08]} />
              <meshStandardMaterial {...woodMat} color="#4a3320" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default BookshelfFrame;
