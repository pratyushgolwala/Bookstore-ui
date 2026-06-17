/**
 * Global color palette for the entire application.
 * Warm vintage library theme with 3-layer depth:
 *   Background: #F8F3E7 (warm parchment)
 *   Section:    #EFE4CC (cream sections)
 *   Cards:      #3B2416 (deep brown surfaces)
 *   Navbar:     #24160D (darkest)
 *   Accent:     #CDA35E (gold)
 *
 * Every page references this constant, so changing values here re-themes
 * the whole app consistently.
 */

export const COLORS = {
  // Primary — deep brown to caramel (brand)
  primary: {
    50:  '#1c0f07',
    100: '#24160D', // navbar dark
    200: '#3B2416', // card brown
    300: '#4f2913',
    400: '#622B14', // deep brown
    500: '#995F2F', // caramel — main brand color
    600: '#b0764a',
    700: '#c28e63',
    800: '#d4a884',
    900: '#e8caa3',
  },

  // Secondary — gold accent (highlights, prices, CTAs)
  secondary: {
    50:  '#2d2615',
    100: '#473c22',
    200: '#62542f',
    300: '#8a7340',
    400: '#CDA35E', // gold accent
    500: '#CDA35E', // gold — main highlight
    600: '#d9b87a',
    700: '#e2c895',
    800: '#ebdab3',
    900: '#f5ecd1',
  },

  // Accent — muted olive (badges, info)
  accent: {
    50:  '#1e1c14',
    100: '#33301f',
    200: '#4a4630',
    300: '#6b6444',
    400: '#978F66', // olive
    500: '#aaa37e',
    600: '#bdb795',
    700: '#d0cbb1',
    800: '#e2dfcd',
    900: '#f1efe5',
  },

  // Neutrals — warm brown-tinted
  neutral: {
    50:  '#150d06',
    100: '#1f140b',
    200: '#2c1e12',
    300: '#3d2c1b',
    400: '#523c27',
    500: '#6b5337',
    600: '#8a6f4f',
    700: '#a98d6b',
    800: '#c8ad8c',
    900: '#e4d6a9',
  },

  // Status colors (tuned warm where possible)
  success: '#7a9e5b',
  warning: '#d6a44e',
  error: '#c2562f',
  info: '#978F66',

  // Semantic — dark theme surfaces (for shelf view / modals)
  background: '#160e07',
  surface: '#3B2416',        // card brown — primary surface
  surfaceLight: '#4a3826',   // slightly lighter
  surfaceLighter: '#5c4632', // lighter still
  border: '#5c4632',
  text: {
    primary: '#FFFDF8',      // warm white
    secondary: '#d4c4a0',
    tertiary: '#a08b66',
    inverse: '#160e07',
  },

  // Parchment — light theme for content pages (Books, Categories, etc.)
  // 3-layer hierarchy: page bg → section bg → card surfaces
  parchment: {
    bg: '#F8F3E7',           // page background (lightest)
    section: '#EFE4CC',      // section/container background (mid)
    surface: '#3B2416',      // cards (deepest — creates depth)
    text: '#2c1e12',         // dark brown text on parchment
    textSoft: '#5c3a22',     // muted brown text
    border: '#D4C4A0',       // warm tan border
  },

  // Navbar — darkest brown for maximum contrast
  navbar: '#24160D',

  // Gradients — brown → gold
  gradient: {
    primary: 'linear-gradient(135deg, #995F2F 0%, #622B14 100%)',
    dark:    'linear-gradient(135deg, #2c1e12 0%, #160e07 100%)',
    accent:  'linear-gradient(135deg, #CDA35E 0%, #995F2F 100%)',
    glow:    'linear-gradient(135deg, #CDA35E 0%, #995F2F 50%, #622B14 100%)',
    gold:    'linear-gradient(135deg, #CDA35E 0%, #b08a3e 100%)',
  },
};

export default COLORS;
