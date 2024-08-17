import {bool, object} from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';

import {EXERCISE_TYPE, STATUSES} from '../../../../lib/training/constants.mjs';
import {isBlockedDeloadWorkout} from '../../../../lib/training/utils.mjs';
import {LS_KEY_REST_INFO_SEEN, LS_KEY_WARMUP_INFO_SEEN} from '../constants.js';
import {useExercisesById, useMesoDay} from '../utils/hooks.js';
import {getFirstDayInProgress} from '../utils/index.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import Expander from './ui/Expander.jsx';
import Message from './ui/Message.jsx';

export default function MesoDayExerciseMessenger({dex, dmg, hidden, isDesktop, showTutorial}) {
  const firstSet = dex.sets[0];

  const exercisesById = useExercisesById();
  const {meso, day} = useMesoDay();

  const requiresFinishedAccumMicro = isBlockedDeloadWorkout(day, meso);
  const isDeloadLoadWeek = meso.weeks.length - 1 === day.week;
  const dayInProgress = getFirstDayInProgress(meso);

  const showAnotherDayInProgress = dayInProgress && dayInProgress.id !== day.id && !day.finishedAt;

  const [showWarmup, setShowWarmup] = useState(false);
  const [showRest, setShowRest] = useState(false);

  const setIsRestDialogOpen = useLocalStore(st => st.setIsRestDialogOpen);
  const setIsWarmupOpen = useLocalStore(st => st.setIsWarmupOpen);

  const showEnterRepsMessage = useMemo(() => {
    return showTutorial && firstSet?.status === STATUSES.set.pendingReps;
  }, [showTutorial, firstSet?.status]);

  const showSaveSetMessage = useMemo(() => {
    return showTutorial && firstSet?.status === STATUSES.set.ready;
  }, [showTutorial, firstSet?.status]);

  // TODO: Get rid of all these god damn mother fucking use effects
  useEffect(() => {
    if (dex.status === STATUSES.exercise.started && !storage.getItem(LS_KEY_REST_INFO_SEEN)) {
      setShowRest(true);
    } else {
      setShowRest(false);
    }
  }, [dex.status]);

  useEffect(() => {
    if (
      firstSet?.status === STATUSES.set.pendingWeight &&
      exercisesById[dex.exerciseId].exerciseType !== EXERCISE_TYPE.bodyweightOnly &&
      !storage.getItem(LS_KEY_WARMUP_INFO_SEEN)
    ) {
      setShowWarmup(true);
    } else {
      setShowWarmup(false);
    }
  }, [dex.exerciseId, exercisesById, firstSet?.status]);

  // TODO: Turn into a hook
  useEffect(() => {
    function onStorageChange(event) {
      if (event.key === LS_KEY_WARMUP_INFO_SEEN) {
        setShowWarmup(!event.value);
      }
      if (event.key === LS_KEY_REST_INFO_SEEN) {
        setShowRest(!event.value);
      }
    }

    document.addEventListener(storage.storageEventName, onStorageChange);

    return () => document.removeEventListener(storage.storageEventName, onStorageChange);
  }, []);

  if (hidden) {
    return null;
  }

  // Exercise not programmed yet
  if (dmg.status === STATUSES.muscleGroup.unprogrammed) {
    return (
      <div className="px-4 pt-4">
        <Message>Exercise not programmed yet</Message>
      </div>
    );
  }

  // Another day in progress
  else if (showAnotherDayInProgress) {
    return (
      <div className="px-4 pt-4">
        <Message>Another workout is in progress</Message>
      </div>
    );
  }

  // Exercise has no sets
  else if (dex.status === STATUSES.exercise.empty) {
    return (
      <div className="px-4 pt-4">
        <Message>Exercise has no sets programmed</Message>
      </div>
    );
  } else {
    return (
      <div className="px-4">
        <div className={showWarmup && !requiresFinishedAccumMicro ? 'my-2' : ''}>
          <Expander isOpen={showWarmup && !requiresFinishedAccumMicro}>
            <Message variant={showTutorial ? 'ping' : 'info'} onClick={() => setIsWarmupOpen(true)}>
              {`How to ${isDesktop ? 'warmup and ' : ''}choose your ${
                isDeloadLoadWeek ? 'deload' : 'starting'
              } weight`}
            </Message>
          </Expander>
        </div>

        <div className={showEnterRepsMessage ? 'mt-2' : ''}>
          <Expander isOpen={showEnterRepsMessage}>
            <Message variant="ping">Do your reps to target RIR then enter them!</Message>
          </Expander>
        </div>

        <div className={requiresFinishedAccumMicro ? 'mt-2' : ''}>
          <Expander isOpen={requiresFinishedAccumMicro}>
            <Message variant="info">Complete all accumulation workouts before proceeding.</Message>
          </Expander>
        </div>

        <div className={showSaveSetMessage ? 'mt-2' : ''}>
          <Expander isOpen={showSaveSetMessage}>
            <Message variant="ping">Log your set to continue!</Message>
          </Expander>
        </div>

        <div className={showRest ? 'mt-2' : ''}>
          <Expander isOpen={showRest}>
            <Message variant="info" onClick={() => setIsRestDialogOpen(true)}>
              How to rest before your next set
            </Message>
          </Expander>
        </div>
      </div>
    );
  }
}

MesoDayExerciseMessenger.propTypes = {
  dex: object.isRequired,
  dmg: object.isRequired,
  hidden: bool.isRequired,
  isDesktop: bool.isRequired,
  showTutorial: bool.isRequired,
};
