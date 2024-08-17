import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {useNavigate, useParams} from 'react-router-dom';

import common from '../../../../config/common.json5';
import {ErrorWithExtraData} from '../../../../lib/errors.mjs';
import events from '../../../../lib/events/index.mjs';
import {
  STATUSES,
  STATUSES_FINISHED,
  TRAINING_EVENTS,
  TRAINING_USER_ATTRIBUTES,
} from '../../../../lib/training/constants.mjs';
import {getFeedbackData} from '../../../../lib/training/utils.mjs';
import {
  useTrackEvent,
  useUpdateDay,
  useUpdateMeso,
  useUpdateMesoProgressions,
  useUserProfile,
} from '../api.js';
import {MOBILE_HEADER_PORTAL_NODE} from '../constants.js';
import {useExercisesById, useMesoDay, useMutationCallback} from '../utils/hooks.js';
import {
  dayExerciseRequiresBodyweight,
  getFirstDayInProgress,
  setTheDomStatusBarColor,
} from '../utils/index.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import DeleteMesoDayExerciseDialog from './DeleteMesoDayExerciseDialog.jsx';
import MesoDayAccumRequiredDialog from './dialogs/MesoDayAccumRequiredDialog.jsx';
import MesoDayBodyweightDialog from './dialogs/MesoDayBodyweightDialog.jsx';
import MesoDayFeedbackDialog from './dialogs/MesoDayFeedbackDialog.jsx';
import MesoSummaryDialog from './dialogs/MesoSummaryDialog.jsx';
import SetTypeDialog from './dialogs/SetTypeDialog.jsx';
import MesoDayAddExercise from './MesoDayAddExercise.jsx';
import MesoDayExercise from './MesoDayExercise.jsx';
import MesoDayHeader from './MesoDayHeader.jsx';
import {PostMesoDialog} from './PostMesoDialog.jsx';
import PostWorkoutDialog from './PostWorkoutDialog.jsx';
import ProgressionsDialog from './ProgressionsDialog.jsx';
import RenameMesoModal from './RenameMesoModal.jsx';
import RepsInfoDialog from './RepsInfoDialog.jsx';
import RestDialog from './RestDialog.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';
import Page from './ui/Page.jsx';
import SheetDialog from './ui/SheetDialog.jsx';
import WarmupDialog from './WarmupDialog.jsx';

const MesoDay = () => {
  const {mesoKey, week, day: dayParam} = useParams();
  const {data: user} = useUserProfile();
  const exercisesById = useExercisesById();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();
  const {meso, day} = useMesoDay();

  const isDesktop = useLocalStore(st => st.isDesktop);
  const theme = useLocalStore(st => st.theme);
  const isFeedbackOpen = useLocalStore(st => st.isFeedbackOpen);
  const setIsFeedbackOpen = useLocalStore(st => st.setIsFeedbackOpen);
  const endMesoOpen = useLocalStore(st => st.endMesoOpen);
  const setEndMesoOpen = useLocalStore(st => st.setEndMesoOpen);
  const setIsMesoSummaryOpen = useLocalStore(st => st.setIsMesoSummaryOpen);
  const setFirstExerciseCompletedAt = useLocalStore(st => st.setFirstExerciseCompletedAt);
  const firstMicroCompletedAt = useLocalStore(st => st.firstMicroCompletedAt);
  const setFirstMicroCompletedAt = useLocalStore(st => st.setFirstMicroCompletedAt);
  const setFirstSetCompletedAt = useLocalStore(st => st.setFirstSetCompletedAt);
  const isFinishWorkoutDialogOpen = useLocalStore(st => st.isFinishWorkoutDialogOpen);
  const setIsFinishWorkoutDialogOpen = useLocalStore(st => st.setIsFinishWorkoutDialogOpen);
  const setIsFinishMesoDialogOpen = useLocalStore(st => st.setIsFinishMesoDialogOpen);

  const finishWorkout = useUpdateDay(day.id, {meta: {action: 'finishWorkout'}});
  const finishMeso = useUpdateMeso(mesoKey, {meta: {action: 'finishMeso'}});
  const updateProgressions = useUpdateMesoProgressions(meso.key);

  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [progressionsOpen, setProgressionsOpen] = useState(false);
  const [hasUserDismissed, setHasUserDismissed] = useState(false);
  const [renameMesoOpen, setRenameMesoOpen] = useState(false);

  const shouldShowFinishMesoButton =
    meso.status === STATUSES.meso.pendingConfirmation && !isFinishWorkoutDialogOpen;
  const shouldShowFinishWorkoutButton =
    day.status === STATUSES.day.pendingConfirmation && !isFinishWorkoutDialogOpen;
  const isInMeso = Array.isArray(meso.weeks);

  const dayInProgress = useMemo(() => {
    if (!isInMeso) {
      return false;
    }
    return getFirstDayInProgress(meso);
  }, [isInMeso, meso]);

  const isSameDay =
    dayInProgress &&
    dayInProgress.week + 1 === Number(week) &&
    dayInProgress.position + 1 === Number(dayParam);

  const handleEndMesoClose = useMutationCallback(() => {
    setEndMesoOpen(false);
  }, [setEndMesoOpen]);

  const handleLink = useCallback(() => {
    if (!isInMeso || !dayInProgress) {
      return;
    }
    setEndMesoOpen(false);
    navigate(
      `/mesocycles/${meso.key}/weeks/${dayInProgress.week + 1}/days/${dayInProgress.position + 1}`
    );
  }, [dayInProgress, isInMeso, meso.key, navigate, setEndMesoOpen]);

  const handleMesoCompleteEvents = useCallback(
    (updatedMeso, ended) => {
      const dayStatusCount = {};

      for (const week of updatedMeso.weeks) {
        for (const day of week.days) {
          if (!dayStatusCount[day.status]) {
            dayStatusCount[day.status] = 1;
          } else {
            dayStatusCount[day.status] += 1;
          }
        }
      }

      const mesoEvent = {
        mesoKey: updatedMeso.key,
        type: ended ? common.eventTypes.mesoEnded : common.eventTypes.mesoFinished,
        status: updatedMeso.status,
        dayStatusCount,
      };

      if (!user.attributes[TRAINING_USER_ATTRIBUTES.TRAINING_MESO_FIRST_FINISHED_AT]) {
        mesoEvent.usersFirst = true;
      }

      events.track(mesoEvent);

      trackEvent.mutate({
        event: TRAINING_EVENTS.TRAINING_MESO_FINISHED_AT,
        at: new Date().toISOString(),
        mesoKey,
      });
    },
    [mesoKey, trackEvent, user.attributes]
  );

  const handleFinishMeso = useMutationCallback(
    ended => {
      finishMeso.mutate(
        {finishedAt: new Date().toISOString()},
        {
          onSuccess: updatedMeso => {
            handleMesoCompleteEvents(updatedMeso, ended);

            runAfterAnimations(() => {
              setIsFinishWorkoutDialogOpen(false);
              setTimeout(() => {
                setIsFinishMesoDialogOpen(true);
              }, 1000);
            });
          },
        }
      );
    },
    [finishMeso, handleMesoCompleteEvents, setIsFinishMesoDialogOpen, setIsFinishWorkoutDialogOpen]
  );

  const handleFinishWorkout = useMutationCallback(() => {
    // A day must have a pendingConfirmation status before it can be finished
    if (day.status !== STATUSES.day.pendingConfirmation) {
      throw new ErrorWithExtraData('trying to finish a day that isnt pending confirmation', {
        mesoDay: JSON.parse(JSON.stringify(day)),
      });
    }

    const newDay = {...day};
    newDay.finishedAt = new Date().toISOString();

    finishWorkout.mutate(newDay, {
      onSuccess: updatedMeso => {
        const mesoDays = updatedMeso.weeks.flatMap(w => w.days);

        const completedDays = mesoDays.filter(
          d =>
            d.finishedAt &&
            (d.status === STATUSES.day.complete || d.status === STATUSES.day.partial)
        );

        const newDate = new Date();

        const workout = updatedMeso.weeks[day.week].days[day.position];
        const workoutEvent = {
          mesoKey: updatedMeso.key,
          type: common.eventTypes.workoutFinished,
          status: workout.status,
          workoutId: workout.id,
          week: workout.week,
          position: workout.position,
          atMs: newDate.getTime(),
        };

        // Advance the date by one millisecond
        newDate.setMilliseconds(newDate.getMilliseconds() + 1);

        if (completedDays.length === 1) {
          workoutEvent.mesoFirst = true;
        }

        events.track(workoutEvent);

        // Check for micro complete
        const week = updatedMeso.weeks[day.week];
        const microComplete = week.days.every(day => STATUSES_FINISHED.day.includes(day.status));

        if (microComplete) {
          const microEvent = {
            mesoKey: updatedMeso.key,
            type: common.eventTypes.microFinished,
            week: day.week,
            atMs: newDate.getTime(),
            dayStatusCount: {},
          };

          if (day.week === meso.weeks.length - 2) {
            microEvent.peak = true;
          }

          if (day.week === meso.weeks.length - 1) {
            microEvent.deload = true;
          }

          if (!firstMicroCompletedAt && updatedMeso.firstMicroCompletedAt) {
            microEvent.mesoFirst = true;
          }

          for (const day of week.days) {
            if (!microEvent.dayStatusCount[day.status]) {
              microEvent.dayStatusCount[day.status] = 1;
            } else {
              microEvent.dayStatusCount[day.status] += 1;
            }
          }

          events.track(microEvent);
          setFirstMicroCompletedAt(updatedMeso.firstMicroCompletedAt);
        }

        trackEvent.mutate({
          event: TRAINING_EVENTS.TRAINING_DAY_FINISHED_AT,
          at: new Date().toISOString(),
          mesoKey: meso.key,
          dayId: newDay.id,
        });

        runAfterAnimations(() => setIsFinishWorkoutDialogOpen(true));
      },
    });
  }, [
    day,
    finishWorkout,
    firstMicroCompletedAt,
    meso.key,
    meso.weeks.length,
    setFirstMicroCompletedAt,
    setIsFinishWorkoutDialogOpen,
    trackEvent,
  ]);

  // TODO: See if we can do away with this
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  const [feedbackDialogData, setFeedbackDialogData] = useState(null);

  // DayExercises that require bodyweight
  const bodyweightDexes = useMemo(
    () =>
      day.exercises?.filter(
        dayExercise => dayExerciseRequiresBodyweight(dayExercise, exercisesById) && dayExercise
      ),
    [day?.exercises, exercisesById]
  );

  const hasCompletedBodyweightSets = useMemo(() => {
    return !!bodyweightDexes.find(
      ex =>
        STATUSES_FINISHED.exercise.includes(ex.status) || ex.status === STATUSES.exercise.started
    );
  }, [bodyweightDexes]);

  // We always have a reference to a muscle group that requires feedback.
  const requiredFeedbackData = useMemo(() => {
    return !day.finishedAt ? getFeedbackData(day) : null;
  }, [day]);

  const handleOpenRequiredFeedback = useCallback(() => {
    setFeedbackDialogData(requiredFeedbackData);
    setIsFeedbackOpen(true);
  }, [requiredFeedbackData, setIsFeedbackOpen]);

  const handleOpenMuscleGroupOnly = useCallback(
    dmg => {
      setFeedbackDialogData({
        dayMuscleGroup: dmg,
        needsJointPainDex: null,
        needsSoreness: true,
        needsPump: true,
        needsWorkload: true,
      });
      setIsFeedbackOpen(true);
    },
    [setIsFeedbackOpen]
  );

  const handleCloseFeedback = useCallback(
    hasUserDismissed => {
      setHasUserDismissed(hasUserDismissed);
      setIsFeedbackOpen(false);
      runAfterAnimations(() => {
        setFeedbackDialogData(null);
      });
    },
    [setIsFeedbackOpen]
  );

  // Trigger close feedback modal on day change.
  // Must be before the useEffect that opens on day load
  useEffect(() => {
    const feedbackDialogDataDayId = feedbackDialogData?.dayMuscleGroup?.dayId;
    if (feedbackDialogDataDayId && feedbackDialogDataDayId !== day.id) {
      handleCloseFeedback(false);
    }
  }, [day.id, feedbackDialogData, handleCloseFeedback]);

  // Trigger open feedback modal if user hasn't already dismissed it once.
  // Must be after the useEffect that closes the feedback modal on day change
  useEffect(() => {
    if (
      !isFeedbackOpen &&
      !hasUserDismissed &&
      !feedbackDialogData &&
      day.status === STATUSES.day.pendingFeedback
    ) {
      handleOpenRequiredFeedback();
    }
  }, [
    day.status,
    feedbackDialogData,
    handleOpenRequiredFeedback,
    hasUserDismissed,
    isFeedbackOpen,
  ]);

  // Reset user dismissed status if the day states changes away from pending feedback
  useEffect(() => {
    if (day.status !== STATUSES.day.pendingFeedback && hasUserDismissed) {
      setHasUserDismissed(false);
    }
  }, [day.status, hasUserDismissed]);

  // Update meso meta data state whenever the meso.key changes, NOT when any other meso properties change.
  useEffect(() => {
    setFirstExerciseCompletedAt(meso.firstExerciseCompletedAt);
    setFirstMicroCompletedAt(meso.firstMicroCompletedAt);
    setFirstSetCompletedAt(meso.firstSetCompletedAt);

    return () => {
      setFirstExerciseCompletedAt(null);
      setFirstMicroCompletedAt(null);
      setFirstSetCompletedAt(null);
    };
  }, [meso.key]); // eslint-disable-line

  const node = document.getElementById(MOBILE_HEADER_PORTAL_NODE);

  return (
    <Page disablePadding>
      <div className="pb-safe-offset-16">
        {initialized &&
          !!node &&
          !isDesktop &&
          createPortal(
            <MesoDayHeader
              bodyweightDexes={bodyweightDexes}
              setProgressionsOpen={setProgressionsOpen}
              setAddExerciseOpen={setAddExerciseOpen}
              setRenameMesoOpen={setRenameMesoOpen}
            />,
            node
          )}

        {isDesktop && (
          <div className="sticky top-0 z-30 mb-4">
            <MesoDayHeader
              bodyweightDexes={bodyweightDexes}
              setProgressionsOpen={setProgressionsOpen}
              setAddExerciseOpen={setAddExerciseOpen}
              setRenameMesoOpen={setRenameMesoOpen}
            />
          </div>
        )}

        {day.exercises.map(dex => (
          <MesoDayExercise
            key={dex.id}
            dayExercise={dex}
            hasUserDismissed={hasUserDismissed}
            onClickMuscleGroup={handleOpenMuscleGroupOnly}
            onOpenRequiredFeedback={handleOpenRequiredFeedback}
            requiredFeedbackData={requiredFeedbackData}
          />
        ))}

        {shouldShowFinishWorkoutButton && (
          <div className="fixed bottom-0 w-full p-4 standalone:pb-safe-offset-4 desktop:static desktop:flex desktop:justify-end">
            <button
              disabled={finishWorkout.isWorking}
              className="btn btn-accent w-full shadow-xl desktop:-mr-4 desktop:-mt-4 desktop:w-auto"
              onClick={handleFinishWorkout}
            >
              {finishWorkout.isWorking && <span className="loading" />}
              Finish workout
            </button>
          </div>
        )}

        {shouldShowFinishMesoButton && (
          <div className="fixed bottom-0 w-full p-4 standalone:pb-safe-offset-4 desktop:static desktop:flex desktop:justify-end">
            <button
              disabled={finishMeso.isWorking}
              className="btn btn-accent w-full shadow-xl desktop:-mr-4 desktop:-mt-4 desktop:w-auto"
              onClick={() => handleFinishMeso()}
            >
              {finishMeso.isWorking && <span className="loading" />}
              Finish mesocycle
            </button>
          </div>
        )}

        <MesoDayBodyweightDialog hasCompletedBodyweightSets={hasCompletedBodyweightSets} />

        <MesoDayFeedbackDialog
          feedbackDialogData={feedbackDialogData}
          requiredFeedbackData={requiredFeedbackData}
          onClose={handleCloseFeedback}
        />

        <SheetDialog isOpen={addExerciseOpen} onClose={() => setAddExerciseOpen(false)}>
          <MesoDayAddExercise day={day} onClose={() => setAddExerciseOpen(false)} />
        </SheetDialog>

        <DeleteMesoDayExerciseDialog />

        <ProgressionsDialog
          isOpen={progressionsOpen}
          isSaving={updateProgressions.isWorking}
          onClose={() => {
            setTheDomStatusBarColor(theme, false);
            setProgressionsOpen(false);
          }}
          mutation={updateProgressions}
          progressions={meso?.progressions}
        />

        <MesoSummaryDialog />

        <PostWorkoutDialog
          onSummary={() => setIsMesoSummaryOpen(true)}
          handleFinishMeso={handleFinishMeso}
          isWorking={finishMeso.isWorking}
        />

        <PostMesoDialog />
        <WarmupDialog />
        <RestDialog />
        <SetTypeDialog />
        <RepsInfoDialog />
        <MesoDayAccumRequiredDialog />

        <RenameMesoModal
          isOpen={renameMesoOpen}
          onClose={() => setRenameMesoOpen(false)}
          mesoKey={meso.key}
        />

        <ConfirmDialog
          title={dayInProgress ? 'Workout in progress' : 'End mesocycle?'}
          confirmButtonText={dayInProgress ? 'Ok' : 'End meso'}
          isOpen={endMesoOpen}
          onClose={handleEndMesoClose}
          onConfirm={dayInProgress ? handleEndMesoClose : () => handleFinishMeso('ended')}
          variant={dayInProgress ? 'info' : 'error'}
          confirmText={!dayInProgress ? 'end meso' : null}
          message={dayInProgress ? 'A workout is currently in progress' : 'This cannot be undone'}
        >
          {!dayInProgress ? (
            <p>Ending this mesocycle will mark all unfinished days as skipped.</p>
          ) : (
            <div>
              {isSameDay && <p>Please complete your workout before continuing.</p>}
              {!isSameDay && (
                <Fragment>
                  <p>
                    {`Please complete workout week ${dayInProgress.week + 1} day ${
                      dayInProgress.position + 1
                    } before continuing.`}
                  </p>
                  <button onClick={handleLink} className="mt-4 text-primary">
                    Take me there
                  </button>
                </Fragment>
              )}
            </div>
          )}
        </ConfirmDialog>
      </div>
    </Page>
  );
};

export default MesoDay;
