import * as THREE from 'three';

/**
 * Generates a procedural wood grain texture on a canvas.
 * Creates a realistic vintage dark wood appearance.
 *
 * @param {number} width - Texture width in pixels
 * @param {number} height - Texture height in pixels
 * @param {string} baseColor - Base color hex (e.g., '#3D2817')
 * @param {string} grainColor - Grain streak color hex (e.g., '#2A1B0F')
 * @returns {THREE.CanvasTexture}
 */
export function createWoodTexture(width = 512, height = 256, baseColor = '#3D2817', grainColor = '#2A1B0F') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Draw horizontal grain lines
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * height;
    const lineWidth = 0.5 + Math.random() * 2;
    const alpha = 0.1 + Math.random() * 0.3;

    ctx.strokeStyle = grainColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    // Slightly wavy grain
    ctx.moveTo(0, y);
    for (let x = 0; x < width; x += 20) {
      const wave = Math.sin(x * 0.01 + i) * 2;
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // Add knots (darker ellipses)
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const rx = 8 + Math.random() * 15;
    const ry = 4 + Math.random() * 8;

    ctx.fillStyle = '#1a0e05';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add subtle noise for roughness
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#FFFFFF';
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Generates a procedural leather/cloth texture for book spines.
 * Creates a subtle surface detail that makes books feel like real bound volumes.
 *
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @param {string} baseColor - Base spine color hex
 * @returns {THREE.CanvasTexture}
 */
export function createSpineTexture(width = 128, height = 256, baseColor = '#5c5c8f') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base color fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Add leather grain noise
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#FFFFFF';
    ctx.fillRect(x, y, size, size);
  }

  // Horizontal spine detail lines (like embossing on a book)
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  // Top decoration band
  const bandY1 = height * 0.08;
  ctx.beginPath();
  ctx.moveTo(0, bandY1);
  ctx.lineTo(width, bandY1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, bandY1 + 3);
  ctx.lineTo(width, bandY1 + 3);
  ctx.stroke();

  // Bottom decoration band
  const bandY2 = height * 0.92;
  ctx.beginPath();
  ctx.moveTo(0, bandY2);
  ctx.lineTo(width, bandY2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, bandY2 - 3);
  ctx.lineTo(width, bandY2 - 3);
  ctx.stroke();

  // Gold foil accent line in the middle area
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#d4933e';
  ctx.lineWidth = 1.5;
  const accentY = height * 0.15;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, accentY);
  ctx.lineTo(width * 0.9, accentY);
  ctx.stroke();

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a bump map for the wood shelf to add surface detail.
 * @returns {THREE.CanvasTexture}
 */
export function createWoodBumpMap(width = 512, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Neutral gray base
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, width, height);

  // Grain bumps
  for (let i = 0; i < 80; i++) {
    const y = Math.random() * height;
    const alpha = 0.05 + Math.random() * 0.15;
    const lightOrDark = Math.random() > 0.5 ? '#FFFFFF' : '#000000';

    ctx.strokeStyle = lightOrDark;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 0.5 + Math.random() * 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < width; x += 15) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 1.5);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}
