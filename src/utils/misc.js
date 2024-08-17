import {ANIMATION_DURATION, APP_VERSION} from '../constants.js';
import logError from './logError.js';

export function addQueryParams(url, params) {
  const r = new URL(url, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    r.searchParams.set(key, String(value));
  }
  return r.toString();
}

export async function forceReload(latestAppVersion = APP_VERSION) {
  try {
    const registrations = await window.navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
  } catch (err) {
    logError(new Error('Service worker deregistration failure during forceReload()'));
  }

  window.location.href = `/?v=${latestAppVersion}`;
}

// We need a little breathing room to be absolutely sure the animation is complete to avoid jank
const ANIMATION_BREATHING_ROOM = 50;
export function runAfterAnimations(func) {
  // 25 %
  // return setTimeout(func, (ANIMATION_DURATION + ANIMATION_BREATHING_ROOM) * 4);

  // 10 %
  // return setTimeout(func, (ANIMATION_DURATION + ANIMATION_BREATHING_ROOM) * 10);

  // Default
  return setTimeout(func, ANIMATION_DURATION + ANIMATION_BREATHING_ROOM);
}

export async function ensureManifest(url) {
  const linkEl = document.querySelector(`link[rel="manifest"]`);
  if (url === linkEl.href) {
    return;
  }

  linkEl.href = url;
}
