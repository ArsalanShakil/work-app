import {CircleNotch} from '@phosphor-icons/react';
import {array, bool, func, number, object, string} from 'prop-types';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import common from '../../../../../config/common.json5';
import {ErrorWithExtraData} from '../../../../../lib/errors.mjs';
import events from '../../../../../lib/events/index.mjs';
import {isNum, roundTo} from '../../../../../lib/math.mjs';
import {
  AUTO_APPLY_WEIGHTS,
  EXERCISE_TYPE,
  SET_TYPE,
  SKIPPED_SET_REPS,
  STATUSES,
  STATUSES_FINISHED,
  TRAINING_USER_ATTRIBUTES,
} from '../../../../../lib/training/constants.mjs';
import {
  useCreateSet,
  useDeleteSet,
  useFeatureFlagMutation,
  useFetch,
  useUpdateSet,
  useUserProfile,
} from '../../api.js';
import {useConfirmation} from '../../ConfirmationContext.jsx';
import {
  DIALOG_CONFIGS,
  LS_KEY_AUTO_WEIGHT_MESO_KEYS,
  SET_INPUTS,
  UNIT_DISPLAY,
} from '../../constants.js';
import getRepsError from '../../utils/getRepsError.js';
import getWeightError from '../../utils/getWeightError.js';
import getWeightInputMinMax from '../../utils/getWeightInputMinMax.js';
import {useExercisesById, useMutationCallback, useTargetRIR} from '../../utils/hooks.js';
import {attemptLog, clearLogAttempt, logAttempted} from '../../utils/logSetAttempt.js';
import {runAfterAnimations} from '../../utils/misc.js';
import {parseNumberLocale} from '../../utils/parseNumberLocale.js';
import storage from '../../utils/storage.js';
import useLocalStore from '../../utils/useLocalStore.js';
import Chinfo from './Chinfo.jsx';
import LogButton from './LogButton.jsx';
import Porn from './Porn.jsx';
import ReadOnlyInput from './ReadOnlyInput.jsx';
import SetBadge from './SetBadge.jsx';
import SetInput from './SetInput.jsx';
import SetMenu from './SetMenu.jsx';

function getWeightInputTextFromSet(set, exerciseType) {
  if (!set) {
    return '';
  }

  if (exerciseType === EXERCISE_TYPE.bodyweightLoadable) {
    // Initial state without bodyweight or weight
    if (!isNum(set.bodyweight) && !isNum(set.weight)) {
      return '';
    }

    // User has specified bodyweight but not selected an added weight yet (so no "weight")
    if (isNum(set.bodyweight) && !isNum(set.weight)) {
      return '';
    }

    if (!isNum(set.bodyweight) && isNum(set.weight)) {
      throw new ErrorWithExtraData('Bad set detected that has weight without bodyweight', {
        set,
        exerciseType,
      });
    }

    if (set.bodyweight > set.weight) {
      throw new ErrorWithExtraData(
        'Bad bw loadable set detected where bodyweight is greater than total weight',
        {
          set,
          exerciseType,
        }
      );
    }

    return String(roundTo(set.weight - set.bodyweight, 0.01));
  }

  if (exerciseType === EXERCISE_TYPE.machineAssistance) {
    // Initial state without bodyweight or weight
    if (!isNum(set.bodyweight) && !isNum(set.weight)) {
      return '';
    }

    // User has specified bodyweight but not selected assistance yet (so no "weight")
    if (isNum(set.bodyweight) && !isNum(set.weight)) {
      return '';
    }

    if (!isNum(set.bodyweight) && isNum(set.weight)) {
      throw new ErrorWithExtraData('Bad set detected that has weight without bodyweight', {
        set,
        exerciseType,
      });
    }

    if (set.bodyweight < set.weight) {
      throw new ErrorWithExtraData(
        'Bad assistance set detected where bodyweight is less than total weight',
        {
          set,
          exerciseType,
        }
      );
    }

    return String(roundTo(set.bodyweight - set.weight, 0.01));
  }

  if (!isNum(set.weight)) {
    return '';
  }

  return String(set.weight);
}

function getWeightFromInputText(weightInputText, exerciseType, bodyweight) {
  if (exerciseType === EXERCISE_TYPE.bodyweightLoadable) {
    if (weightInputText === '') {
      return null;
    }

    return parseNumberLocale(weightInputText) + bodyweight;
  }

  if (exerciseType === EXERCISE_TYPE.machineAssistance) {
    if (weightInputText === '') {
      return null;
    }

    return bodyweight - parseNumberLocale(weightInputText);
  }

  if (weightInputText === '') {
    return null;
  }

  return parseNumberLocale(weightInputText);
}

function getRepsInputTextFromReps(reps) {
  if (reps === SKIPPED_SET_REPS) {
    return 'n/a';
  }
  if (reps === null) {
    return '';
  }

  return String(reps);
}

function getRepsFromInputText(repsInputText) {
  if (repsInputText === '') {
    return null;
  }

  return parseInt(repsInputText);
}

const Set = memo(function Set({
  allSets,
  exerciseId,
  dayExerciseId,
  dayExerciseStatus,
  dayExercisePosition,
  dayId,
  dayWeek,
  dayPosition,
  dayFinishedAt,
  dayStatus,
  firstUnfinishedSetIndex,
  mesoUnit,
  set,
  setIsAddingSet,
  setIsDeletingSet,
  setsLength,
  showTutorial,
}) {
  const {data: user} = useUserProfile();
  const {mesoKey} = useParams();
  const exercisesById = useExercisesById();
  const {confirmation} = useConfirmation();
  const targetRIR = useTargetRIR();

  const exercise = exercisesById[exerciseId];
  const exerciseType = exercise?.exerciseType;

  const [weightInputText, setWeightInputText] = useState(
    getWeightInputTextFromSet(set, exerciseType)
  );
  const [repsInputText, setRepsInputText] = useState(getRepsInputTextFromReps(set.reps));
  const [weightError, setWeightError] = useState('');
  const [repsError, setRepsError] = useState('');

  const setFocusedSetId = useLocalStore(st => st.setFocusedSetId);
  const setFocusedSetInputType = useLocalStore(st => st.setFocusedSetInputType);
  const firstSetCompletedAt = useLocalStore(st => st.firstSetCompletedAt);
  const setFirstSetCompletedAt = useLocalStore(st => st.setFirstSetCompletedAt);

  const addSet = useCreateSet({dayId, dayExerciseId, mesoKey});
  const updateSet = useUpdateSet({mesoKey, setId: set.id});
  const deleteSet = useDeleteSet({mesoKey, setId: set.id});
  const updateFinished = useUpdateSet({mesoKey, setId: set.id});
  const fetchSecondMeso = useFetch('/training/meta/second-meso');

  const isBaseSet =
    set.setType !== SET_TYPE['myorep-match'] &&
    allSets[set.position + 1]?.setType === SET_TYPE['myorep-match'];

  const {min, max} = useMemo(
    () => getWeightInputMinMax(exerciseType, set.bodyweight, mesoUnit),
    [exerciseType, mesoUnit, set.bodyweight]
  );

  const repsPlaceholder = useMemo(() => {
    if (set.finishedAt) {
      return set.status === STATUSES.set.skipped ? 'n/a' : '';
    } else {
      return set.repsTarget > 0 ? set.repsTarget : `${targetRIR} RIR`;
    }
  }, [set.finishedAt, set.repsTarget, set.status, targetRIR]);

  const {showWeightIndicator, showRepsIndicator, showSaveIndicator} = useMemo(() => {
    const response = {
      showWeightIndicator: false,
      showRepsIndicator: false,
      showSaveIndicator: false,
    };

    if (showTutorial && set.position === 0) {
      if (set.status === STATUSES.set.ready) {
        response.showSaveIndicator = true;
      } else if (set.status === STATUSES.set.pendingReps) {
        response.showRepsIndicator = true;
      } else if (set.status === STATUSES.set.pendingWeight) {
        response.showWeightIndicator = true;
      }
    }
    return response;
  }, [set.position, set.status, showTutorial]);

  const handleFinishSuccess = useCallback(
    async updatedMeso => {
      // Update local state
      const newSet =
        updatedMeso.weeks[dayWeek].days[dayPosition].exercises[dayExercisePosition].sets[
          set.position
        ];
      setRepsInputText(getRepsInputTextFromReps(newSet.reps));
      setWeightInputText(getWeightInputTextFromSet(newSet, exerciseType));

      // Send events
      const isFirstCompleteSet = !firstSetCompletedAt && !!updatedMeso.firstSetCompletedAt;
      const setEvent = {
        type: common.eventTypes.setFinished,
        wexId: dayExerciseId,
        mesoKey: updatedMeso.key,
      };
      if (isNum(newSet.reps)) {
        if (newSet.reps >= 0 && newSet.repsTarget > 0) {
          if (newSet.reps > newSet.repsTarget) {
            setEvent.pl = 'over';
          } else if (newSet.reps < newSet.repsTarget) {
            setEvent.pl = 'under';
          } else {
            setEvent.pl = 'target';
          }
        }
      }
      if (isFirstCompleteSet) {
        setEvent.mesoFirst = true;

        if (!user.attributes[TRAINING_USER_ATTRIBUTES.TRAINING_MESO_FIRST_FINISHED_AT]) {
          // If user has never finished a meso, this is the first complete set of their first meso
          setEvent.firstMesoFirst = true;
        } else {
          const secondMeso = await fetchSecondMeso();
          if (secondMeso && secondMeso.key === mesoKey) {
            // We know this is the fist set of their second meso
            setEvent.secondMesoFirst = true;
          }
        }
      }
      events.track(setEvent);
      setFirstSetCompletedAt(updatedMeso.firstSetCompletedAt);
    },
    [
      dayWeek,
      dayPosition,
      dayExercisePosition,
      set.position,
      exerciseType,
      firstSetCompletedAt,
      dayExerciseId,
      setFirstSetCompletedAt,
      user.attributes,
      fetchSecondMeso,
      mesoKey,
    ]
  );

  const handleFinishSet = useCallback(
    updatedMeso => {
      // not using .isWorking because it is delayed a tick and animation concerns aren't relevant here
      if (updateSet.isLoading) {
        if (!logAttempted()) {
          attemptLog();
        }
      } else {
        let baseSet = set;

        if (updatedMeso) {
          baseSet =
            updatedMeso.weeks[dayWeek].days[dayPosition].exercises[dayExercisePosition].sets[
              set.position
            ];
        }

        const valid =
          !baseSet.finishedAt &&
          isNum(baseSet.weight) &&
          (isNum(baseSet.reps) || baseSet.repsTarget > 0);

        if (valid) {
          const body = {finishedAt: new Date().toISOString()};

          if (!isNum(baseSet.reps)) {
            body.reps = baseSet.repsTarget;
          }

          updateFinished.mutate(body, {onSuccess: handleFinishSuccess, onSettled: clearLogAttempt});
        }
      }
    },
    [
      updateSet.isLoading,
      set,
      dayWeek,
      dayPosition,
      dayExercisePosition,
      updateFinished,
      handleFinishSuccess,
    ]
  );

  const handleSkipSet = useMutationCallback(() => {
    updateSet.mutate(
      {
        reps: -1,
        finishedAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          // TODO: Skip set event
        },
      }
    );
  }, [updateSet]);

  const handleAddSet = useMutationCallback(() => {
    if (!dayExerciseId) {
      throw new ErrorWithExtraData('Somehow trying to add set to dex with null id', {
        dayExerciseId,
        dayExerciseStatus,
        dayExercisePosition,
        firstUnfinishedSetIndex,
        isBaseSet,
        set,
        setIsAddingSet,
        setIsDeletingSet,
        setsLength,
        updateSet,
      });
    }

    setIsAddingSet(true);
    addSet.mutate(
      {position: set.position + 1},
      {
        onSuccess: updatedMeso => {
          const wex = updatedMeso.weeks[dayWeek].days[dayPosition].exercises[dayExercisePosition];

          events.track({
            mesoKey: updatedMeso.key,
            type: common.eventTypes.setAdded,
            totalSets: wex.sets.length,
            wexId: dayExerciseId,
          });
        },
        onSettled: () => {
          runAfterAnimations(() => setIsAddingSet(false));
        },
      }
    );
  }, [
    addSet,
    dayExerciseId,
    dayExercisePosition,
    dayExerciseStatus,
    dayPosition,
    dayWeek,
    firstUnfinishedSetIndex,
    isBaseSet,
    set,
    setIsAddingSet,
    setIsDeletingSet,
    setsLength,
    updateSet,
  ]);

  const handleDeleteSet = useMutationCallback(() => {
    setIsDeletingSet(true);
    deleteSet.mutate(null, {
      onSuccess: updatedMeso => {
        const wex = updatedMeso.weeks[dayWeek].days[dayPosition].exercises[dayExercisePosition];

        events.track({
          mesoKey: updatedMeso.key,
          type: common.eventTypes.setRemoved,
          totalSets: wex.sets.length,
          wexId: dayExerciseId,
        });
      },
      onSettled: () => runAfterAnimations(() => setIsDeletingSet(false)),
    });
  }, [dayExerciseId, dayExercisePosition, dayPosition, dayWeek, deleteSet, setIsDeletingSet]);

  const handleType = useMutationCallback(setType => updateSet.mutate({setType}), [updateSet]);

  const handleInputSuccess = useCallback(
    updatedMeso => {
      if (logAttempted()) {
        handleFinishSet(updatedMeso);
      }
    },
    [handleFinishSet]
  );

  const flagMutation = useFeatureFlagMutation();

  const handleFlag = useMutationCallback(
    async value => flagMutation.mutateAsync({[AUTO_APPLY_WEIGHTS]: value}),
    [flagMutation]
  );

  const handleAutoWeightStorage = useMutationCallback(() => {
    const existingKeys = storage.getItem(LS_KEY_AUTO_WEIGHT_MESO_KEYS);
    const newKeys = Array.isArray(existingKeys) ? [...existingKeys, mesoKey] : [mesoKey];
    storage.setItem(LS_KEY_AUTO_WEIGHT_MESO_KEYS, newKeys.slice(0, 2));
  }, [mesoKey]);

  const handleAutoWeightReminder = useMutationCallback(
    async currentWeight => {
      const nextWeight = allSets[set.position + 1]?.weight;
      if (isNum(nextWeight) && nextWeight === currentWeight) {
        const storedMesoKeys = storage.getItem(LS_KEY_AUTO_WEIGHT_MESO_KEYS);
        let shouldShowAutoWeight = false;
        if (!storedMesoKeys) {
          // We know they haven't seen the dialog at all
          shouldShowAutoWeight = true;
        } else {
          if (Array.isArray(storedMesoKeys)) {
            if (!storedMesoKeys.includes(mesoKey) && storedMesoKeys.length < 2) {
              // We know they haven't seen the dialog twice
              shouldShowAutoWeight = true;
            }
          }
        }
        // At this point we know we should remind them about auto match weight
        if (shouldShowAutoWeight) {
          const autoMatchOn = user.attributes[AUTO_APPLY_WEIGHTS];
          let shouldApplyAutoWeight;
          if (autoMatchOn) {
            if (await confirmation(DIALOG_CONFIGS.autoMatchWeightDisableConfirm)) {
              handleAutoWeightStorage();
              return;
            }
            shouldApplyAutoWeight = false;
          } else {
            shouldApplyAutoWeight = await confirmation(DIALOG_CONFIGS.autoMatchWeightConfirm);
          }

          // Update user preference
          await handleFlag(shouldApplyAutoWeight);

          handleAutoWeightStorage();
        }
      }
    },
    [
      allSets,
      confirmation,
      handleAutoWeightStorage,
      handleFlag,
      mesoKey,
      set.position,
      user.attributes,
    ]
  );

  const handleWeightBlur = useCallback(async () => {
    setFocusedSetId(null);
    setFocusedSetInputType(null);
    setWeightError('');

    const currentWeight = set.weight;
    // Total weight
    const weightFromInputText = getWeightFromInputText(
      weightInputText,
      exerciseType,
      set.bodyweight
    );

    const revert = () => setWeightInputText(getWeightInputTextFromSet(set, exerciseType));

    if (getWeightError(weightInputText, min, max, exerciseType)) {
      revert();

      return;
    }

    if (weightFromInputText !== currentWeight) {
      if (STATUSES_FINISHED.day.includes(dayStatus)) {
        const shouldContinue = await confirmation(DIALOG_CONFIGS.dayCompleteWarning);
        if (!shouldContinue) {
          revert();

          return;
        }
      }

      // Update unless user is trying to delete weight. We don't allow this.
      if (currentWeight > 0 && weightFromInputText === null) {
        revert();

        return;
      }

      // Determine if we should show the auto weight thing here
      if (!STATUSES_FINISHED.day.includes(dayStatus)) {
        await handleAutoWeightReminder(currentWeight);
      }

      updateSet.mutate(
        {weight: weightFromInputText},
        {onSuccess: updatedMeso => handleInputSuccess(updatedMeso)}
      );
    }
  }, [
    confirmation,
    dayStatus,
    exerciseType,
    handleAutoWeightReminder,
    handleInputSuccess,
    max,
    min,
    set,
    setFocusedSetId,
    setFocusedSetInputType,
    updateSet,
    weightInputText,
  ]);

  const handleRepsBlur = useCallback(async () => {
    setFocusedSetId(null);
    setFocusedSetInputType(null);
    setRepsError('');

    const repsFromInputText = getRepsFromInputText(repsInputText);

    const revert = () => setRepsInputText(getRepsInputTextFromReps(set.reps));

    // Check that local reps don't match set reps, there's no error, and repsInputText are truthy
    const newLocalReps =
      repsFromInputText !== set.reps && !getRepsError(repsFromInputText) && repsFromInputText;

    if (isNum(newLocalReps)) {
      if (STATUSES_FINISHED.day.includes(dayStatus)) {
        const shouldContinue = await confirmation(DIALOG_CONFIGS.dayCompleteWarning);
        if (!shouldContinue) {
          revert();

          return;
        }
      }

      updateSet.mutate({reps: newLocalReps}, {onSuccess: handleInputSuccess});
    } else {
      revert();
    }
  }, [
    confirmation,
    dayStatus,
    handleInputSuccess,
    repsInputText,
    set.reps,
    setFocusedSetId,
    setFocusedSetInputType,
    updateSet,
  ]);

  // Because these two onChange handlers use useMutationCallback, they are effectively disabled when a mutation is in flight
  const handleWeightChange = useMutationCallback(
    e => {
      const newInputText = e.target.value;

      setWeightInputText(newInputText);
      setWeightError(getWeightError(newInputText, min, max, exerciseType));
    },
    [exerciseType, max, min]
  );

  const handleRepsChange = useMutationCallback(e => {
    const reps = getRepsFromInputText(e.target.value); // enforces integer only
    setRepsInputText(getRepsInputTextFromReps(reps));
    setRepsError(getRepsError(reps));
  }, []);

  const handleReset = useMutationCallback(() => {
    if (!dayFinishedAt && set.finishedAt) {
      updateFinished.mutate({finishedAt: null});
    }
  }, [dayFinishedAt, set.finishedAt, updateFinished]);

  // If underlying blobject data has changed, update local inputs
  useEffect(() => {
    setWeightInputText(getWeightInputTextFromSet(set, exerciseType));
    setRepsInputText(getRepsInputTextFromReps(set.reps));
  }, [set, exerciseType]);

  let relatedSet;

  if (set.setType === SET_TYPE['myorep-match']) {
    // Check to see if the set we're matching has reps
    for (let i = set.position - 1; i >= 0; --i) {
      if (allSets[i].setType !== SET_TYPE['myorep-match']) {
        relatedSet = allSets[i];
        break;
      }
    }
  }

  const isLastFinished = useMemo(
    () => !!set.finishedAt && allSets.slice(set.position + 1).every(s => !s.finishedAt),
    [allSets, set.finishedAt, set.position]
  );

  return (
    <li className="ml-4 py-2.5">
      <div className="flex items-center">
        <div className="w-[32px] shrink-0">
          <SetMenu
            dayExerciseStatus={dayExerciseStatus}
            dayFinished={!!dayFinishedAt}
            firstUnfinishedSetIndex={firstUnfinishedSetIndex}
            handleAddSet={handleAddSet}
            handleDeleteSet={handleDeleteSet}
            handleSkipSet={handleSkipSet}
            handleType={handleType}
            isBaseSet={isBaseSet}
            set={set}
            setsLength={setsLength}
          />
        </div>
        <div className="grid w-full grid-cols-8 pr-4">
          <div className="col-span-3 flex items-center justify-center">
            {exerciseType === EXERCISE_TYPE.bodyweightOnly ? (
              <ReadOnlyInput>
                {set.bodyweight || <span className="text-base-300">-</span>}
              </ReadOnlyInput>
            ) : set.setType === SET_TYPE['myorep-match'] ? (
              <ReadOnlyInput>
                {weightInputText || <span className="text-base-300">-</span>}
              </ReadOnlyInput>
            ) : (
              <div className="relative flex w-full items-center justify-center">
                <SetInput
                  setId={set.id}
                  setStatus={set.status}
                  inputType={SET_INPUTS.weight}
                  placeholder={UNIT_DISPLAY.plural[set.unit]}
                  value={weightInputText}
                  onChange={handleWeightChange}
                  onBlur={handleWeightBlur}
                  showPing={showWeightIndicator}
                  error={!!weightError}
                />
              </div>
            )}
          </div>

          <div className="col-span-3 flex items-center justify-center">
            <div className="relative flex w-full items-center justify-center">
              {set.setType === SET_TYPE['myorep-match'] ? (
                <ReadOnlyInput>
                  {set.status === STATUSES.set.skipped ? (
                    'n/a'
                  ) : set.repsTarget > 0 ? (
                    <span
                      className={
                        isNum(relatedSet?.reps) && relatedSet?.reps >= 0
                          ? ''
                          : 'text-base-300 dark:text-base-content/50'
                      }
                    >
                      {set.repsTarget}
                    </span>
                  ) : (
                    <span className="text-base-300">-</span>
                  )}
                  <SetBadge>MM</SetBadge>
                </ReadOnlyInput>
              ) : (
                <SetInput
                  setId={set.id}
                  setStatus={set.status}
                  inputType={SET_INPUTS.reps}
                  placeholder={repsPlaceholder}
                  value={repsInputText}
                  onChange={handleRepsChange}
                  onBlur={handleRepsBlur}
                  showPing={showRepsIndicator}
                  error={!!repsError}
                >
                  {set.setType === SET_TYPE.myorep && !showRepsIndicator && <SetBadge>M</SetBadge>}
                </SetInput>
              )}
            </div>
          </div>

          <div className="col-span-1 flex items-center justify-center pr-1">
            {updateSet.isWorking ? (
              <CircleNotch
                size={22}
                className="animate-spin text-base-300 dark:text-base-content"
              />
            ) : (
              <Porn
                finishedAt={set.finishedAt}
                reps={set.reps}
                repsTarget={set.repsTarget}
                status={set.status}
              />
            )}
          </div>

          <div className="col-span-1 flex items-center justify-end">
            <LogButton
              firstUnfinishedSetIndex={firstUnfinishedSetIndex}
              isLastFinished={isLastFinished}
              isWorking={updateFinished.isWorking}
              localReps={getRepsFromInputText(repsInputText)}
              localWeight={getWeightFromInputText(weightInputText, exerciseType, set.bodyweight)}
              onFinish={handleFinishSet}
              onReset={handleReset}
              set={set}
              showIndicator={showSaveIndicator}
              weightError={weightError}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <Chinfo
          bodyweight={set.bodyweight}
          exerciseType={exerciseType}
          repsError={repsError}
          repsTarget={set.repsTarget}
          setId={set.id}
          unit={set.unit}
          weight={set.weight}
          weightError={weightError}
          weightTargetMax={set.weightTargetMax}
          weightTargetMin={set.weightTargetMin}
        />
      </div>
    </li>
  );
});

export default Set;

Set.propTypes = {
  allSets: array,
  dayId: number.isRequired,
  dayWeek: number.isRequired,
  dayPosition: number.isRequired,
  dayFinishedAt: string,
  dayStatus: string.isRequired,
  dayExerciseId: number.isRequired,
  dayExerciseStatus: string.isRequired,
  dayExercisePosition: number.isRequired,
  exerciseId: number.isRequired,
  firstUnfinishedSetIndex: number.isRequired,
  mesoUnit: string.isRequired,
  set: object.isRequired,
  setIsAddingSet: func.isRequired,
  setIsDeletingSet: func.isRequired,
  showTutorial: bool.isRequired,
  setsLength: number,
};
