import {DotsThreeVertical} from '@phosphor-icons/react';
import cloneDeep from 'lodash.clonedeep';
import {array, func} from 'prop-types';
import {Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {SKIPPED_SET_REPS} from '../../../../lib/training/constants.mjs';
import {useUpdateDay} from '../api.js';
import {useConfirmation} from '../ConfirmationContext.jsx';
import {DIALOG_CONFIGS} from '../constants.js';
import {useMesoDay, useMutationCallback} from '../utils/hooks.js';
import {setTheDomStatusBarColor} from '../utils/index.js';
import useLocalStore from '../utils/useLocalStore.js';
import MesoNotesDialog from './dialogs/MesoNotesDialog.jsx';
import UpdateMesoDayLabelDialog from './dialogs/UpdateMesoDayLabelDialog.jsx';
import MesoDayMenu from './MesoDayMenu.jsx';
import MesoDayNote from './MesoDayNote.jsx';
import Navigation from './Navigation.jsx';
import CompleteBadge from './ui/CompleteBadge.jsx';
import Expander from './ui/Expander.jsx';
import IconButton from './ui/IconButton.jsx';

export default function MesoDayHeader({
  bodyweightDexes,
  setAddExerciseOpen,
  setProgressionsOpen,
  setRenameMesoOpen,
}) {
  const {week, day: dayParam} = useParams();
  const {meso, day} = useMesoDay();
  const skipDay = useUpdateDay(day.id, {meta: {action: 'skipDay'}});
  const resetDay = useUpdateDay(day.id, {meta: {action: 'resetDay'}});

  const {confirmation} = useConfirmation();
  const progressRef = useRef();

  const theme = useLocalStore(st => st.theme);
  const isDesktop = useLocalStore(st => st.isDesktop);

  const [mesoNotesOpen, setMesoNotesOpen] = useState(false);
  const [progressContainerWidth, setProgressContainerWidth] = useState(0);
  const [renameDayOpen, setRenameDayOpen] = useState(false);
  const [shouldAddNote, setShouldAddNote] = useState(false);

  const handleResize = useCallback(() => {
    if (progressRef.current) {
      const {width} = progressRef.current.getBoundingClientRect();
      setProgressContainerWidth(width);
    }
  }, []);

  const handleSkipDay = useMutationCallback(async () => {
    const shouldContinue = await confirmation(DIALOG_CONFIGS.endWorkout);
    if (!shouldContinue) {
      return;
    }

    const wexercises = cloneDeep(day.exercises);

    for (const wex of wexercises) {
      for (const set of wex.sets) {
        // We need to decide which sets we're finishing vs which ones we're skipping
        // I have a sense that if they have saved reps actual but not "clicked save"
        // then did they really do the set? should we overwrite the reps actual value they chose?
        if (!set.finishedAt) {
          set.reps = SKIPPED_SET_REPS;
          set.finishedAt = new Date().toISOString();
        }
      }
    }

    skipDay.mutate(
      {...day, exercises: wexercises},
      {
        onSuccess: updatedMeso => {
          events.track({
            mesoKey: updatedMeso.key,
            type: common.eventTypes.workoutEnded,
            workoutId: day.id,
            workoutPosition: day.position,
            microPosition: day.week,
          });
        },
      }
    );
  }, [confirmation, day, skipDay]);

  const handleResetDay = useMutationCallback(async () => {
    const shouldContinue = await confirmation(DIALOG_CONFIGS.resetDay);
    if (!shouldContinue) {
      return;
    }

    const newExercises = cloneDeep(day.exercises);
    for (const exercise of newExercises) {
      for (const set of exercise.sets) {
        if (set.finishedAt) {
          set.finishedAt = null;
        }
      }
    }
    resetDay.mutate({...day, exercises: newExercises});
  }, [confirmation, day, resetDay]);

  useLayoutEffect(handleResize, [handleResize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const progressWidth = useMemo(() => {
    const sets = day.exercises.flatMap(dex => dex.sets);

    if (sets.length) {
      const completeSets = sets.filter(set => set.finishedAt);

      return Math.round(progressContainerWidth * (completeSets.length / sets.length));
    }

    return 0;
  }, [day.exercises, progressContainerWidth]);

  return (
    <Fragment>
      <div
        className={`bg-base-100 pt-3 dark:bg-base-200 dark:shadow-2xl ${
          !isDesktop ? 'border-b shadow-sm dark:border-base-100' : 'shadow'
        }`}
      >
        <h2 className="w-5/6 truncate px-4 text-xs uppercase text-base-content/60">{meso.name}</h2>

        <div className="flex items-center justify-between px-4 pb-2 pt-0.5">
          <h2 className="flex items-baseline space-x-1 align-top font-semibold text-base-content">
            <span className="text-sm uppercase md:text-base">Week</span>
            <span className="text-lg desktop:text-xl">{week} </span>
            <span className="text-sm uppercase md:text-base"> Day</span>
            <span className="text-lg md:text-xl">{dayParam} </span>
            <span>{day.label}</span>
          </h2>

          <div className="flex items-center gap-4">
            {day.finishedAt && <CompleteBadge finishedAt={day.finishedAt} />}

            <Navigation meso={meso} />

            <IconButton icon={<DotsThreeVertical weight="bold" />}>
              <MesoDayMenu
                bodyweightDexes={bodyweightDexes}
                handleResetDay={handleResetDay}
                handleSkipDay={handleSkipDay}
                setAddExerciseOpen={setAddExerciseOpen}
                setMesoNotesOpen={setMesoNotesOpen}
                setProgressionsOpen={setProgressionsOpen}
                setRenameDayOpen={setRenameDayOpen}
                setRenameMesoOpen={setRenameMesoOpen}
                setShouldAddNote={setShouldAddNote}
              />
            </IconButton>
          </div>
        </div>

        <div className="px-4">
          <Expander isOpen={!day.notes.length} specificHeight={8} />
          <Expander isOpen={!!day.notes.length} specificHeight={8} />

          <div className="divide-y divide-base-200">
            {day.notes.map(dayNote => (
              <MesoDayNote key={`day-note-${dayNote.id}`} day={day} dayNote={dayNote} />
            ))}
          </div>

          <MesoDayNote
            // This is for a new note
            day={day}
            isNewNoteOpen={shouldAddNote}
            onNewNoteClose={() => setShouldAddNote(false)}
          />

          <Expander isOpen={!!day.notes.length} specificHeight={16} />
        </div>

        <div className="w-full bg-base-100" ref={progressRef}>
          <div
            className="bg-emerald-500 transition-width duration-500 ease-in-out dark:bg-emerald-500"
            style={{width: progressWidth, height: 2}}
          />
        </div>
      </div>

      <UpdateMesoDayLabelDialog isOpen={renameDayOpen} onClose={() => setRenameDayOpen(false)} />

      <MesoNotesDialog
        isOpen={mesoNotesOpen}
        onClose={() => {
          setTheDomStatusBarColor(theme, false);
          setMesoNotesOpen(false);
        }}
      />
    </Fragment>
  );
}

MesoDayHeader.propTypes = {
  bodyweightDexes: array.isRequired,
  setProgressionsOpen: func.isRequired,
  setAddExerciseOpen: func.isRequired,
  setRenameMesoOpen: func.isRequired,
};
