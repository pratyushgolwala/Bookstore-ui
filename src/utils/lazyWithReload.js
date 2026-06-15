import { lazy } from 'react';

/**
 * lazyWithReload — like React.lazy, but resilient to stale deploys.
 *
 * After a new deploy, a browser holding the OLD index.html references JS
 * chunk filenames that no longer exist (Vite content-hashes them). The
 * dynamic import then fails with a MIME-type / "Failed to fetch dynamically
 * imported module" error and the app shows a blank screen.
 *
 * This wrapper catches that specific failure and force-reloads the page ONCE
 * (guarded by a sessionStorage flag so we never loop) to pull the fresh
 * index.html + chunk names.
 *
 * @param {() => Promise<any>} importer - the dynamic import function
 */
export default function lazyWithReload(importer) {
  return lazy(async () => {
    const RELOAD_KEY = 'chunk-reload-attempted';
    try {
      const module = await importer();
      // Success — clear the guard so future failures can reload again
      sessionStorage.removeItem(RELOAD_KEY);
      return module;
    } catch (err) {
      const alreadyTried = sessionStorage.getItem(RELOAD_KEY) === 'true';
      const isChunkError =
        err?.name === 'ChunkLoadError' ||
        /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
          err?.message || ''
        );

      if (isChunkError && !alreadyTried) {
        sessionStorage.setItem(RELOAD_KEY, 'true');
        window.location.reload();
        // Return a never-resolving promise so React doesn't render an error
        // while the page reloads.
        return new Promise(() => {});
      }
      throw err;
    }
  });
}
