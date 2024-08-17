import cloneDeep from 'lodash.clonedeep';
import {func, object, string} from 'prop-types';
import {Fragment, memo, useCallback, useEffect, useMemo, useState} from 'react';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {isNum} from '../../../../lib/math.mjs';
import {useUpdateDay} from '../api.js';
import {feedbackTypes} from '../constants.js';
import {
  useExercisesById,
  useMesoDay,
  useMuscleGroupsById,
  useMutationCallback,
} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import FeedbackForm from './FeedbackForm.jsx';
import FeedbackHelp from './FeedbackHelp.jsx';

const MesoDayFeedbackForm = memo(function MesoDayFeedbackForm({
  feedbackDialogData,
  requiredFeedbackData,
  onClose,
  helpType,
  setHelpType,
}) {
  const {day} = useMesoDay();
  const exercisesById = useExercisesById();
  const muscleGroupsById = useMuscleGroupsById();

  const firstExerciseCompletedAt = useLocalStore(st => st.firstExerciseCompletedAt);
  const setFirstExerciseCompletedAt = useLocalStore(st => st.setFirstExerciseCompletedAt);

  // TODO: refactor to separate endpoint
  const saveMgFeedback = useUpdateDay(day.id, {meta: {action: 'saveMgFeedback'}});

  const [localFeedbackData, setLocalFeedbackData] = useState(null);
  const [localRequiredFeedbackData, setLocalRequiredFeedbackData] = useState(null);
  const [localJointPain, setLocalJointPain] = useState('');
  const [localSoreness, setLocalSoreness] = useState('');
  const [localPump, setLocalPump] = useState('');
  const [localWorkload, setLocalWorkload] = useState('');

  const localFeedbackDmg = localFeedbackData?.dayMuscleGroup;
  const localFeedbackMgId = localFeedbackDmg?.muscleGroupId;
  const localFeedbackMgName = muscleGroupsById[localFeedbackMgId]?.name;
  const localFeedbackJointPainDex = localFeedbackData?.needsJointPainDex;
  const localFeedbackExerciseName = exercisesById[localFeedbackJointPainDex?.exerciseId]?.name;

  const isJointPainVisible = localFeedbackData?.needsJointPainDex;
  const isSorenessVisible = localFeedbackData?.needsSoreness;
  const isPumpVisible = localFeedbackData?.needsPump;
  const isWorkloadVisible = localFeedbackData?.needsWorkload;

  const isDmgRequired =
    localFeedbackDmg &&
    localRequiredFeedbackData &&
    localFeedbackDmg.id === localRequiredFeedbackData.dayMuscleGroup.id;

  let isSorenessDisabled = localFeedbackDmg?.soreness === -1;
  let isPumpDisabled = false;
  let isWorkloadDisabled = false;

  if (!isDmgRequired) {
    isSorenessDisabled = !isNum(localFeedbackDmg?.soreness) || localFeedbackDmg.soreness === -1;
    isPumpDisabled = !isNum(localFeedbackDmg?.pump);
    isWorkloadDisabled = !isNum(localFeedbackDmg?.workload);
  }

  const isFormComplete = useMemo(() => {
    if (isJointPainVisible && !isNum(localJointPain)) {
      return false;
    }

    if (isSorenessVisible && !isSorenessDisabled && !isNum(localSoreness)) {
      return false;
    }

    if (isPumpVisible && !isPumpDisabled && !isNum(localPump)) {
      return false;
    }

    if (isWorkloadVisible && !isWorkloadDisabled && !isNum(localWorkload)) {
      return false;
    }

    return true;
  }, [
    isJointPainVisible,
    isPumpDisabled,
    isPumpVisible,
    isSorenessDisabled,
    isSorenessVisible,
    isWorkloadDisabled,
    isWorkloadVisible,
    localJointPain,
    localPump,
    localSoreness,
    localWorkload,
  ]);

  const isFormEmpty =
    !isJointPainVisible && isSorenessDisabled && isPumpDisabled && isWorkloadDisabled;

  const updateLocalFormState = useCallback(({jointPain, soreness, pump, workload}) => {
    setLocalJointPain(isNum(jointPain) ? jointPain : '');
    setLocalSoreness(isNum(soreness) && soreness >= 0 ? soreness : '');
    setLocalPump(isNum(pump) ? pump : '');
    setLocalWorkload(isNum(workload) ? workload : '');
  }, []);

  useEffect(() => {
    setLocalFeedbackData(feedbackDialogData);
    setLocalRequiredFeedbackData(requiredFeedbackData);
    updateLocalFormState({
      pain: feedbackDialogData?.needsJointPainDex?.jointPain,
      soreness: feedbackDialogData?.dayMuscleGroup?.soreness,
      pump: feedbackDialogData?.dayMuscleGroup?.pump,
      workload: feedbackDialogData?.dayMuscleGroup?.workload,
    });
    // Note: We specifically ONLY want to save the requiredFeedbackData when the feedbackDialogData
    //       changes, and not whenever the requiredFeedbackData changes (eg. on day nav change which
    //       would cause this dialog to animate away)
  }, [feedbackDialogData, updateLocalFormState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(
    hasUserDismissed => {
      onClose(hasUserDismissed);
      runAfterAnimations(() => {
        setHelpType(null);
        setLocalFeedbackData(null);
        updateLocalFormState({pump: '', soreness: '', workload: '', pain: ''});
      });
    },
    [onClose, setHelpType, updateLocalFormState]
  );

  const handleSave = useMutationCallback(() => {
    const newExercises = cloneDeep(day.exercises);
    const newMuscleGroups = cloneDeep(day.muscleGroups);
    const savingJointPain =
      isNum(localFeedbackJointPainDex?.position) &&
      localJointPain !== '' &&
      localJointPain !== localFeedbackJointPainDex.jointPain;

    const newGroup = newMuscleGroups.find(mg => mg.id === localFeedbackDmg.id);
    if (isNum(localSoreness) && localSoreness !== localFeedbackDmg.soreness) {
      newGroup.soreness = localSoreness;
    }
    if (isNum(localPump) && localPump !== localFeedbackDmg.pump) {
      newGroup.pump = localPump;
    }
    if (isNum(localWorkload) && localWorkload !== localFeedbackDmg.workload) {
      newGroup.workload = localWorkload;
    }

    if (savingJointPain) {
      newExercises[localFeedbackJointPainDex.position].jointPain = localJointPain;
    }

    saveMgFeedback.mutate(
      {
        ...day,
        exercises: newExercises,
        muscleGroups: newMuscleGroups,
      },
      {
        onSuccess: updatedMeso => {
          if (savingJointPain) {
            // Workout exercise complete event
            const wex =
              updatedMeso.weeks[day.week].days[day.position].exercises[
                localFeedbackJointPainDex.position
              ];

            const wexEvent = {
              pain: localJointPain,
              mesoKey: updatedMeso.key,
              type: common.eventTypes.wexFinished,
              status: wex.status,
              dayId: wex.dayId,
              wexId: wex.id,
              position: wex.position,
              exerciseId: wex.exerciseId,
              mgId: wex.muscleGroupId,
            };

            if (!firstExerciseCompletedAt && updatedMeso.firstExerciseCompletedAt) {
              wexEvent.mesoFirst = true;
            }

            events.track(wexEvent);
            setFirstExerciseCompletedAt(updatedMeso.firstExerciseCompletedAt);
          }

          handleClose(false);
        },
      }
    );
  }, [
    day,
    localFeedbackJointPainDex?.position,
    localFeedbackJointPainDex?.jointPain,
    localJointPain,
    localSoreness,
    localFeedbackDmg?.soreness,
    localFeedbackDmg?.pump,
    localFeedbackDmg?.workload,
    localFeedbackDmg?.id,
    localPump,
    localWorkload,
    saveMgFeedback,
    handleClose,
    firstExerciseCompletedAt,
    setFirstExerciseCompletedAt,
  ]);

  return (
    <Fragment>
      {helpType ? (
        <FeedbackHelp
          subject={localFeedbackMgName}
          muscleGroupId={localFeedbackMgId}
          type={helpType}
          onClickBack={() => setHelpType(null)}
        />
      ) : (
        <Fragment>
          {isJointPainVisible && (
            <FeedbackForm
              exerciseName={localFeedbackExerciseName}
              onChange={setLocalJointPain}
              onClickHelp={() => setHelpType(feedbackTypes.jointPain)}
              value={localJointPain}
              type={feedbackTypes.jointPain}
            />
          )}

          {isSorenessVisible && (
            <FeedbackForm
              disabled={isSorenessDisabled}
              muscleGroupId={localFeedbackMgId}
              onChange={setLocalSoreness}
              onClickHelp={() => setHelpType(feedbackTypes.soreness)}
              value={localSoreness}
              type={feedbackTypes.soreness}
            />
          )}

          {isPumpVisible && (
            <FeedbackForm
              disabled={isPumpDisabled}
              muscleGroupId={localFeedbackMgId}
              onChange={setLocalPump}
              onClickHelp={() => setHelpType(feedbackTypes.pump)}
              value={localPump}
              type={feedbackTypes.pump}
            />
          )}

          {isWorkloadVisible && (
            <FeedbackForm
              disabled={isWorkloadDisabled}
              muscleGroupId={localFeedbackMgId}
              onChange={setLocalWorkload}
              onClickHelp={() => setHelpType(feedbackTypes.workload)}
              value={localWorkload}
              type={feedbackTypes.workload}
            />
          )}
          <div className="flex justify-end space-x-3">
            <button className="btn btn-ghost" onClick={() => handleClose(true)}>
              Cancel
            </button>
            <button
              onClick={isFormEmpty ? () => handleClose(false) : handleSave}
              disabled={!isFormComplete || saveMgFeedback.isWorking}
              className="btn btn-accent"
            >
              {saveMgFeedback.isWorking && <span className="loading"></span>}
              {isFormEmpty ? 'OK' : 'Save'}
            </button>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
});

export default MesoDayFeedbackForm;

MesoDayFeedbackForm.propTypes = {
  feedbackDialogData: object,
  helpType: string,
  onClose: func.isRequired,
  requiredFeedbackData: object,
  setHelpType: func.isRequired,
};
