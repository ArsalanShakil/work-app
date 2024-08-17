import {
  Barbell,
  Folder,
  Moon,
  PlusCircle,
  Question,
  Receipt,
  SignOut,
  SquaresFour,
  Star,
  Sun,
  User,
  Wrench,
} from '@phosphor-icons/react';
import {func} from 'prop-types';

import {AUTH_URL} from '../constants.js';
import {useAppVersion, useCurrentDayRoute} from '../utils/hooks.js';
import signOut from '../utils/signOut.js';
import useLocalStore from '../utils/useLocalStore.js';
import Reload from './Reload.jsx';
import NavigationItem from './ui/NavigationItem.jsx';
import UsersnapFeedbackClickable from './ui/UsersnapFeedbackClickable.jsx';

export function SidebarNavigation({onClose = () => {}}) {
  const {data: currentDayRoute} = useCurrentDayRoute();

  const theme = useLocalStore(st => st.theme);
  const setTheme = useLocalStore(st => st.setTheme);
  const setUserReviewOpen = useLocalStore(st => st.setUserReviewOpen);

  const isDesktop = useLocalStore(st => st.isDesktop);
  const appVersion = useAppVersion();

  return (
    <div className="flex h-full flex-col justify-between overflow-auto scrollbar-hide">
      <div className="mt-4 space-y-1">
        <NavigationItem
          to={currentDayRoute || '/mesocycles/plan'}
          label="Current workout"
          icon={<Barbell size={24} />}
          onClick={onClose}
          disableActive={!currentDayRoute}
        />

        <NavigationItem
          to="/mesocycles"
          label="Mesocycles"
          icon={<Folder size={24} />}
          onClick={onClose}
        />

        <NavigationItem
          to="/templates"
          label="Templates"
          icon={<SquaresFour size={24} />}
          onClick={onClose}
        />

        <NavigationItem
          to="/exercises"
          label="Custom exercises"
          icon={<Wrench size={24} />}
          onClick={onClose}
        />

        <NavigationItem
          to="/mesocycles/plan"
          label="Plan a new mesocycle"
          icon={<PlusCircle size={24} />}
          onClick={onClose}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          {isDesktop && <Reload />}

          <NavigationItem
            label={`${theme} theme`}
            icon={
              <label
                value={theme}
                className={`swap swap-rotate ${theme === 'light' ? 'swap-active' : ''}`}
              >
                <Sun size={24} className="swap-on" style={{fill: 'white'}} />
                <Moon size={24} className="swap-off" style={{fill: 'white'}} />
              </label>
            }
            onClick={() => {
              setTheme(theme === 'light' ? 'dark' : 'light');
            }}
            style={{textTransform: 'capitalize'}}
          />

          <NavigationItem
            to="/profile"
            label="Profile & Settings"
            icon={<User size={24} />}
            onClick={onClose}
          />

          <NavigationItem
            to={`${AUTH_URL}/manage`}
            label="Subscription"
            icon={<Receipt size={24} />}
            onClick={onClose}
            target="_blank"
          />

          <NavigationItem label="Sign out" icon={<SignOut size={24} />} onClick={signOut} />
        </div>

        <div className="space-y-1">
          <div onClick={onClose}>
            <UsersnapFeedbackClickable className="group flex cursor-pointer items-center p-2 text-sm font-medium text-neutral-content hover:bg-neutral">
              <span className="mr-3 text-neutral-content">{<Question size={24} />}</span>
              Help
            </UsersnapFeedbackClickable>
          </div>

          <NavigationItem
            label="Leave a review"
            icon={<Star size={24} />}
            onClick={() => {
              onClose();
              setUserReviewOpen(true);
            }}
          />
        </div>

        <div className="ml-11 pb-10 text-xs text-base-100 dark:text-base-content">
          Version: {appVersion}
        </div>
      </div>
    </div>
  );
}

SidebarNavigation.propTypes = {
  onClose: func,
};
