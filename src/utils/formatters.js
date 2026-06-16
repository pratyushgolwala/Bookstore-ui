/**
 * formatters.js — placeholder utility functions.
 * TODO: Expand as UI requirements become clear.
 */

/**
 * Format a number as a currency string.
 * @param {number} amount
 * @param {string} [currency='INR']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

/**
 * Format an ISO date string to a human-readable date.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  // TODO: Respect user locale / timezone setting
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(isoString));
}

/**
 * Truncate a string to a maximum length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 100) {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}
