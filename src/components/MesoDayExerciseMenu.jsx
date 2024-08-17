import {
  ArrowDown,
  ArrowUp,
  Bandaids,
  Pencil,
  Plus,
  StopCircle,
  Swap,
  Trash,
} from '@phosphor-icons/react';
import {func, object} from 'prop-types';
import {Fragment} from 'react';

import {isNum} from '../../../../lib/math.mjs';
import {STATUSES, STATUSES_FINISHED} from '../../../../lib/training/constants.mjs';
import {isBlockedDeloadWorkout} from '../../../../lib/training/utils.mjs';
import canAddSetWithDayStatus from '../utils/canAddSetWithDayStatus.js';
import {useMesoDay} from '../utils/hooks.js';
import useLocalStore from '../utils/useLocalStore.js';
import {MenuButton} from './ui/MenuItem.jsx';

export default function MesoDayExerciseMenu({
  dayExercise,
  handleAddSet,
  handleMoveDown,
  handleMoveUp,
  handleOpenReplace,
  handleSkipExercise,
  setJoinPainOpen,
  setShouldAddNote,
}) {
  const {meso, day} = useMesoDay();
  const setDayExerciseIdToDelete = useLocalStore(st => st.setDayExerciseIdToDelete);
  const canAddSet = canAddSetWithDayStatus(day.status);
  const exerciseDone = STATUSES_FINISHED.exercise.includes(dayExercise.status);
  const shouldShowJointPain = isNum(dayExercise.jointPain);

  return (
    <Fragment>
      <MenuButton
        onClick={() => setShouldAddNote(true)}
        label="New note"
        icon={<Pencil size={16} />}
      />

      {day.exercises.length > 1 && (
        <Fragment>
          {dayExercise.position > 0 && (
            <MenuButton
              onClick={handleMoveUp}
              label="Move up"
              divider
              icon={<ArrowUp size={16} />}
            />
          )}
          {dayExercise.position + 1 !== day.exercises.length && (
            <MenuButton
              onClick={handleMoveDown}
              label="Move down"
              divider
              icon={<ArrowDown size={16} />}
            />
          )}
        </Fragment>
      )}

      {!day.finishedAt && (
        <MenuButton onClick={handleOpenReplace} label="Replace" divider icon={<Swap size={16} />} />
      )}

      {!exerciseDone &&
        !day.finishedAt &&
        day.status !== STATUSES.day.pending &&
        !isBlockedDeloadWorkout(day, meso) && (
          <MenuButton
            onClick={handleSkipExercise}
            label="End exercise"
            icon={<StopCircle size={16} />}
          />
        )}

      {shouldShowJointPain && (
        <MenuButton
          onClick={() => setJoinPainOpen(true)}
          label="Joint pain"
          divider
          icon={<Bandaids size={16} />}
        />
      )}

      {canAddSet && <MenuButton onClick={handleAddSet} label="Add set" icon={<Plus size={16} />} />}

      {/* TODO: Should we allow deleting exercises that are finished? */}
      {day.exercises.length > 1 && (
        <MenuButton
          onClick={() => setDayExerciseIdToDelete(dayExercise.id)}
          label="Delete exercise"
          divider
          className="text-rose-500 hover:bg-rose-100 disabled:text-rose-300 disabled:hover:bg-rose-50"
          icon={<Trash size={16} />}
        />
      )}
    </Fragment>
  );
}

MesoDayExerciseMenu.propTypes = {
  dayExercise: object.isRequired,
  handleAddSet: func.isRequired,
  handleMoveDown: func.isRequired,
  handleMoveUp: func.isRequired,
  handleOpenReplace: func.isRequired,
  handleSkipExercise: func.isRequired,
  setJoinPainOpen: func.isRequired,
  setShouldAddNote: func.isRequired,
};
