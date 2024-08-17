import Bugsnag from '@bugsnag/js';
import {useEffect} from 'react';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {useUserProfile, useUserSubscriptions} from '../api.js';
import {
  ACCESS_ITEM,
  API_URL,
  APP_VERSION,
  DISPLAY_MODE,
  DISPLAY_MODE_IN_BROWSER,
  DISPLAY_MODE_PWA,
  EVENTS_URL,
  LS_KEY_MASQUERADE,
  MANIFEST_HREF_NORMAL,
} from '../constants.js';
import history from '../utils/history.js';
import {useDeviceId, useForceUpgradeData} from '../utils/hooks.js';
import logError from '../utils/logError.js';
import {ensureManifest} from '../utils/misc.js';
import signOut from '../utils/signOut.js';
import storage from '../utils/storage.js';
import useToken from '../utils/useToken.js';
import AuthorizedApp from './AuthorizedApp.jsx';
import Upgrade from './ForceUpgrade.jsx';
import Resubscribe from './Resubscribe.jsx';
import SignIn from './SignIn.jsx';
import Subscribe from './Subscribe.jsx';
import Loading from './ui/Loading.jsx';

export default function Authentication() {
  const token = useToken();

  const {
    data: user,
    isActuallyLoading: isUserLoading,
    error: userError,
  } = useUserProfile({enabled: !!token});

  const {
    data: userSubs,
    isActuallyLoading: isUserSubsLoading,
    error: userSubsError,
  } = useUserSubscriptions({enabled: !!user?.id});

  const forceUpgradeData = useForceUpgradeData();

  const platformDeviceId = useDeviceId();

  useEffect(() => {
    if (user?.id) {
      Bugsnag.setUser(user.id, user.email, user.displayName);
    }

    // Deliberately not cleaning up here, logout does it.
  }, [user?.id, user?.email, user?.displayName]);

  const userId = user?.id;
  useEffect(() => {
    function cleanup() {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      events.stop().catch(logError);
    }

    if (!userId) {
      return cleanup;
    }

    let isSuspended = false;
    function handleVisibilityChange() {
      const isSuspendedCurrent = document.visibilityState === 'hidden';

      if (isSuspendedCurrent !== isSuspended) {
        isSuspended = isSuspendedCurrent;
        events.track({
          type: isSuspended ? common.eventTypes.appSuspend : common.eventTypes.appResume,
        });
      }
    }

    (async () => {
      try {
        await events.init(EVENTS_URL, {
          commonData: {
            app: 'training',
            appVersion: APP_VERSION,
            osName: DISPLAY_MODE === DISPLAY_MODE_PWA ? 'browser-pwa' : 'browser',
            osVersion: navigator.userAgent,
            platform: 'web',
            platformDeviceId,
            userId,
          },
          logError,
        });

        events.track({
          type: common.eventTypes.appOpen,
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);
      } catch (err) {
        logError(err);
      }
    })();

    return cleanup;
  }, [platformDeviceId, userId]);

  // Once on app load
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.has('token')) {
      url.searchParams.delete('token');
    }

    if (url.searchParams.has('masquerade')) {
      url.searchParams.delete('masquerade');
      storage.setItem(LS_KEY_MASQUERADE, true);
    }

    history.replace(url.toString(), null);
  }, []);

  if (isUserLoading || isUserSubsLoading) {
    return (
      <div className="absolute inset-1/2">
        <Loading />
      </div>
    );
  }

  if (user && DISPLAY_MODE === DISPLAY_MODE_IN_BROWSER) {
    ensureManifest(`${API_URL}/training/app.webmanifest?v=${APP_VERSION}&token=${token}`);
  } else {
    ensureManifest(MANIFEST_HREF_NORMAL);
  }

  if (userError || userSubsError) {
    signOut();
  }

  const activeTrainingSubs = userSubs?.activeSubscriptions.filter(sub =>
    sub.access?.includes(ACCESS_ITEM.training)
  );

  // NOTE: this includes previous AND current
  const previousTrainingSubs = userSubs?.consumedIaps.filter(iap =>
    iap.access?.includes(ACCESS_ITEM.training)
  );

  // TODO: For now this means any crafty users can work around this if they
  // deobfuscate code. Almost certainly fine for a long while (maybe forever)
  // since this isn't medical records or ITAR and it would really complicate things
  // to do the security "properly" on the server side
  // DO IT SOMEWHERE ON SOMETHING ON ONE BASIC ENDPOINT THAT TRIGGERS CLIENT BEHAVIOR FOR (NO AUTH YOU SNEAKY PERSON)
  // add validateAccess query param that validates activeSubscription and returns 401 if not valid

  let hasSubscriptionLapsed = false;
  let hasNeverSubscribed = false;
  if (!activeTrainingSubs?.length) {
    hasSubscriptionLapsed = !!previousTrainingSubs?.length;
    hasNeverSubscribed = !previousTrainingSubs?.length;
  }
  if (DISABLE_SUB_CHECK) {
    hasSubscriptionLapsed = false;
    hasNeverSubscribed = false;
  }

  if (!token) {
    return <SignIn />;
  }

  // NOTE: this kinda sucks because it throws away any local state if their subscription expires
  // in the middle of unsaved work
  if (hasSubscriptionLapsed) {
    return <Resubscribe />;
  }

  if (hasNeverSubscribed) {
    return <Subscribe />;
  }

  // NOTE: this kinda sucks because it throws away any local state if their subscription expires
  // in the middle of unsaved work
  if (forceUpgradeData) {
    return <Upgrade data={forceUpgradeData} />;
  }

  return <AuthorizedApp />;
}
