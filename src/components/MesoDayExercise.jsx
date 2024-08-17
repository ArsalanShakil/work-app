import {CircleNotch, DotsThreeVertical, Info, YoutubeLogo} from '@phosphor-icons/react';
import cloneDeep from 'lodash.clonedeep';
import {bool, func, object, string} from 'prop-types';
import {Fragment, memo, useCallback, useMemo, useState} from 'react';

import common from '../../../../config/common.json5';
import {ErrorWithExtraData} from '../../../../lib/errors.mjs';
import events from '../../../../lib/events/index.mjs';
import {
  EXERCISE_TYPE,
  MG_PROGRESSION_TYPES,
  SKIPPED_SET_REPS,
  STATUSES,
} from '../../../../lib/training/constants.mjs';
import {getRequiresBodyweight, isBlockedDeloadWorkout} from '../../../../lib/training/utils.mjs';
import {useCreateSet, useUpdateDay} from '../api.js';
import {useConfirmation} from '../ConfirmationContext.jsx';
import {DIALOG_CONFIGS, LS_KEY_WORKOUT_TUTORIAL_SEEN} from '../constants.js';
import {useExercisesById, useMesoDay, useMutationCallback} from '../utils/hooks.js';
import {getFirstDayInProgress} from '../utils/index.js';
import {runAfterAnimations} from '../utils/misc.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import ExerciseNote from './ExerciseNote.jsx';
import JointPainFeedbackDialog from './JointPainFeedbackDialog.jsx';
import Set from './meso-day-exercise-set/Set.jsx';
import MesoDayExerciseMenu from './MesoDayExerciseMenu.jsx';
import MesoDayExerciseMessenger from './MesoDayExerciseMessenger.jsx';
import MesoDayExerciseReplace from './MesoDayExerciseReplace.jsx';
import MesoDayExerciseTypeLabel from './MesoDayExerciseTypeLabel.jsx';
import MesoDayMuscleGroupButton from './MesoDayMuscleGroupButton.jsx';
import MoveDayExerciseDialog from './MoveDayExerciseDialog.jsx';
import Centered from './ui/Centered.jsx';
import Dialog from './ui/Dialog.jsx';
import IconButton from './ui/IconButton.jsx';
import Loading from './ui/Loading.jsx';
import SecondaryBadge from './ui/SecondaryBadge.jsx';
import SheetDialog from './ui/SheetDialog.jsx';
import Video from './Video.jsx';

function MessageButton({message, onClick}) {
  return (
    <Centered>
      <button className="btn btn-accent gap-2 shadow-md" onClick={onClick}>
        <Info size={20} className="text-accent-content" />
        <span className="text-accent-content">{message}</span>
      </button>
    </Centered>
  );
}

MessageButton.propTypes = {
  message: string.isRequired,
  onClick: func.isRequired,
};

const MesoDayExercise = memo(function MesoDayExercise({
  dayExercise,
  hasUserDismissed,
  onClickMuscleGroup,
  onOpenRequiredFeedback,
  requiredFeedbackData,
}) {
  const {meso, day} = useMesoDay();
  const exercisesById = useExercisesById();
  const {confirmation} = useConfirmation();

  const dmgForDex = useMemo(
    () => day.muscleGroups.find(mg => mg.muscleGroupId === dayExercise.muscleGroupId),
    [day.muscleGroups, dayExercise.muscleGroupId]
  );
  const {empty, ready} = STATUSES.exercise;
  const exercise = exercisesById[dayExercise.exerciseId];

  const [replaceOpen, setReplaceOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [jointPainOpen, setJoinPainOpen] = useState(false);
  const [shouldAddNote, setShouldAddNote] = useState(false);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [isDeletingSet, setIsDeletingSet] = useState(false);
  const [moveExerciseOpen, setMoveExerciseOpen] = useState(false);
  const [moveExerciseDirection, setMoveExerciseDirection] = useState('');

  const isDesktop = useLocalStore(st => st.isDesktop);
  const setReadynessDialogOpen = useLocalStore(st => st.setReadynessDialogOpen);
  const setRepsInfoOpen = useLocalStore(st => st.setRepsInfoOpen);

  const addSet = useCreateSet({dayId: day.id, dayExerciseId: dayExercise.id, mesoKey: meso.key});
  const skipExercise = useUpdateDay(day.id, {meta: {action: 'skipExercise'}});

  const exerciseType = exercise?.exerciseType;
  const someSetsDone = dayExercise.sets.some(ex => !!ex.finishedAt);

  const nextExerciseFromSameMuscleGroup =
    day.exercises[dayExercise.position + 1]?.muscleGroupId === dayExercise.muscleGroupId;

  const targetWeightLabel =
    exerciseType === EXERCISE_TYPE.bodyweightOnly
      ? 'weight'
      : exerciseType === EXERCISE_TYPE.bodyweightLoadable
      ? '+weight'
      : exerciseType === EXERCISE_TYPE.machineAssistance
      ? 'assistance'
      : 'weight';

  const missingBodyweight =
    dayExercise.status === ready && !day.bodyweight && getRequiresBodyweight(exerciseType);

  const dayInProgress = useMemo(() => getFirstDayInProgress(meso), [meso]);

  const showAnotherDayInProgress = dayInProgress && dayInProgress.id !== day.id;

  const isFirstDexercise = day.week === 0 && day.position === 0 && dayExercise.position === 0;

  const tutorialBlocked =
    missingBodyweight || showAnotherDayInProgress || storage.getItem(LS_KEY_WORKOUT_TUTORIAL_SEEN);

  const showTutorial = isFirstDexercise && !tutorialBlocked;

  const requiredFeedbackDmg = requiredFeedbackData?.dayMuscleGroup;
  const isSameDmgAsRequired = requiredFeedbackDmg?.id === dmgForDex.id;
  const dexRequired = requiredFeedbackData?.needsJointPainDex?.id === dayExercise.id;
  const isCurrentDmgRequired =
    !dexRequired &&
    isSameDmgAsRequired &&
    (requiredFeedbackData?.needsPump ||
      requiredFeedbackData?.needsSoreness ||
      requiredFeedbackData?.needsWorkload);

  const shouldShowFeedbackButton =
    hasUserDismissed && (isCurrentDmgRequired || dexRequired) && dayExercise.sets.length > 0;

  const maskSets =
    missingBodyweight ||
    requiredFeedbackDmg ||
    (showAnotherDayInProgress && !day.finishedAt) ||
    day.status === STATUSES.day.pending ||
    isAddingSet ||
    isDeletingSet ||
    isBlockedDeloadWorkout(day, meso);

  const firstUnfinishedSetIndex = useMemo(
    () => dayExercise.sets.findIndex(s => !s.finishedAt),
    [dayExercise.sets]
  );

  const handleSkipExercise = useMutationCallback(async () => {
    const shouldContinue = await confirmation(DIALOG_CONFIGS.endExercise);
    if (!shouldContinue) {
      return;
    }

    const newExercises = cloneDeep(day.exercises);
    const newExercise = newExercises[dayExercise.position];

    for (const set of newExercise.sets) {
      if (!set.finishedAt) {
        set.reps = SKIPPED_SET_REPS;
        set.finishedAt = new Date().toISOString();
      }
    }

    skipExercise.mutate(
      {...day, exercises: newExercises},
      {
        onSuccess: updatedMeso => {
          events.track({
            mesoKey: updatedMeso.key,
            type: common.eventTypes.wexEnded,
            wexId: dayExercise.id,
            position: dayExercise.position,
            dayId: day.id,
            exerciseId: dayExercise.exerciseId,
            mgId: dayExercise.muscleGroupId,
          });
        },
      }
    );
  }, [confirmation, day, dayExercise, skipExercise]);

  const handleAddSet = useMutationCallback(() => {
    if (!dayExercise.id) {
      throw new ErrorWithExtraData('Somehow trying to add set to dex with null id', {
        dayExercise,
        dayMuscleGroup: dmgForDex,
        setIsAddingSet,
        setJoinPainOpen,
        setMoveExerciseDirection,
        setMoveExerciseOpen,
        setReplaceOpen,
        setShouldAddNote,
      });
    }

    setIsAddingSet(true);
    addSet.mutate(
      {position: dayExercise.sets.length},
      {
        onSuccess: updatedMeso => {
          const wex =
            updatedMeso.weeks[day.week].days[day.position].exercises[dayExercise.position];

          events.track({
            mesoKey: updatedMeso.key,
            type: common.eventTypes.setAdded,
            totalSets: wex.sets.length,
            wexId: dayExercise.id,
          });
        },
        onSettled: () => runAfterAnimations(() => setIsAddingSet(false)),
      }
    );
  }, [addSet, day.position, day.week, dayExercise, dmgForDex]);

  const handleMoveUp = useCallback(() => {
    setMoveExerciseDirection('up');
    setMoveExerciseOpen(true);
  }, [setMoveExerciseDirection, setMoveExerciseOpen]);

  const handleMoveDown = useCallback(() => {
    setMoveExerciseDirection('down');
    setMoveExerciseOpen(true);
  }, [setMoveExerciseDirection, setMoveExerciseOpen]);

  const handleOpenReplace = useCallback(async () => {
    if (someSetsDone) {
      const shouldContinue = await confirmation(DIALOG_CONFIGS.setsWillResetWarning);
      if (!shouldContinue) {
        return;
      }
    }

    setReplaceOpen(true);
  }, [confirmation, setReplaceOpen, someSetsDone]);

  const handleMoveClose = useCallback(() => {
    setMoveExerciseOpen(false);

    runAfterAnimations(() => {
      setMoveExerciseDirection('');
    });
  }, []);

  if (!exercise || !dayExercise) {
    return <Loading />;
  }

  return (
    <div
      className={`bg-base-100 pb-2 pt-4 shadow-sm dark:bg-base-200 ${
        nextExerciseFromSameMuscleGroup
          ? 'mb-0 border-b border-base-200 dark:border-base-300/40'
          : 'mb-4'
      }`}
    >
      {/* Header */}
      <div className="px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex w-full items-center gap-4">
            <MesoDayMuscleGroupButton
              disabled={!!requiredFeedbackDmg}
              dayMuscleGroup={dmgForDex}
              onClick={onClickMuscleGroup}
              className="justify-start"
            />
            {meso.progressions[exercise?.muscleGroupId]?.mgProgressionType ===
              MG_PROGRESSION_TYPES.slow && <SecondaryBadge />}
          </div>
          <div className="flex items-center gap-4">
            {exercise?.youtubeId && (
              <IconButton
                title="See video"
                icon={<YoutubeLogo />}
                onClick={() => setVideoOpen(true)}
              />
            )}

            <IconButton title="Exercise" icon={<DotsThreeVertical weight="bold" />}>
              <MesoDayExerciseMenu
                dayExercise={dayExercise}
                dayMuscleGroup={dmgForDex}
                handleAddSet={handleAddSet}
                handleMoveDown={handleMoveDown}
                handleMoveUp={handleMoveUp}
                handleOpenReplace={handleOpenReplace}
                handleSkipExercise={handleSkipExercise}
                setIsAddingSet={setIsAddingSet}
                setJoinPainOpen={setJoinPainOpen}
                setShouldAddNote={setShouldAddNote}
              />
            </IconButton>
          </div>
        </div>

        <h3 className="mt-3 line-clamp-2 font-medium leading-5 text-base-content">
          {exercise?.name}
        </h3>
        <MesoDayExerciseTypeLabel
          exercise={exercise}
          bodyweight={day.bodyweight}
          unit={meso.unit}
        />
      </div>

      {/* Notes */}
      <div className="px-4">
        <div className={exercise?.notes.length ? 'mt-2' : ''}>
          <div className="divide-y divide-base-200 dark:divide-base-100">
            {exercise?.notes
              .filter(
                exerciseNote =>
                  !exerciseNote.dayExerciseId || exerciseNote.dayExerciseId === dayExercise.id
              )
              .map(exerciseNote => (
                <ExerciseNote
                  key={`exercise-note-${exerciseNote.id}`}
                  dayExercise={dayExercise}
                  exercise={exercise}
                  exerciseNote={exerciseNote}
                />
              ))}
          </div>
          {/* New Note */}
          <ExerciseNote
            dayExercise={dayExercise}
            exercise={exercise}
            isNewNoteOpen={shouldAddNote}
            onNewNoteClose={() => setShouldAddNote(false)}
          />
        </div>
      </div>

      <MesoDayExerciseMessenger
        dex={dayExercise}
        dmg={dmgForDex}
        hidden={!!requiredFeedbackDmg}
        isDesktop={isDesktop}
        showTutorial={showTutorial}
      />

      {/* Sets section */}
      <div className="relative mt-2">
        {/* Sets grid */}
        {dayExercise.status !== empty && (
          <>
            <div className="ml-4 flex items-center">
              {/* Menu col */}
              <div className="h-[32px] w-[32px] shrink-0" />
              <div className="grid w-full grid-cols-8 pr-4">
                {/* Weight col */}
                <div className="col-span-3 text-center text-sm font-medium uppercase">
                  {targetWeightLabel}
                </div>

                {/* Reps col */}
                <div className="col-span-3 flex items-center justify-center gap-1 text-sm font-medium uppercase">
                  reps <Info size={17} onClick={() => setRepsInfoOpen(true)} />
                </div>

                {/* PORNs */}
                <div className="col-span-1" />

                {/* Save button */}
                <div className="col-span-1 flex items-center justify-end pr-1 text-sm font-medium uppercase">
                  Log
                </div>
              </div>
            </div>

            <ol className="divide-y divide-base-200/80 dark:divide-base-300/40">
              {dayExercise.sets.map(set => (
                <Set
                  allSets={dayExercise.sets}
                  dayExerciseId={dayExercise.id}
                  dayExerciseStatus={dayExercise.status}
                  dayExercisePosition={dayExercise.position}
                  dayId={day.id}
                  dayWeek={day.week}
                  dayPosition={day.position}
                  dayFinishedAt={day.finishedAt}
                  dayStatus={day.status}
                  exerciseId={dayExercise.exerciseId}
                  firstUnfinishedSetIndex={firstUnfinishedSetIndex}
                  key={set.id}
                  set={set}
                  setIsAddingSet={setIsAddingSet}
                  setIsDeletingSet={setIsDeletingSet}
                  setsLength={dayExercise.sets.length}
                  showTutorial={showTutorial}
                  mesoUnit={meso.unit}
                />
              ))}
            </ol>
          </>
        )}

        {/* Translucent backdrop for masking the sets */}
        {maskSets && <div className="absolute inset-0 bg-base-100 opacity-50 dark:bg-base-200" />}

        {shouldShowFeedbackButton && (
          <MessageButton message="Your feedback is required" onClick={onOpenRequiredFeedback} />
        )}

        {missingBodyweight && !showAnotherDayInProgress && (
          <MessageButton
            message="Enter bodyweight to begin"
            onClick={() => setReadynessDialogOpen(true)}
          />
        )}

        {(isAddingSet || isDeletingSet) && !missingBodyweight && (
          <Centered>
            <div className="flex items-center bg-base-200 px-4 py-2 shadow-md">
              <CircleNotch className="mr-3 animate-spin text-base-content" />
              <p className="text-base-content">
                {isAddingSet ? 'Adding set...' : 'Removing set...'}
              </p>
            </div>
          </Centered>
        )}
      </div>

      {/* Dialogs */}
      <Dialog isOpen={videoOpen} onClose={() => setVideoOpen(false)} size="lg">
        <div className="flex items-center justify-center bg-black">
          <Video id={exercise?.youtubeId} onClose={() => setVideoOpen(false)} />
        </div>
      </Dialog>

      <JointPainFeedbackDialog
        pain={dayExercise.jointPain}
        isOpen={jointPainOpen}
        day={day}
        exercise={dayExercise}
        onClose={() => setJoinPainOpen(false)}
        exerciseName={exercise?.name}
      />

      <SheetDialog isOpen={replaceOpen} onClose={() => setReplaceOpen(false)}>
        <MesoDayExerciseReplace dayExercise={dayExercise} onClose={() => setReplaceOpen(false)} />
      </SheetDialog>

      <Dialog
        isOpen={moveExerciseOpen}
        onClose={handleMoveClose}
        title={`Move Exercise ${moveExerciseDirection}`}
      >
        <MoveDayExerciseDialog
          dayExercise={dayExercise}
          direction={moveExerciseDirection}
          onClose={handleMoveClose}
        />
      </Dialog>
    </div>
  );
});

export default MesoDayExercise;

MesoDayExercise.propTypes = {
  dayExercise: object.isRequired,
  hasUserDismissed: bool.isRequired,
  onClickMuscleGroup: func.isRequired,
  onOpenRequiredFeedback: func.isRequired,
  requiredFeedbackData: object,
};
