/**
 * playSound — lightweight toast notification sound helper.
 *
 * Audio files live in `public/sounds/` and are served from the site root:
 *   public/sounds/success.mp3
 *   public/sounds/error.mp3
 *   public/sounds/info.mp3
 *
 * Notes:
 *  - Audio objects are cached so we don't refetch on every toast.
 *  - Browsers block autoplay until the user has interacted with the page,
 *    so play() rejections are swallowed silently (no console spam).
 *  - Respects a user mute preference stored in localStorage ('toastMuted').
 */

const cache = {};
const DEFAULT_VOLUME = 0.4;

function getAudio(file) {
  if (!cache[file]) {
    const audio = new Audio(`/sounds/${file}.mp3`);
    audio.volume = DEFAULT_VOLUME;
    audio.preload = 'auto';
    cache[file] = audio;
  }
  return cache[file];
}

/**
 * Play the notification sound for a given toast type.
 * Only success and error play a sound; info/warning stay silent to avoid noise.
 * @param {'success'|'error'|'warning'|'info'} type
 */
export function playToastSound(type = 'info') {
  // Honour a global mute toggle if the user set one
  try {
    if (localStorage.getItem('toastMuted') === 'true') return;
  } catch {
    /* localStorage unavailable — continue */
  }

  // Map toast types to available sound files. info & warning are silent.
  const file =
    type === 'success' ? 'success' :
    type === 'error'   ? 'error'   :
    null;

  if (!file) return;

  try {
    const audio = getAudio(file);
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {}); // ignore autoplay-policy rejections
    }
  } catch {
    /* no-op — never let a sound failure break the UI */
  }
}

/** Toggle and persist the mute preference. Returns the new muted state. */
export function toggleToastMute() {
  try {
    const muted = localStorage.getItem('toastMuted') === 'true';
    localStorage.setItem('toastMuted', String(!muted));
    return !muted;
  } catch {
    return false;
  }
}
