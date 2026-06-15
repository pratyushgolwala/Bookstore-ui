import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useViewport from '../useViewport';

describe('useViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns current window width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { result } = renderHook(() => useViewport());
    expect(result.current.width).toBe(1024);
  });

  it('reports isMobile as true when width < 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    const { result } = renderHook(() => useViewport());
    expect(result.current.isMobile).toBe(true);
  });

  it('reports isMobile as false when width >= 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
    const { result } = renderHook(() => useViewport());
    expect(result.current.isMobile).toBe(false);
  });

  it('updates width on debounced window resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { result } = renderHook(() => useViewport());

    expect(result.current.width).toBe(1024);

    // Simulate resize
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Width should not update immediately (debounced)
    expect(result.current.width).toBe(1024);

    // Advance past debounce delay
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.width).toBe(500);
    expect(result.current.isMobile).toBe(true);
  });

  it('detects hasWebGL based on canvas context availability', () => {
    // jsdom does not support WebGL, so getContext('webgl') returns null
    const { result } = renderHook(() => useViewport());
    expect(result.current.hasWebGL).toBe(false);
  });

  it('detects hasWebGL as true when WebGL is available', () => {
    const originalCreateElement = document.createElement.bind(document);
    const mockGetContext = vi.fn().mockReturnValue({});
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return { getContext: mockGetContext };
      }
      return originalCreateElement(tag);
    });

    const { result } = renderHook(() => useViewport());
    expect(result.current.hasWebGL).toBe(true);

    vi.restoreAllMocks();
  });

  it('cleans up resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useViewport());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
