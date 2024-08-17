import Cookies from 'js-cookie';

import {
  COOKIE_KEY,
  DISPLAY_MODE,
  DISPLAY_MODE_PWA,
  IS_HOST_LOCAL,
  ROOT_DOMAIN,
} from '../constants.js';

export default function useToken() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    // Tracking consumption of the url token allows us to log out within the PWA as well
    // as ensuring we don't cause problems when PWA installed start_url tokens expire.
    const isPwa = DISPLAY_MODE === DISPLAY_MODE_PWA;
    const urlTokenConsumedKey = 'rp_pwa_url_token_consumed';

    if (!isPwa || !localStorage.getItem(urlTokenConsumedKey)) {
      const cookieOptions = {
        domain: ROOT_DOMAIN,
        expires: 365, // days
        sameSite: 'lax',
        secure: true,
      };
      if (IS_HOST_LOCAL) {
        delete cookieOptions.domain;
        cookieOptions.secure = false;
      }
      Cookies.set(COOKIE_KEY, urlToken, cookieOptions);

      if (isPwa) {
        localStorage.setItem(urlTokenConsumedKey, new Date().toISOString());
      }
    }
  }

  const cookieVal = Cookies.get(COOKIE_KEY);

  // FUCK THIS. WHO MADE THIS CRAP?! Andrew did.
  if (cookieVal === 'null') {
    return null;
  }

  return cookieVal;
}
