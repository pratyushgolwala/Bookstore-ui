import { useState, useEffect } from 'react';

/**
 * Checks whether the browser supports WebGL by creating a temporary
 * canvas and requesting a 'webgl' context.
 * @returns {boolean}
 */
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * useViewport — detects viewport width, mobile breakpoint, and WebGL support.
 *
 * Returns:
 *   - width: current window inner width (px)
 *   - isMobile: true when width < 768px
 *   - hasWebGL: true if browser supports WebGL (checked once on mount)
 *
 * The resize listener is debounced (~200ms) to avoid excessive re-renders.
 */
export default function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [hasWebGL, setHasWebGL] = useState(false);

  // Detect WebGL once on mount
  useEffect(() => {
    setHasWebGL(detectWebGL());
  }, []);

  // Listen to window resize with debounce
  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    width,
    isMobile: width < 768,
    hasWebGL,
  };
}
