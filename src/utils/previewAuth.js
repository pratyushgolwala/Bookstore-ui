/**
 * previewAuth — LOCAL DEVELOPMENT ONLY.
 *
 * When the app is started with the `VITE_PREVIEW_AUTH` flag set to "true"
 * (see the `dev:preview` npm script + .env.preview), this module supplies a
 * fake authenticated user so that login-gated pages can be viewed without a
 * running backend.
 *
 * ⚠️  This is a developer convenience for design/QA work. It must NEVER be
 *     enabled in a production build:
 *       - hard-gated on import.meta.env.DEV, which is TRUE only on the Vite
 *         dev server and ALWAYS false in any `vite build` output — so the
 *         mock can never be bundled active, even with `vite build --mode preview`
 *       - the flag also has to be explicitly set (VITE_PREVIEW_AUTH=true),
 *         which only the `dev:preview` script + .env.preview do
 *       - the fake tokens are obviously non-functional placeholders and the
 *         real backend would reject them, so no privilege is actually granted.
 */

export const PREVIEW_AUTH_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_PREVIEW_AUTH === 'true';

// Optional role override: VITE_PREVIEW_ROLE=AUTHOR|ADMIN|CUSTOMER
const PREVIEW_ROLE = import.meta.env.VITE_PREVIEW_ROLE || 'CUSTOMER';

/**
 * Returns a mock auth slice fragment ({ access, refresh, user }) when preview
 * mode is on, otherwise null. Tokens are clearly-labelled placeholders.
 */
export function getPreviewAuthState() {
  if (!PREVIEW_AUTH_ENABLED) return null;

  // eslint-disable-next-line no-console
  console.warn(
    '[previewAuth] Preview auth is ON — using a mock user. Local dev only.'
  );

  return {
    access: 'preview-access-token',
    refresh: 'preview-refresh-token',
    user: {
      id: 'preview-user',
      email: 'preview@folio.local',
      first_name: 'Preview',
      last_name: 'Reader',
      full_name: 'Preview Reader',
      role: PREVIEW_ROLE,
    },
  };
}
