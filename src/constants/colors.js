/**
 * Global color palette for the entire application.
 * Warm vintage library theme:
 *   #622B14 deep brown · #995F2F caramel · #978F66 olive · #E4D6A9 cream
 *
 * Every page references this constant, so changing values here re-themes
 * the whole app consistently.
 */

export const COLORS = {
  // Primary — caramel / warm brown (brand)
  primary: {
    50:  '#1c0f07',
    100: '#2a160b',
    200: '#3d2010',
    300: '#4f2913',
    400: '#622B14', // deep brown
    500: '#995F2F', // caramel — main brand color
    600: '#b0764a',
    700: '#c28e63',
    800: '#d4a884',
    900: '#e8caa3',
  },

  // Secondary — warm cream / sand (highlights, prices, accents)
  secondary: {
    50:  '#2d2615',
    100: '#473c22',
    200: '#62542f',
    300: '#867344',
    400: '#c9b984',
    500: '#E4D6A9', // cream — highlight color
    600: '#eee0bb',
    700: '#f2e8cd',
    800: '#f7f0dd',
    900: '#fbf8ee',
  },

  // Accent — muted olive
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

  // Neutrals — warm brown-tinted darks
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

  // Semantic — warm dark library theme
  background: '#160e07',
  surface: '#4a3826',        // lightened — warm medium brown card
  surfaceLight: '#574330',   // lightened
  surfaceLighter: '#65503b', // lightened
  border: '#5c4632',         // lightened to match
  text: {
    primary: '#f5ecd8',
    secondary: '#d4c4a0',
    tertiary: '#a08b66',
    inverse: '#160e07',
  },

  // Parchment — light cream page surface for content pages (post-login).
  // Brown cards sit on this for a warm vintage contrast.
  parchment: {
    bg: '#E4D6A9',          // page background
    surface: '#4a3826',     // cards — warm medium brown, lighter to match theme
    text: '#2c1e12',        // dark brown text directly on parchment
    textSoft: '#5c3a22',    // muted brown text on parchment
    border: '#c9b07a',      // warm tan border on parchment
  },

  // "gradient" tokens kept for backwards-compatibility, but flattened to
  // solid book-cloth fills — no gradients anywhere in the UI. Existing call
  // sites that set `background: COLORS.gradient.primary` now render flat.
  gradient: {
    primary: '#7a3b2e',  // book-cloth red-brown
    dark:    '#1b110a',
    accent:  '#b98a3e',  // flat brass
    glow:    '#7a3b2e',
  },

  // New flat brand tokens (preferred for new code)
  ink:     '#160e07',    // deepest background ink
  cloth:   '#7a3b2e',    // book-cloth red-brown — primary action color
  clothDark: '#5e2c22',
  brass:   '#b98a3e',    // flat brass — accents, prices
};

export default COLORS;
