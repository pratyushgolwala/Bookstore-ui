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

/**
 * Generates a procedural brick wall texture.
 * Used as the bookshelf backdrop for a warm, rustic library feel.
 *
 * @param {number} width
 * @param {number} height
 * @returns {THREE.CanvasTexture}
 */
export function createBrickTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Mortar background (dark gray)
  ctx.fillStyle = '#2a2422';
  ctx.fillRect(0, 0, width, height);

  const brickH = 36;
  const brickW = 96;
  const mortar = 6;
  const rows = Math.ceil(height / (brickH + mortar));
  const cols = Math.ceil(width / (brickW + mortar)) + 1;

  // Brick base palette — warm, aged reds/browns
  const brickColors = ['#5c3a2e', '#6b4233', '#4a2f25', '#71452f', '#553228'];

  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : -(brickW + mortar) / 2;
    for (let col = -1; col < cols; col += 1) {
      const x = col * (brickW + mortar) + offset + mortar / 2;
      const y = row * (brickH + mortar) + mortar / 2;

      const base = brickColors[(row * 31 + col * 17) % brickColors.length];
      ctx.fillStyle = base;
      ctx.fillRect(x, y, brickW, brickH);

      // Subtle per-brick shading gradient
      const grad = ctx.createLinearGradient(x, y, x, y + brickH);
      grad.addColorStop(0, 'rgba(255,255,255,0.06)');
      grad.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, brickW, brickH);

      // Speckle noise for weathered look
      for (let i = 0; i < 40; i += 1) {
        const sx = x + Math.random() * brickW;
        const sy = y + Math.random() * brickH;
        ctx.fillStyle = Math.random() > 0.5
          ? 'rgba(0,0,0,0.12)'
          : 'rgba(255,235,205,0.05)';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Loads an external brick texture from a CDN with a procedural fallback.
 * Returns the texture immediately (procedural) and swaps in the high-res
 * image when it loads via the onLoaded callback.
 *
 * @param {(tex: THREE.Texture) => void} [onLoaded]
 * @returns {THREE.Texture} immediate procedural texture
 */
export function loadBrickTexture(onLoaded) {
  const fallback = createBrickTexture();
  const url =
    'https://threejs.org/examples/textures/brick_diffuse.jpg';
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  loader.load(
    url,
    (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      if (onLoaded) onLoaded(tex);
    },
    undefined,
    () => {
      /* keep procedural fallback on error */
    }
  );
  return fallback;
}


/**
 * Creates a subtle warm "library" backdrop — a soft radial gradient that
 * fades from a dim warm centre to near-black edges (cozy reading-room vibe).
 * @returns {THREE.CanvasTexture}
 */
export function createLibraryBackdrop(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base near-black warm tone
  ctx.fillStyle = '#0c0a08';
  ctx.fillRect(0, 0, width, height);

  // Soft warm glow toward the centre (like a wall sconce wash)
  const grad = ctx.createRadialGradient(
    width / 2, height * 0.42, width * 0.05,
    width / 2, height * 0.42, width * 0.7
  );
  grad.addColorStop(0, 'rgba(58, 42, 28, 0.9)');
  grad.addColorStop(0.45, 'rgba(34, 25, 17, 0.6)');
  grad.addColorStop(1, 'rgba(10, 8, 6, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Faint vertical wood-panel seams
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  const panelW = width / 6;
  for (let i = 1; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * panelW, 0);
    ctx.lineTo(i * panelW, height);
    ctx.stroke();
  }

  // Subtle grain noise
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 4000; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#caa37a';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
