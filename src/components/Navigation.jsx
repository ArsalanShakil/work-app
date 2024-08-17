import {Popover} from '@headlessui/react';
import {Calendar} from '@phosphor-icons/react';
import {func, number, object} from 'prop-types';
import {Fragment, useCallback} from 'react';
import {NavLink, useMatch} from 'react-router-dom';
import {twMerge} from 'tailwind-merge';

import {
  RIR_TARGET_REPS_BY_MESO_WEEKS,
  STATUSES_FINISHED,
} from '../../../../lib/training/constants.mjs';
import {useMesocycles} from '../api.js';
import {LS_KEY_HAS_SEEN_CALENDAR} from '../constants.js';
import {getCurrentDayRoute} from '../utils/index.js';
import storage from '../utils/storage.js';
import Ping from './ui/Ping.jsx';
import TransitionOpacity from './ui/TransitionOpacity.jsx';

// FIXME: NEED TO FIX LAYOUT OF DROPDOWN AND CHILDREN ON NARROW VIEWPORTS
function NavigationDayLink({day, onClose, meso, weekIndex}) {
  const urlDayIndex = day.position + 1;
  const urlWeekIndex = weekIndex + 1;
  const route = `/mesocycles/${meso.key}/weeks/${urlWeekIndex}/days/${urlDayIndex}`;
  const isCurrentDay = route === getCurrentDayRoute(meso);
  const isDayFinished = STATUSES_FINISHED.day.includes(day.status);
  const isActiveDay = useMatch(route);

  const navLinkBase = `flex text-xs font-medium btn btn-sm border hover:border-base-content/30 hover:bg-base-200 ${
    isActiveDay ? 'border-base-content/30 ' : 'border-base-200'
  }`;
  const currentDayClasses = `btn-accent bg-accent/30 hover:bg-accent/30 text-accent-focus dark:text-accent-content  hover:border-accent-focus dark:hover:border-red-500 ${
    isActiveDay ? 'border-accent-focus dark:border-red-500' : 'border-red-300 dark:border-red-800'
  }`;
  const finishedClasses = `btn-success hover:bg-success border-green-200 dark:border-green-700 ${
    isActiveDay
      ? 'border-green-500 dark:border-green-400'
      : 'hover:border-green-500 dark:hover:border-green-400'
  }`;

  const classes = [navLinkBase];

  if (isDayFinished) {
    classes.push(finishedClasses);
  } else if (isCurrentDay) {
    classes.push(currentDayClasses);
  }

  const classNames = twMerge(...classes);

  return (
    <div className="md:min-w-[72px]" key={`week-day-${urlDayIndex}`}>
      <NavLink className={classNames} to={route} onClick={onClose}>
        <div className="m-auto text-center">
          {day.label && (
            <Fragment>
              <div className="hidden whitespace-nowrap md:block">{day.label}</div>
              <div className="whitespace-nowrap md:hidden">{day.label.substring(0, 3)}</div>
            </Fragment>
          )}

          {!day.label && (
            <Fragment>
              <div className="hidden whitespace-nowrap md:block">day {urlDayIndex}</div>
              <div className="whitespace-nowrap font-semibold md:hidden">D{urlDayIndex}</div>
            </Fragment>
          )}
        </div>
      </NavLink>
    </div>
  );
}

NavigationDayLink.propTypes = {
  day: object.isRequired,
  onClose: func.isRequired,
  meso: object.isRequired,
  weekIndex: number.isRequired,
};

function NavigationColumn({week, weekIndex, meso, onClose}) {
  const targetRIR = Math.abs(RIR_TARGET_REPS_BY_MESO_WEEKS[meso.weeks.length][weekIndex]);

  return (
    <div className="space-y-1">
      <div className="hidden whitespace-nowrap py-2 text-center text-sm font-semibold uppercase text-base-content md:block">
        {meso.weeks.length - 1 === weekIndex ? 'deload' : `week ${weekIndex + 1}`}
        <div className="w-full text-center text-xs font-normal text-base-300 dark:text-base-content/50">
          {targetRIR} RIR
        </div>
      </div>
      <div className="w-full whitespace-nowrap py-2.5 text-center text-sm font-semibold text-base-content md:hidden">
        {meso.weeks.length - 1 === weekIndex ? 'DL' : `WK ${weekIndex + 1}`}
        <div className="w-full text-center text-xs font-normal text-base-300 dark:text-base-content/50">
          {targetRIR} RIR
        </div>
      </div>
      <div className="grid gap-1">
        {week.days.map(day => (
          <NavigationDayLink
            key={day.id}
            day={day}
            meso={meso}
            onClose={onClose}
            weekIndex={weekIndex}
          />
        ))}
      </div>
    </div>
  );
}

NavigationColumn.propTypes = {
  week: object.isRequired,
  weekIndex: number.isRequired,
  meso: object.isRequired,
  onClose: func.isRequired,
};

export default function Navigation({meso}) {
  const {data: mesos} = useMesocycles();
  const hasSeenCalendar = storage.getItem(LS_KEY_HAS_SEEN_CALENDAR);
  const highlightCalendar = mesos.length === 1 && !hasSeenCalendar;

  const handleClose = useCallback(
    onClose => {
      if (!hasSeenCalendar) {
        storage.setItem(LS_KEY_HAS_SEEN_CALENDAR, true);
      }
      onClose();
    },
    [hasSeenCalendar]
  );

  if (!meso) {
    return null;
  }

  return (
    <div className="z-30 flex space-x-3 ">
      <Popover className="flex">
        {({open, close}) => (
          <>
            <div className="relative flex">
              <Popover.Button className="outline-none">
                <Calendar
                  size={25}
                  className={`${
                    open ? 'text-accent-focus' : 'text-base-content hover:text-accent-focus'
                  }`}
                  aria-hidden="true"
                />
              </Popover.Button>
              {highlightCalendar && <Ping />}
            </div>
            <TransitionOpacity>
              <Popover.Panel className="absolute left-0 top-32 z-10 w-full desktop:top-16">
                <div className="shadow-xl ring-1 ring-black/5">
                  <div className="relative grid grid-flow-col gap-1 bg-base-100 p-2">
                    {meso.weeks.map((week, index) => (
                      <NavigationColumn
                        key={`nav-column-${index}`}
                        week={week}
                        weekIndex={index}
                        meso={meso}
                        onClose={() => {
                          handleClose(close);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </TransitionOpacity>
          </>
        )}
      </Popover>
    </div>
  );
}

Navigation.propTypes = {
  meso: object.isRequired,
};
