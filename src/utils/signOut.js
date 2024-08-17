import Bugsnag from '@bugsnag/js';
import Cookies from 'js-cookie';

import {
  COOKIE_KEY,
  LS_KEY_APP_VERSIONS,
  LS_KEY_MASQUERADE,
  LS_KEY_USER_SUBS,
  ROOT_DOMAIN,
} from '../constants.js';
import {forceReload} from './misc.js';
import storage from './storage.js';

export default function signOut() {
  if ((RP_ENV || NODE_ENV) === 'local') {
    Cookies.remove(COOKIE_KEY);
  }
  Cookies.remove(COOKIE_KEY, {domain: ROOT_DOMAIN});

  storage.removeItem(LS_KEY_USER_SUBS);
  storage.removeItem(LS_KEY_APP_VERSIONS);
  storage.removeItem(LS_KEY_MASQUERADE);

  Bugsnag.setUser(undefined, undefined, undefined);

  // We deliberately DO NOT clear these LS keys as we
  // don't believe them to be meaningfully user specific:
  // LS_KEY_APP_PWA_SEEN
  // LS_KEY_APP_WELCOME_SEEN

  forceReload();
}
