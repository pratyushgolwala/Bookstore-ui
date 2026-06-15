import { SPINE_COLORS } from '../constants/bookColors.js';

/**
 * Groups a flat array of books into a record keyed by category.
 * @param {Array<{category: string}>} books - Array of book objects
 * @returns {Record<string, Array>} Object with category names as keys and arrays of books as values
 */
export function groupBooksByCategory(books) {
  if (!Array.isArray(books)) {
    return {};
  }

  return books.reduce((grouped, book) => {
    const category = book.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(book);
    return grouped;
  }, {});
}

/**
 * Computes a 3D spine thickness proportional to page count.
 * Maps pageCount to a range of 0.2 to 0.8 units.
 * Assumes page counts typically range from ~50 to ~1000 pages.
 * @param {number} pageCount - Number of pages in the book
 * @returns {number} Thickness value between 0.2 and 0.8
 */
export function computeSpineThickness(pageCount) {
  const minThickness = 0.2;
  const maxThickness = 0.8;
  const minPages = 50;
  const maxPages = 1000;

  // Clamp the page count to expected range
  const clamped = Math.max(minPages, Math.min(maxPages, pageCount));

  // Linear interpolation between min and max thickness
  const ratio = (clamped - minPages) / (maxPages - minPages);
  return minThickness + ratio * (maxThickness - minThickness);
}

/**
 * Assigns a spine color from the SPINE_COLORS palette by index,
 * cycling through the array using modulo.
 * @param {number} index - The index of the book (can exceed palette length)
 * @returns {string} A hex color string from SPINE_COLORS
 */
export function assignSpineColor(index) {
  return SPINE_COLORS[index % SPINE_COLORS.length];
}
