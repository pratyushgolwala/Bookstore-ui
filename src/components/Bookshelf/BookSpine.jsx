import { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { computeSpineThickness, assignSpineColor } from '../../utils/bookshelfUtils.js';
import { createSpineTexture } from '../../utils/textureGenerators.js';

/**
 * Rounded-rectangle cross-section so the spine edge facing the viewer
 * has a soft curve like a real bound book.
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
 * BookSpine — a book standing on a shelf, spine facing the viewer (+Z).
 *
 * Behaviour:
 *   - hover (interactive): eases slightly forward + gold glow
 *   - pulling=true: the book slides forward out of the shelf, grows, and
 *     simultaneously FADES OUT. Roughly halfway through the fade we fire
 *     onPullComplete so the HTML detail card appears exactly as the book
 *     dissolves — a seamless hand-off with nothing left lingering behind.
 */
function BookSpine({
  book,
  index,
  position,
  interactive,
  pulling = false,
  pullTarget = [0, 0, 6],
  onSelect,
  onPullComplete,
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const completedRef = useRef(false);

  // Animation progress for the pull-out transition (0 → 1)
  const progressRef = useRef(0);

  // Collect material refs so we can fade them per-frame
  const materialsRef = useRef([]);
  const textRef = useRef();
  const registerMat = (m) => {
    if (m && !materialsRef.current.includes(m)) materialsRef.current.push(m);
  };

  const thickness = computeSpineThickness(book.pageCount);
  const depth = 1.15;
  const color = assignSpineColor(index);
  const height = 1.9 + (book.pageCount % 9) * 0.035;

  const spineTexture = useMemo(() => createSpineTexture(128, 256, color), [color]);

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

  const setOpacity = (o) => {
    materialsRef.current.forEach((m) => {
      m.transparent = true;
      m.opacity = o;
      m.depthWrite = o > 0.95; // stop writing depth as it fades so it vanishes cleanly
    });
    if (textRef.current) {
      textRef.current.fillOpacity = o;
      textRef.current.outlineOpacity = o;
    }
  };

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    if (pulling) {
      // Advance progress toward 1
      progressRef.current = Math.min(1, progressRef.current + 0.035);
      const p = progressRef.current;

      // Move forward — but only travel ~65% of the way to the target,
      // since the book dissolves before fully arriving.
      const [tx, ty, tz] = pullTarget;
      const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
      g.position.x = THREE.MathUtils.lerp(position[0], tx, ease * 0.75);
      g.position.y = THREE.MathUtils.lerp(position[1], ty, ease * 0.75);
      g.position.z = THREE.MathUtils.lerp(position[2], tz, ease * 0.85);

      // Turn the cover toward the viewer
      g.rotation.y = THREE.MathUtils.lerp(0, -Math.PI / 2, ease);

      // Grow as it advances
      const s = 1 + ease * 1.4;
      g.scale.set(s, s, s);

      // Fade: stays solid until ~35% progress, then fades out by ~85%
      const fade = THREE.MathUtils.clamp(1 - (p - 0.35) / 0.5, 0, 1);
      setOpacity(fade);

      // Hand off to the detail card around the midpoint of the fade
      if (!completedRef.current && p >= 0.55) {
        completedRef.current = true;
        onPullComplete?.();
      }
      return;
    }

    // Not pulling — reset everything and run the hover ease
    completedRef.current = false;
    progressRef.current = 0;
    setOpacity(1);

    const targetZ = hovered ? 0.5 : 0;
    g.position.x = THREE.MathUtils.lerp(g.position.x, position[0], 0.18);
    g.position.y = THREE.MathUtils.lerp(g.position.y, position[1], 0.18);
    g.position.z = THREE.MathUtils.lerp(g.position.z, position[2] + targetZ, 0.18);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0, 0.18);
    const s = hovered ? 1.06 : 1;
    g.scale.x = THREE.MathUtils.lerp(g.scale.x, s, 0.18);
    g.scale.y = THREE.MathUtils.lerp(g.scale.y, s, 0.18);
    g.scale.z = THREE.MathUtils.lerp(g.scale.z, s, 0.18);
  });

  const handlePointerOver = (e) => {
    if (!interactive || pulling) return;
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
    if (!interactive || pulling) return;
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
    onSelect(book);
  };

  const pageColor = '#efe7d6';
  const headbandColor = '#E4D6A9';
  const spineTitle = book.title.length > 32 ? `${book.title.slice(0, 30)}…` : book.title;

  return (
    <group position={position} ref={groupRef} renderOrder={pulling ? 999 : 0}>
      <mesh
        position={[0, 0, -depth]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <primitive object={bodyGeo} attach="geometry" />
        <meshStandardMaterial
          ref={registerMat}
          map={spineTexture}
          color={color}
          roughness={0.62}
          metalness={0.06}
          emissive={hovered ? '#E4D6A9' : '#000000'}
          emissiveIntensity={hovered ? 0.22 : 0}
        />
      </mesh>

      {/* Page block */}
      <mesh position={[0, 0, -depth - 0.02]}>
        <boxGeometry args={[thickness * 0.86, height * 0.96, 0.04]} />
        <meshStandardMaterial ref={registerMat} color={pageColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* Headbands */}
      <mesh position={[0, height / 2 - 0.04, 0.02]}>
        <boxGeometry args={[thickness * 0.9, 0.05, 0.05]} />
        <meshStandardMaterial ref={registerMat} color={headbandColor} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.04, 0.02]}>
        <boxGeometry args={[thickness * 0.9, 0.05, 0.05]} />
        <meshStandardMaterial ref={registerMat} color={headbandColor} roughness={0.4} metalness={0.25} />
      </mesh>

      {/* Decorative gold band */}
      <mesh position={[0, height * 0.28, 0.04]}>
        <boxGeometry args={[thickness * 0.8, 0.02, 0.02]} />
        <meshStandardMaterial ref={registerMat} color="#E4D6A9" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* Spine title */}
      <Text
        ref={textRef}
        position={[0, 0, 0.12]}
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
