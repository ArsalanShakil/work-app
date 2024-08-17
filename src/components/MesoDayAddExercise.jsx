import {func, object} from 'prop-types';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {useAddDayExercise} from '../api.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import ExercisePicker from './exercise-chooser/ExercisePicker.jsx';

export default function MesoDayAddExercise({day, onClose}) {
  const {showNotification} = useNotifierContext();
  const addDayExercise = useAddDayExercise(day.id, {meta: {action: 'addDayExercise'}});

  const handleAddExercise = useMutationCallback(
    ({exerciseId, repeat}) => {
      const body = {
        exerciseId,
        repeat,
      };

      addDayExercise.mutate(body, {
        onSuccess: updatedMeso => {
          const dayExercises = updatedMeso.weeks[day.week].days[day.position].exercises;
          const addedWex = dayExercises[dayExercises.length - 1];

          showNotification({
            message: `Exercise added!`,
            type: 'success',
            autoClose: true,
          });

          events.track({
            dayId: day.id,
            exerciseId,
            mesoKey: updatedMeso.key,
            mgId: addedWex.muscleGroupId,
            type: common.eventTypes.wexAdded,
            wexId: addedWex.id,
          });

          onClose();
        },
      });
    },
    [addDayExercise, day, onClose, showNotification]
  );

  return (
    <ExercisePicker
      isWorking={addDayExercise.isWorking}
      offerRepeat
      onClose={onClose}
      onSelectExercise={handleAddExercise}
    />
  );
}

MesoDayAddExercise.propTypes = {
  day: object.isRequired,
  onClose: func.isRequired,
};
