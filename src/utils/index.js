import tinycolor from 'tinycolor2';

import {isNum} from '../../../../lib/math.mjs';
import {
  EXERCISE_TYPE,
  STATUSES_FINISHED,
  STATUSES_IN_PROGRESS,
} from '../../../../lib/training/constants.mjs';
import {getRequiresBodyweight} from '../../../../lib/training/utils.mjs';
import config from '../../tailwind.config.js';
import {LS_KEY_THEME, templateDayRecommendations} from '../constants.js';
import storage from './storage.js';

export function getFirstDayInProgress(meso) {
  if (!meso) {
    return;
  }

  const allDays = meso.weeks.flatMap(week => week.days);
  return allDays.find(day => STATUSES_IN_PROGRESS.day.includes(day.status));
}

export function getFirstUnfinishedDay(meso) {
  if (!meso) {
    return;
  }

  const allDays = meso.weeks.flatMap(week => week.days);
  return allDays.find(day => !STATUSES_FINISHED.day.includes(day.status));
}

export function getCurrentDayRoute(meso) {
  if (!meso) {
    return '';
  }

  const firstStartedDay = getFirstDayInProgress(meso);

  if (firstStartedDay) {
    const weekIdx = firstStartedDay.week + 1;
    const dayIdx = firstStartedDay.position + 1;

    return `/mesocycles/${meso.key}/weeks/${weekIdx}/days/${dayIdx}`;
  } else {
    const firstUnfinishedDay = getFirstUnfinishedDay(meso);
    if (firstUnfinishedDay) {
      const weekIdx = firstUnfinishedDay.week + 1;
      const dayIdx = firstUnfinishedDay.position + 1;

      return `/mesocycles/${meso.key}/weeks/${weekIdx}/days/${dayIdx}`;
    } else {
      return `/mesocycles/${meso.key}/weeks/1/days/1`;
    }
  }
}

function makeRepsIncrements() {
  const low = 0;
  const high = 100;
  const increments = [];

  // TODO: determine what to do if they do / need higher reps
  for (let i = low; i <= high; ++i) {
    increments.push(i);
  }

  return increments;
}

export const defaultRepsIncrements = makeRepsIncrements();

export function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// TODO: Talk to Jeff about hoisting this up to a shared module
export function getPickerIncrements(weightIncrements, exerciseType, unit, bodyweight = null) {
  const weightIncrementsForType = weightIncrements[unit][exerciseType];

  switch (exerciseType) {
    case EXERCISE_TYPE.bodyweightLoadable:
      if (!bodyweight) {
        return [];
      }
      return weightIncrementsForType.map(inc => inc - bodyweight).filter(val => val >= 0);

    case EXERCISE_TYPE.machineAssistance:
      if (!bodyweight) {
        return [];
      }
      return weightIncrementsForType
        .map(inc => bodyweight - inc)
        .filter(val => val >= 0)
        .reverse();

    default:
      return weightIncrementsForType;
  }
}

export function getSetWeightPickerVal(exerciseType, totalLoad, bodyweight) {
  if (totalLoad === null) {
    return '';
  }

  switch (exerciseType) {
    case EXERCISE_TYPE.bodyweightLoadable:
      return totalLoad - bodyweight;

    case EXERCISE_TYPE.machineAssistance:
      return -(totalLoad - bodyweight);

    default:
      return totalLoad;
  }
}

export function dayExerciseRequiresBodyweight(dayExercise, exercisesById) {
  return getRequiresBodyweight(exercisesById[dayExercise.exerciseId]?.exerciseType);
}

// Determines if a day from the meso planner board is in a good order
// const good = [
//   {exerciseId: null, muscleGroupId: '1'},
//   {exerciseId: null, muscleGroupId: '1'},
//   {exerciseId: null, muscleGroupId: '2'},
// ];
// const bad = [
//   {exerciseId: null, muscleGroupId: '1'},
//   {exerciseId: null, muscleGroupId: '2'},
//   {exerciseId: null, muscleGroupId: '1'},
// ];

export function goodDay(day) {
  const groupIds = day.map(day => day.muscleGroupId);

  if (groupIds.length < 3) {
    return true;
  }

  const groupIndexById = {};

  for (const [index, groupId] of groupIds.entries()) {
    if (isNum(groupIndexById[groupId])) {
      if (index - 1 > groupIndexById[groupId]) {
        return false;
      } else {
        groupIndexById[groupId] = index;
      }
    } else {
      groupIndexById[groupId] = index;
    }
  }

  return true;
}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
export function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  return 'unknown';
}

export function getWorkoutDayIndexesForTemplate(daysPerWeek = 1, offset = 0) {
  const mesoWeekdays = new Array(Number(daysPerWeek)).fill(null);

  return mesoWeekdays.map((mwd, index) => {
    const defaultWeekdayIndex = templateDayRecommendations?.[mesoWeekdays.length]?.[index] || 0;

    return (defaultWeekdayIndex + Number(offset)) % 7;
  });
}

export function getSubscribeUrl(userReferralCodeEntries = []) {
  const latestReferralCode = userReferralCodeEntries[0]?.code;
  if (latestReferralCode) {
    return `https://url${latestReferralCode}`;
  }

  return 'https://url';
}

export function getLastFinishedAtsForMeso(meso) {
  let lastFinishedAtDay = null;
  let lastFinishedAtSet = null;

  for (const week of meso.weeks) {
    for (const day of week.days) {
      if (day.finishedAt) {
        if (!lastFinishedAtDay || day.finishedAt > lastFinishedAtDay) {
          lastFinishedAtDay = day.finishedAt;
        }
      }

      for (const dayExercise of day.exercises) {
        for (const set of dayExercise.sets) {
          if (set.finishedAt) {
            if (!lastFinishedAtSet || set.finishedAt > lastFinishedAtSet) {
              lastFinishedAtSet = set.finishedAt;
            }
          }
        }
      }
    }
  }

  return {
    lastFinishedAtMeso: meso.finishedAt,
    lastFinishedAtDay,
    lastFinishedAtSet,
  };
}

export function getPreferredTheme(availableThemes) {
  const storedTheme = storage.getItem(LS_KEY_THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme =
    storedTheme && availableThemes.includes(storedTheme)
      ? storedTheme
      : prefersDark
      ? 'dark'
      : 'light';

  return theme;
}

export const STATUS_BAR_COLOR_TYPES = {
  // Note: modalOpen should NOT be used for a full-screen dialog because we aren't
  // trying to match the status bar color to a dimmed background for those
  modalOpen: 'modalOpen',
  sideBarOpen: 'sideBarOpen',
};

export function setTheDomStatusBarColor(theme, type = null) {
  const baseColorHex = config.daisyui.themes.find(obj => !!obj[theme])[theme][
    theme === 'dark' ? 'base-200' : 'base-100'
  ];

  // NOTE: this is brittle as fuck. I hope we remember to test in the SIM and change these if we
  // ever change our theme colors. I'm sure we will... ... ...
  const domStatusColorByType = {
    modalOpen: tinycolor(baseColorHex)
      .darken(theme === 'dark' ? 12.5 : 50)
      .toString(),
    sideBarOpen: tinycolor(baseColorHex)
      .darken(theme === 'dark' ? 0 : 75)
      .toString(),
  };

  let finalColor = domStatusColorByType[type] || baseColorHex;

  document.querySelector('meta[name="theme-color"').setAttribute('content', finalColor);
}

export function getFilteredExercises(exercises, muscleGroupId, exerciseType, exerciseSubType) {
  let results = [...exercises];

  if (muscleGroupId) {
    results = results.filter(ex => ex.muscleGroupId === muscleGroupId);
  }

  if (exerciseType) {
    results = results.filter(ex => ex.exerciseType === exerciseType);
  }

  if (exerciseSubType) {
    results = results.filter(ex => ex.exerciseSubType === exerciseSubType);
  }

  return results;
}
