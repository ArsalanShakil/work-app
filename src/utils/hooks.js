import {useIsMutating} from '@tanstack/react-query';
import Cookies from 'js-cookie';
import cloneDeep from 'lodash.clonedeep';
import debounce from 'lodash.debounce';
import {customAlphabet} from 'nanoid';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import semver from 'semver';

import {getSortedBy} from '../../../../lib/sort.mjs';
import {RIR_TARGET_REPS_BY_MESO_WEEKS} from '../../../../lib/training/constants.mjs';
import {getCurrentMesoKey} from '../../../../lib/training/utils.mjs';
import {
  useAppConfig,
  useExercises,
  useMesocycle,
  useMesocycles,
  useMuscleGroups,
  useUserProfile,
} from '../api.js';
import {APP_VERSION, IS_HOST_LOCAL, LS_DEVICE_ID_KEY, ROOT_DOMAIN} from '../constants.js';
import {getCurrentDayRoute} from './index.js';
import storage from './storage.js';
import useLocalStore from './useLocalStore.js';

export function useCurrentMeso() {
  const {data: mesos, isActuallyLoading: mesosLoading} = useMesocycles();
  const currentMesoKey = getCurrentMesoKey(mesos);

  return useMesocycle(currentMesoKey, {
    enabled: Boolean(currentMesoKey) && !mesosLoading,
  });
}

export function useCurrentDayRoute() {
  const {data: meso, isActuallyLoading} = useCurrentMeso();

  return {data: getCurrentDayRoute(meso), isActuallyLoading};
}

export function useScript(src) {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState(src ? 'loading' : 'idle');
  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus('idle');
        return;
      }
      // Fetch existing script element by src
      // It may have been added by another instance of this hook
      let script = document.querySelector(`script[src="${src}"]`);
      if (!script) {
        // Create script
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.setAttribute('data-status', 'loading');
        // Add script to document body
        document.body.appendChild(script);
        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = event => {
          script.setAttribute('data-status', event.type === 'load' ? 'ready' : 'error');
        };
        script.addEventListener('load', setAttributeFromEvent);
        script.addEventListener('error', setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(script.getAttribute('data-status'));
      }
      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = event => {
        setStatus(event.type === 'load' ? 'ready' : 'error');
      };
      // Add event listeners
      script.addEventListener('load', setStateFromEvent);
      script.addEventListener('error', setStateFromEvent);

      // Remove event listeners on cleanup
      return () => {
        const cleanupScript = document.querySelector(`script[src="${src}"]`);
        if (cleanupScript) {
          cleanupScript.removeEventListener('load', setStateFromEvent);
          cleanupScript.removeEventListener('error', setStateFromEvent);
          cleanupScript.remove();
        }
      };
    },
    [src] // Only re-run effect if script src changes
  );
  return status;
}

export function useIsUpgradeAvailable() {
  const {data} = useAppConfig();

  return useMemo(() => {
    if (data?.info) {
      return {
        isUpgradeAvailable: semver.gt(data?.info.latestClientVersion, APP_VERSION),
        latestVersion: data?.info.latestClientVersion,
      };
    }

    return {};
  }, [data]);
}

export function useForceUpgradeData() {
  const {data} = useAppConfig();

  return useMemo(() => {
    let info, serverDate;
    if (data?.info && data?.serverDate) {
      info = data.info;
      serverDate = data.serverDate;

      if (new Date(info.upgrade?.force?.at) < serverDate) {
        const content = info.upgrade.force.content;
        if (content) {
          return {
            message: content.message,
            latestVersion: info.latestClientVersion,
            // url: content.url, // hypertrophy app doesn't use remote URL for upgrading clients
            force: true,
          };
        }
      }

      // NOTE: training app doesn't implement recommended upgrades
      // because we already have an upgade indicator WHENEVER
      // there is an upgrade available in the header / sidebar
    }

    return null;
  }, [data]);
}

// NOTE: do not change name without updating react-hooks/exhaustive-deps rule in .eslintrc

// Blocks callback from running if any mutation is in a loading state should be used in place
// of useCallback() for elements you don't want to be interactive until work from mutation is done.
export const useMutationCallback = (callback, deps = []) => {
  const isMutating = useIsMutating();

  const memoizedCallback = useCallback(
    (...args) => {
      if (isMutating) {
        return;
      }

      return callback(...args);
    },
    [isMutating, callback, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return memoizedCallback;
};

// Returns an object of two arrays:
// all: all active exercises
// custom: all active custom exercises for the user
export function useActiveExercises() {
  const {data: user} = useUserProfile();
  const {data: exercises} = useExercises();

  return useMemo(() => {
    return exercises
      ? exercises.reduce(
          (accum, exercise) => {
            if (!exercise.deletedAt) {
              if (exercise.userId === user.id) {
                accum.custom.push(exercise);
              }
              accum.all.push(exercise);
            }
            return accum;
          },
          {all: [], custom: []}
        )
      : {all: [], custom: []};
  }, [exercises, user.id]);
}

export function useExercisesForMuscleGroup(muscleGroupId) {
  const exercises = useActiveExercises();

  return useMemo(() => {
    const list = muscleGroupId
      ? exercises.all.filter(ex => ex.muscleGroupId === Number(muscleGroupId))
      : [];

    return getSortedBy(list, mg => mg.name);
  }, [exercises.all, muscleGroupId]);
}

export function useAppVersion() {
  const appVersionParts = APP_VERSION.split('.');
  const appVersion =
    appVersionParts[appVersionParts.length - 1] === '0'
      ? appVersionParts.slice(0, 2).join('.')
      : APP_VERSION;

  return appVersion;
}

export function useExercisesById() {
  const {data: exercises} = useExercises();
  return useMemo(() => {
    const exercisesById = {};

    if (exercises) {
      for (const ex of exercises) {
        exercisesById[ex.id] = ex;
      }
    }
    return exercisesById;
  }, [exercises]);
}

export function useMuscleGroupsById() {
  const {data: muscleGroups} = useMuscleGroups();

  return useMemo(() => {
    const muscleGroupsById = {};

    if (muscleGroups) {
      for (const mg of muscleGroups) {
        muscleGroupsById[mg.id] = mg;
      }
    }
    return muscleGroupsById;
  }, [muscleGroups]);
}

export function useHandleCardChange() {
  const days = useLocalStore(st => st.boardDays);
  const setDays = useLocalStore(st => st.setBoardDays);
  const dayIndex = useLocalStore(st => st.cardDayIndex);
  const slotIndex = useLocalStore(st => st.cardSlotIndex);

  const setProgressions = useLocalStore(st => st.setMuscleGroupProgressions);
  const existingProgressions = useLocalStore(st => st.muscleGroupProgressions);

  const newDays = cloneDeep(days);
  const oldSlot = newDays[dayIndex]?.[slotIndex];

  return useCallback(
    (cardValues, options) => {
      newDays[dayIndex][slotIndex] = {
        ...(options?.merge !== false && oldSlot),
        ...cardValues,
      };

      setDays(newDays);

      const currentMuscleGroupIds = new Set();

      for (const day of newDays) {
        for (const slot of day) {
          if (!currentMuscleGroupIds.has(slot.muscleGroupId)) {
            currentMuscleGroupIds.add(slot.muscleGroupId);
          }
        }
      }

      const newProgressions = {
        [cardValues.muscleGroupId]: existingProgressions[cardValues.muscleGroupId] || {
          mgProgressionType: 'regular',
          muscleGroupId: cardValues.muscleGroupId,
        },
      };

      for (const muscleGroupId of Object.keys(existingProgressions)) {
        if (currentMuscleGroupIds.has(Number(muscleGroupId))) {
          newProgressions[muscleGroupId] = existingProgressions[muscleGroupId];
        }
      }

      setProgressions(newProgressions, {replace: true});
    },
    [dayIndex, existingProgressions, newDays, oldSlot, setDays, setProgressions, slotIndex]
  );
}

export function useTemplateFilterResetCallback() {
  const setTemplateFilterSex = useLocalStore(st => st.setTemplateFilterSex);
  const setTemplateFilterEmphasis = useLocalStore(st => st.setTemplateFilterEmphasis);
  const setNumberOfDays = useLocalStore(st => st.setTemplateFilterNumberOfDays);

  const setLocalTemplateFilterSex = useLocalStore(st => st.setLocalTemplateFilterSex);
  const setLocalTemplateFilterEmphasis = useLocalStore(st => st.setLocalTemplateFilterEmphasis);
  const setLocalNumberOfDays = useLocalStore(st => st.setLocalTemplateFilterNumberOfDays);

  return useCallback(() => {
    setNumberOfDays(null);
    setTemplateFilterEmphasis(null);
    setTemplateFilterSex(null);

    setLocalNumberOfDays(null);
    setLocalTemplateFilterSex(null);
    setLocalTemplateFilterEmphasis(null);
  }, [
    setLocalNumberOfDays,
    setLocalTemplateFilterEmphasis,
    setLocalTemplateFilterSex,
    setNumberOfDays,
    setTemplateFilterEmphasis,
    setTemplateFilterSex,
  ]);
}

export function useHandleNewDayCallback() {
  const days = useLocalStore(st => st.boardDays);
  const setBoardDays = useLocalStore(st => st.setBoardDays);
  const weekDays = useLocalStore(st => st.boardWeekDays);
  const setWeekDays = useLocalStore(st => st.setBoardWeekDays);

  return useCallback(() => {
    const newDays = cloneDeep(days);
    newDays.push([]);
    setBoardDays(newDays);

    const newWeekDays = [...weekDays];
    newWeekDays.push(null);

    setWeekDays(newWeekDays);
  }, [days, setBoardDays, setWeekDays, weekDays]);
}

export function useDebounce(callback, delay = 300) {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = args => {
      ref.current?.(args);
    };

    return debounce(func, delay);
  }, [delay]);

  return debouncedCallback;
}

export function useDeviceId() {
  // Look for a deviceId
  const storageId = storage.getItem(LS_DEVICE_ID_KEY);
  const cookieId = Cookies.get(LS_DEVICE_ID_KEY);

  const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

  // Use whatever we find, or create a new one
  const deviceId = storageId || cookieId || nanoid();

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

  // Store what we find / create in local storage and cookies
  storage.setItem(LS_DEVICE_ID_KEY, deviceId);
  Cookies.set(LS_DEVICE_ID_KEY, deviceId, cookieOptions);

  // Return what we have
  return deviceId;
}

export function useMesoDay() {
  const {mesoKey, week, day: dayParam} = useParams();
  const {data: meso} = useMesocycle(mesoKey);

  return {
    meso,
    day: meso.weeks[Number(week) - 1].days[Number(dayParam) - 1],
  };
}

export function useTargetRIR() {
  const {meso, day} = useMesoDay();
  return Math.abs(RIR_TARGET_REPS_BY_MESO_WEEKS[meso.weeks.length][day.week]);
}
