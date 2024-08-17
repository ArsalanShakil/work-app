import {func, object} from 'prop-types';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {useReplaceDayExercise} from '../api.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import ExercisePicker from './exercise-chooser/ExercisePicker.jsx';

export default function MesoDayExerciseReplace({dayExercise, onClose}) {
  const {showNotification} = useNotifierContext();
  const replaceDayExercise = useReplaceDayExercise(dayExercise.dayId, dayExercise.id);

  const handleReplaceExercise = useMutationCallback(
    ({exerciseId, repeat}) => {
      const body = {
        newExerciseId: exerciseId,
        repeat,
      };

      replaceDayExercise.mutate(body, {
        onSuccess: updatedMeso => {
          showNotification({
            message: `Exercise successfully replaced!`,
            type: 'success',
            autoClose: true,
          });

          events.track({
            dayId: dayExercise.dayId,
            mesoKey: updatedMeso.key,
            mgId: dayExercise.muscleGroupId,
            newExerciseId: exerciseId,
            oldExerciseId: dayExercise.exerciseId,
            position: dayExercise.position,
            type: common.eventTypes.wexReplaced,
            wexId: dayExercise.id,
          });

          onClose();
        },
      });
    },
    [dayExercise, onClose, replaceDayExercise, showNotification]
  );

  return (
    <ExercisePicker
      exerciseId={dayExercise.exerciseId} // NEW
      isWorking={replaceDayExercise.isWorking}
      muscleGroupId={dayExercise.muscleGroupId} // NEW
      offerRepeat
      onClose={onClose}
      onSelectExercise={handleReplaceExercise}
    />
  );
}

MesoDayExerciseReplace.propTypes = {
  dayExercise: object.isRequired,
  onClose: func.isRequired,
};
