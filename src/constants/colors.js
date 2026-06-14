/**
 * Global color palette for the entire application
 * Dark library/bookstore theme with warm, sophisticated accents
 */

export const COLORS = {
  // Primary colors - Green / Bottle Green
  primary: {
    50: '#0a1f17',
    100: '#0f2e22',
    200: '#143d2c',
    300: '#1a5740',
    400: '#1f7a54',
    500: '#2e8b57', // Primary brand color - sea green
    600: '#3da06a',
    700: '#5bb583',
    800: '#88c9a3',
    900: '#b9e7cf',
  },

  // Secondary colors - Warm Gold/Amber
  secondary: {
    50: '#2d1f0a',
    100: '#5a3d14',
    200: '#875c1f',
    300: '#b47a29',
    400: '#d4933e', // Warm gold accent
    500: '#e6a657',
    600: '#f0b870',
    700: '#f5c989',
    800: '#fad8a1',
    900: '#ffe7b9',
  },

  // Accent - Copper/Rose
  accent: {
    50: '#2d1a1a',
    100: '#5a3434',
    200: '#874d4d',
    300: '#b46767',
    400: '#d48080', // Copper rose accent
    500: '#e09999',
    600: '#e8b3b3',
    700: '#f0cccc',
    800: '#f5dfe5',
    900: '#faf2f2',
  },

  // Dark Neutral colors - Warm grays and browns
  neutral: {
    50: '#0f0f0f',
    100: '#1a1a1a',
    200: '#2a2a2a',
    300: '#3d3d3d',
    400: '#505050',
    500: '#636363',
    600: '#767676',
    700: '#898989',
    800: '#9c9c9c',
    900: '#afafaf',
  },

  // Status colors
  success: '#00d084',
  warning: '#e6a657',
  error: '#d48080',
  info: '#5c8f8f',

  // Semantic - Dark library theme
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  surfaceLighter: '#3d3d3d',
  border: '#3d3d3d',
  text: {
    primary: '#e8e8e8',
    secondary: '#a8a8a8',
    tertiary: '#767676',
    inverse: '#0f0f0f',
  },

  // Gradients — green to bottle green with warm accents
  gradient: {
    primary: 'linear-gradient(135deg, #2e8b57 0%, #0f3d2e 100%)',
    dark: 'linear-gradient(135deg, #143d2c 0%, #0a2018 100%)',
    accent: 'linear-gradient(135deg, #2e8b57 0%, #d4933e 100%)',
    glow: 'linear-gradient(135deg, #3da06a 0%, #2e8b57 50%, #0f3d2e 100%)',
  },
};

export default COLORS;
