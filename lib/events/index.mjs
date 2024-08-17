import {Buffer} from 'buffer';
import ky from 'ky-universal';
import {nanoid} from 'nanoid';
import {gzip} from 'pako';
import queryString from 'querystring';

const QUEUED_MAX = 10000;

const FLUSH_MAX = 1000;
const FLUSH_REQUEST_RETRY = 3;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds
const FLUSH_ACTIVE_EXPIRE_MS = 180000; // 3 minutes

class EventsDroppedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

function getTimestampStringFromDate(date, {includeMs = true, includeSeconds = true} = {}) {
  const tzOffsetMinutes = date.getTimezoneOffset();
  const tzOffsetMs = tzOffsetMinutes * 60000;

  const localDate = new Date(date.getTime() - tzOffsetMs);
  let localISOTimeString = localDate.toISOString().slice(0, -1);
  if (!includeMs || !includeSeconds) {
    // Trim ms
    localISOTimeString = localISOTimeString.split('.').slice(0, -1).join('.');
  }
  if (!includeSeconds) {
    localISOTimeString = localISOTimeString.split(':').slice(0, -1).join(':');
  }

  let result = localISOTimeString;

  const sign = -Math.sign(tzOffsetMinutes);
  const tzOffsetMinutesAbs = Math.abs(tzOffsetMinutes);

  const hours = String(Math.floor(tzOffsetMinutesAbs / 60)).padStart(2, '0');
  const minutes = String(tzOffsetMinutesAbs % 60).padStart(2, '0');
  result += `${sign >= 0 ? '+' : '-'}${hours}:${minutes}`;

  return result;
}

const SEQ_SEP_CODE_START = 30; // Record Separator
const SEQ_SEP_CODE_END = 10; // Newline
const SEQ_SEP_STRING_START = String.fromCharCode(SEQ_SEP_CODE_START);
const SEQ_SEP_STRING_END = String.fromCharCode(SEQ_SEP_CODE_END);
function seqStringifyRecord(data) {
  return `${SEQ_SEP_STRING_START}${JSON.stringify(data)}${SEQ_SEP_STRING_END}`;
}

let queued = [];

/**
 * Track an event
 *
 * @param {object} data
 * @param {string} data.type   One of Object.keys(common.eventTypes).
 * @param {number} [data.atMs] Auto-filled if not provided.
 * @param {string} [data.at]   Auto-filled if not provided.
 */
function track(data) {
  const event = {...data, id: nanoid()};

  const isMissingAtMs = !data.atMs;
  const isMissingAt = !data.at;
  const isMissingType = !data.type;

  if (isMissingAtMs) {
    event.atMs = Date.now();
  }
  if (isMissingAt) {
    event.at = getTimestampStringFromDate(new Date(event.atMs));
  }

  if (isMissingType) {
    config.logError('Missing event type.', data);
    event.type = '[unknown]';
  }

  queued.push(event);

  // Drop old events if we exceed our max queued limit.
  if (queued.length > QUEUED_MAX) {
    queued = queued.slice(FLUSH_MAX);
    config.logError(new EventsDroppedError('Queued max exceeded.'));
  }
}

let flushing = [];
const flushMeta = {
  lastEndedAtMs: null,
  isActive: false,
};

function startFlushEvents() {
  flushMeta.isActive = true;
  flushMeta.lastStartedAtMs = Date.now();

  flushing = queued.splice(0, FLUSH_MAX);
}

function commitFlushEvents() {
  flushing = [];

  flushMeta.lastEndedAtMs = Date.now();
  flushMeta.isActive = false;
}

function rollbackFlushEvents() {
  queued = flushing.concat(queued); // Prepend failed flush back to the queue.
  flushing = [];

  flushMeta.lastEndedAtMs = Date.now();
  flushMeta.isActive = false;
}

async function flush() {
  try {
    const queryParams = {
      ...config.commonData,
    };

    const startedAtMs = Date.now();

    if (flushMeta.isActive) {
      if (startedAtMs - flushMeta.lastStartedAtMs < FLUSH_ACTIVE_EXPIRE_MS) {
        // Allow existing flush time to finish.

        return;
      } else {
        rollbackFlushEvents();
      }
    }

    const queuedEvents = queued;
    if (!queuedEvents || !queuedEvents.length) {
      // No events to flush, bail out early before creating a bunch of action noise.

      return true;
    }

    startFlushEvents();

    let flushingEvents = flushing;
    if (!flushingEvents || !flushingEvents.length) {
      // This should never happen, so it probably will all the time.

      commitFlushEvents();

      return true;
    }
    flushingEvents = flushingEvents.slice();

    let bodyLines = [];
    for (let i = 0, l = flushingEvents.length; i < l; ++i) {
      bodyLines.push(seqStringifyRecord(flushingEvents[i]));
      delete flushingEvents[i];
    }
    let body = Buffer.from(bodyLines.join(''), 'utf8');
    bodyLines = null;
    const encodedBody = gzip(body);
    body = null;

    try {
      await ky(`${config.baseUrl}?${queryString.stringify(queryParams)}`, {
        method: 'POST',
        headers: {
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json-seq',
        },
        credentials: 'omit',
        body: encodedBody,
        timeout: (FLUSH_ACTIVE_EXPIRE_MS * 0.9) / FLUSH_REQUEST_RETRY,
        retry: FLUSH_REQUEST_RETRY,
        keepalive: true, // Allow the request to outlive the page.
      });

      commitFlushEvents();

      return true;
    } catch (err) {
      config.logError(err);

      rollbackFlushEvents(err);

      return false;
    }
  } catch (err) {
    config.logError(err);
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    // Allow other visibility change events to fire first by delaying until the next event cycle.
    setTimeout(flush, 0);
  }
}

const config = {
  baseUrl: null,
  logError: console.error, // eslint-disable-line no-console
  commonData: {},
};

let flushInterval = null;

/**
 * Initialize event system
 *
 * @param {string} baseUrl
 *
 * @param {object} options
 * @param {object} options.commonData
 * @param {string} options.commonData.userId
 * @param {string} options.commonData.app
 * @param {string} options.commonData.appVersion
 * @param {string} options.commonData.platform
 * @param {string} [options.commonData.appBuildNumber]
 * @param {string} [options.commonData.platformDeviceId]
 * @param {string} [options.commonData.osName]
 * @param {string} [options.commonData.osVersion]
 * @param {string} [options.commonData.adId]
 * @param {function} [logError]
 */
async function init(baseUrl, {commonData} = {}, logError = null) {
  if (!baseUrl) {
    throw new Error('baseUrl is required');
  }
  config.baseUrl = baseUrl;
  if (logError) {
    config.logError = logError;
  }
  if (commonData) {
    config.commonData = commonData;
  }

  if (queued.length || flushing.length) {
    config.logError(new EventsDroppedError('Dropped by init.'));
    config.logError({queued, flushing});
  }
  queued = [];
  flushing = [];
  flushMeta.lastEndedAtMs = null;
  flushMeta.isActive = false;

  flushInterval = setInterval(flush, FLUSH_INTERVAL_MS);
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Stop flushing events and try to clear queue.
 * Passes through result of final flush which may be false if it fails.
 *
 * @returns {Promise<boolean>}
 */
async function stop() {
  if (flushInterval) {
    clearInterval(flushInterval);
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  return flush();
}

export default {init, track, stop};

/*
// Usage example:

onLogin => events.init(CONFIG_EVENTS_URL, {
  commonData: {
    app: 'training',
    appVersion: APP_VERSION,
    appBuildNumber: BUILD_NUMBER,
    platform: 'rp',
    platformDeviceId: BROWSER_USER_AGENT_TENTATIVELY,
    osName: OS_NAME,
    osVersion: OS_VERSION,
    userId: user.id,
  }
});

events.track({type: EVENT_TYPES.APP_OPEN, pwa: true});

onLogout => events.stop();
*/
