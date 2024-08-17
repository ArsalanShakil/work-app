import {func, object, string} from 'prop-types';
import {Fragment, useState} from 'react';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {useMoveDayExercise} from '../api.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMesoDay, useMutationCallback} from '../utils/hooks.js';
import ExerciseRepeatSwitch from './ExerciseRepeatSwitch.jsx';

export default function MoveDayExerciseDialog({dayExercise, direction, onClose}) {
  const {day} = useMesoDay();
  const [repeat, setRepeat] = useState(true);
  const moveDayExercise = useMoveDayExercise(day.id, dayExercise.id);
  const {showNotification} = useNotifierContext();

  const handleClose = useMutationCallback(() => {
    setRepeat(true);
    onClose();
  }, [onClose]);

  const handleMove = useMutationCallback(() => {
    moveDayExercise.mutate(
      {
        from: dayExercise.position,
        to: direction === 'up' ? dayExercise.position - 1 : dayExercise.position + 1,
        repeat,
      },
      {
        onSuccess: updatedMeso => {
          handleClose();

          events.track({
            dayId: day.id,
            direction,
            mesoKey: updatedMeso.key,
            type: common.eventTypes.wexMoved,
            wexId: dayExercise.id,
            position: dayExercise.position,
          });
          showNotification({
            message: 'Exercise successfully moved!',
            type: 'success',
            autoClose: true,
          });
        },
      }
    );
  }, [day.id, dayExercise, direction, handleClose, moveDayExercise, repeat, showNotification]);

  return (
    <Fragment>
      <p>You can move this exercise {direction} by one position</p>

      <ExerciseRepeatSwitch repeat={repeat} onChange={e => setRepeat(e.target.checked)} />

      <div className="flex justify-end gap-4">
        <button className="btn btn-ghost" onClick={handleClose}>
          Cancel
        </button>

        <button
          className="btn btn-accent"
          disabled={moveDayExercise.isWorking}
          onClick={handleMove}
        >
          {moveDayExercise.isWorking && <span className="loading"></span>}
          Move {direction}
        </button>
      </div>
    </Fragment>
  );
}

MoveDayExerciseDialog.propTypes = {
  dayExercise: object.isRequired,
  direction: string,
  onClose: func.isRequired,
};
