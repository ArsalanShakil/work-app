import {CheckSquare, MinusSquare} from '@phosphor-icons/react';
import {bool, string} from 'prop-types';
import {memo} from 'react';

import {BUTTON_TYPE} from '../../constants.js';
import Ping from '../ui/Ping.jsx';

const size = 36;

const LogButtonIcon = memo(function LogButtonIcon({showIndicator, type}) {
  // TODO: animation-direction: reverse if we're unlogging?

  const {active, done, skipped, working} = BUTTON_TYPE;

  if (type === working) {
    return (
      <div className="flex h-9 w-9 items-center justify-center">
        <div className="relative flex h-[27px] w-[27px] items-center justify-center rounded-[3px] bg-emerald-600 dark:bg-emerald-700">
          <div className="snake-border h-[24px] w-[24px]" />
          <div className="absolute inset-[3px] bg-base-100 dark:bg-base-200" />
        </div>
      </div>
    );
  } else {
    if (type === done) {
      return (
        <CheckSquare size={size} weight="fill" className="text-emerald-600 dark:text-emerald-700" />
      );
    }

    if (type === skipped) {
      return (
        <MinusSquare size={size} weight="fill" className="text-emerald-600 dark:text-emerald-700" />
      );
    }

    if (type === active) {
      return (
        <div className="flex h-[36px] w-[35px] items-center justify-center">
          <div className="relative h-[27px] w-[27px] rounded-[3px] bg-emerald-600 dark:bg-emerald-500">
            <div className="absolute inset-[3px] bg-base-100 dark:bg-base-200" />
            {showIndicator && <Ping />}
          </div>
        </div>
      );
    } else {
      // inactive
      return (
        <div className="flex h-9 w-9 items-center justify-center">
          <div className="relative flex h-[27px] w-[27px] items-center justify-center rounded-[3px] bg-base-200 dark:bg-base-content/30">
            <div className="absolute inset-[3px] bg-base-100 dark:bg-base-200" />
          </div>
        </div>
      );
    }
  }
});

LogButtonIcon.propTypes = {
  showIndicator: bool.isRequired,
  type: string.isRequired,
};

export default LogButtonIcon;
