import {X} from '@phosphor-icons/react';
import {useEffect, useMemo} from 'react';
import {useMatch} from 'react-router-dom';

import {SIDEBAR_WIDTH} from '../constants.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import useLocalStore from '../utils/useLocalStore.js';
import IconButton from './ui/IconButton.jsx';
import Message from './ui/Message.jsx';
import TransitionOpacity from './ui/TransitionOpacity.jsx';

// We have to use hover: to override the buttons default accent hover styles
const contentStyles = {
  success: 'text-success-content hover:text-success-content',
  info: 'text-info-content hover:text-info-content',
  error: 'text-error-content hover:text-error-content',
  warning: 'text-warning-content hover:text-warning-content',
};

export default function Notifier() {
  const {notification, setNotification} = useNotifierContext();
  const open = useMemo(() => Boolean(notification?.message), [notification?.message]);
  const isDesktop = useLocalStore(st => st.isDesktop);

  const isTemplate = !!useMatch('/templates/:templateId');
  const isNewMeso = !!useMatch('/mesocycles/new');
  const isNewTemplate = !!useMatch('/templates/new');
  const isBoardView = isTemplate || isNewMeso || isNewTemplate;

  useEffect(() => {
    if (open && notification?.autoClose) {
      const timeout = setTimeout(
        () => setNotification({message: '', type: null, autoClose: false}),
        4500
      );
      return () => clearTimeout(timeout);
    }
  }, [notification?.autoClose, open, setNotification]);

  return (
    <TransitionOpacity show={Boolean(notification?.message)}>
      <div
        className={`toast toast-center toast-bottom z-50 w-full whitespace-break-spaces md:max-w-xl desktop:mb-4 ${
          isBoardView ? 'mb-20 standalone:mb-safe-offset-20' : 'standalone:mb-safe-offset-0'
        } `}
        style={{marginLeft: isDesktop ? SIDEBAR_WIDTH / 2 : 0}}
      >
        <Message variant={notification?.type} className="shadow-lg">
          <div className="flex items-center justify-between">
            <span>{notification?.message}</span>

            <IconButton
              icon={<X size={18} className={contentStyles[notification?.type]} />}
              onClick={() => setNotification({message: '', type: null, autoClose: false})}
            />
          </div>
        </Message>
      </div>
    </TransitionOpacity>
  );
}
