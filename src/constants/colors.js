/**
 * Global color palette for the entire application
 * Dark library/bookstore theme with warm, sophisticated accents
 */

export const COLORS = {
  // Primary colors - Deep Indigo/Navy
  primary: {
    50: '#1a1a2e',
    100: '#252541',
    200: '#2d2d54',
    300: '#363666',
    400: '#4a4a7a',
    500: '#5c5c8f', // Primary brand color - deep indigo
    600: '#6d6d9d',
    700: '#7e7eab',
    800: '#8f8fb9',
    900: '#a0a0c7',
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

  // Gradients
  gradient: {
    primary: 'linear-gradient(135deg, #5c5c8f 0%, #d4933e 100%)',
    dark: 'linear-gradient(135deg, #2d2d54 0%, #875c1f 100%)',
    accent: 'linear-gradient(135deg, #d4933e 0%, #d48080 100%)',
    glow: 'linear-gradient(135deg, #5c5c8f 0%, #d4933e 50%, #d48080 100%)',
  },
};

export default COLORS;
