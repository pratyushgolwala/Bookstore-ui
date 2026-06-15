import { describe, it, expect } from 'vitest';
import {
  groupBooksByCategory,
  computeSpineThickness,
  assignSpineColor,
} from '../bookshelfUtils.js';
import { SPINE_COLORS } from '../../constants/bookColors.js';

describe('groupBooksByCategory', () => {
  it('groups books by their category field', () => {
    const books = [
      { id: '1', title: 'Book A', category: 'Fiction' },
      { id: '2', title: 'Book B', category: 'Science' },
      { id: '3', title: 'Book C', category: 'Fiction' },
    ];

    const result = groupBooksByCategory(books);

    expect(Object.keys(result)).toHaveLength(2);
    expect(result['Fiction']).toHaveLength(2);
    expect(result['Science']).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupBooksByCategory([])).toEqual({});
  });

  it('returns empty object for non-array input', () => {
    expect(groupBooksByCategory(null)).toEqual({});
    expect(groupBooksByCategory(undefined)).toEqual({});
  });

  it('preserves all book data in grouped output', () => {
    const books = [
      { id: '1', title: 'Dune', category: 'Sci-Fi', pageCount: 412 },
    ];

    const result = groupBooksByCategory(books);
    expect(result['Sci-Fi'][0]).toEqual(books[0]);
  });
});

describe('computeSpineThickness', () => {
  it('returns minimum thickness for very low page counts', () => {
    expect(computeSpineThickness(50)).toBeCloseTo(0.2);
    expect(computeSpineThickness(10)).toBeCloseTo(0.2);
  });

  it('returns maximum thickness for very high page counts', () => {
    expect(computeSpineThickness(1000)).toBeCloseTo(0.8);
    expect(computeSpineThickness(2000)).toBeCloseTo(0.8);
  });

  it('returns a value between 0.2 and 0.8 for typical page counts', () => {
    const thickness = computeSpineThickness(300);
    expect(thickness).toBeGreaterThanOrEqual(0.2);
    expect(thickness).toBeLessThanOrEqual(0.8);
  });

  it('higher page count produces greater thickness', () => {
    const thin = computeSpineThickness(100);
    const thick = computeSpineThickness(800);
    expect(thick).toBeGreaterThan(thin);
  });
});

describe('assignSpineColor', () => {
  it('returns the correct color for indices within palette range', () => {
    expect(assignSpineColor(0)).toBe(SPINE_COLORS[0]);
    expect(assignSpineColor(5)).toBe(SPINE_COLORS[5]);
  });

  it('cycles through colors using modulo for indices beyond palette length', () => {
    const paletteLength = SPINE_COLORS.length;
    expect(assignSpineColor(paletteLength)).toBe(SPINE_COLORS[0]);
    expect(assignSpineColor(paletteLength + 1)).toBe(SPINE_COLORS[1]);
    expect(assignSpineColor(paletteLength * 2)).toBe(SPINE_COLORS[0]);
  });

  it('always returns a valid hex color string', () => {
    for (let i = 0; i < 30; i++) {
      const color = assignSpineColor(i);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
