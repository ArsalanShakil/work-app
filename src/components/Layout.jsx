import {node} from 'prop-types';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';

import {useAppConfig, useMesocycles, useUserProfile} from '../api.js';
import {
  BREAKPOINTS,
  LS_KEY_APP_VERSIONS,
  LS_KEY_APP_WELCOME_SEEN,
  LS_KEY_MASQUERADE,
} from '../constants.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import FirstTimeUserScreen from './FirstTimeUserScreen.jsx';
import MasqueradeBanner from './MasqueradeBanner.jsx';
import MobileHeader from './MobileHeader.jsx';
import Notifier from './Notifier.jsx';
import Sidebar from './Sidebar.jsx';
import SurveyDialog from './SurveyDialog.jsx';
// import DowntimeBanner from './ui/DowntimeBanner.jsx';
import UserReviewDialog from './UserReviewDialog.jsx';
import WhatsNewPussycat from './WhatsNewPussycat.jsx';

// TODO: HOOK UP TAILWIND PAGE TRANSITIONS

export default function Layout({children}) {
  const {data: mesos} = useMesocycles();
  const {data: user} = useUserProfile();

  const userReviewOpen = useLocalStore(st => st.userReviewOpen);
  const isDesktop = useLocalStore(st => st.isDesktop);
  const setIsDesktop = useLocalStore(st => st.setIsDesktop);

  const [whatsNewMessages, setWhatsNewMessages] = useState([]);
  const [messagesChecked, setMessagesChecked] = useState(false);

  const {pathname} = useLocation();
  const scrollRef = useRef();
  const {data} = useAppConfig();

  const hasSeenWelcomeScreen = storage.getItem(LS_KEY_APP_WELCOME_SEEN);
  const [showWelcome, setShowWelcome] = useState(!mesos.length && !hasSeenWelcomeScreen);

  const showSurvey = useMemo(() => {
    return (
      !showWelcome &&
      !userReviewOpen &&
      !whatsNewMessages.length &&
      !user.attributes.ATTRIBUTION_SURVEY
    );
  }, [showWelcome, user.attributes.ATTRIBUTION_SURVEY, userReviewOpen, whatsNewMessages.length]);

  const setMessagesSeen = useCallback(newMessages => {
    const messagesSeen = storage.getItem(LS_KEY_APP_VERSIONS) || [];
    const newMessagesSeen = Array.from(
      new Set([...messagesSeen, ...newMessages.map(ms => ms.id)])
    ).sort();
    storage.setItem(LS_KEY_APP_VERSIONS, newMessagesSeen);
  }, []);

  const handleWhatsNewClose = useCallback(() => {
    setMessagesSeen(whatsNewMessages);
    setWhatsNewMessages([]);
  }, [setMessagesSeen, whatsNewMessages]);

  const handleWelcomeSeen = useCallback(() => {
    storage.setItem(LS_KEY_APP_WELCOME_SEEN, true);
    setShowWelcome(false);
  }, []);

  const handleResize = useCallback(() => {
    setIsDesktop(window.matchMedia(`(min-width: ${BREAKPOINTS.desktop})`).matches);
  }, [setIsDesktop]);

  useEffect(() => {
    if (data?.info && !messagesChecked) {
      const versionMessages = data?.info.version;
      const messagesSeen = storage.getItem(LS_KEY_APP_VERSIONS) || [];
      const messagesToShow = versionMessages.filter(ms => !messagesSeen.includes(ms.id));

      if (!showWelcome) {
        setWhatsNewMessages(messagesToShow);
      } else {
        setMessagesSeen(messagesToShow);
      }

      setMessagesChecked(true);
    }
  }, [data, messagesChecked, setMessagesSeen, showWelcome]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    const isMasquerading = storage.getItem(LS_KEY_MASQUERADE);
    if (!isMasquerading) {
      // inexplicably, this causes the banner to disappear. we don't give a shit
      // to debug this complete and utter horseshit
      scrollRef.current.focus();
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Scroll to top when url changes
  useEffect(() => {
    scrollRef.current.scrollTo(0, 0);
  }, [pathname]);

  // WARNING: The styles in this component are sensitive! Here be dragons.
  return (
    <div className="background absolute inset-0 dark:bg-base-300/70" tabIndex="0">
      <MasqueradeBanner />

      {/* <DowntimeBanner /> */}

      <div className="flex h-full w-full">
        {isDesktop && <Sidebar />}
        <main id="main" className="relative flex h-full w-full flex-col">
          {!isDesktop && <MobileHeader />}
          <div
            ref={scrollRef}
            className="min-h-0 grow overflow-auto overscroll-contain outline-none"
            tabIndex={1}
          >
            {children}
          </div>
        </main>
        <UserReviewDialog />
        <WhatsNewPussycat messages={whatsNewMessages} onClose={handleWhatsNewClose} />
        <FirstTimeUserScreen isOpen={showWelcome} onClose={handleWelcomeSeen} />
        <SurveyDialog isOpen={showSurvey} />
        <Notifier />
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: node.isRequired,
};
