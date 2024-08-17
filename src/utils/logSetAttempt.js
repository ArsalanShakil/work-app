const LOG_SET_ATTEMPT_KEY = 'mesoSetLogAttempt';

export function logAttempted() {
  return window[LOG_SET_ATTEMPT_KEY];
}

export function attemptLog() {
  if (!window.mesoSetLogAttempt) {
    window[LOG_SET_ATTEMPT_KEY] = true;
  }
}

export function clearLogAttempt() {
  window[LOG_SET_ATTEMPT_KEY] = false;
}
