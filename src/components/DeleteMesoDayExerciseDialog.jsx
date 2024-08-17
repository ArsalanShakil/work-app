import {useCallback, useMemo} from 'react';
import {useParams} from 'react-router-dom';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {useDeleteDayExercise} from '../api.js';
import {useExercisesById, useMesoDay, useMutationCallback} from '../utils/hooks.js';
import useLocalStore from '../utils/useLocalStore.js';
import ConfirmDialog from './ui/ConfirmDialog.jsx';

export default function DeleteMesoDayExerciseDialog() {
  const {day} = useMesoDay();
  const {mesoKey} = useParams();
  const exercisesById = useExercisesById();

  const dayExerciseIdToDelete = useLocalStore(st => st.dayExerciseIdToDelete);
  const setDayExerciseIdToDelete = useLocalStore(st => st.setDayExerciseIdToDelete);

  const {exerciseName, exerciseId, position, mgId} = useMemo(() => {
    if (dayExerciseIdToDelete) {
      const dex = day.exercises.find(dex => dex.id === dayExerciseIdToDelete);

      return {
        exerciseName: exercisesById[dex.exerciseId].name,
        exerciseId: dex.exerciseId,
        position: dex.position,
        mgId: dex.muscleGroupId,
      };
    }
    return {};
  }, [day.exercises, dayExerciseIdToDelete, exercisesById]);

  const deleteDayExercise = useDeleteDayExercise(day.id, dayExerciseIdToDelete);

  const handleClose = useCallback(() => setDayExerciseIdToDelete(null), [setDayExerciseIdToDelete]);

  const handleDeleteExercise = useMutationCallback(() => {
    deleteDayExercise.mutate(null, {
      onSuccess: () => {
        setDayExerciseIdToDelete(null);
        events.track({
          mesoKey,
          type: common.eventTypes.wexDeleted,
          dayId: day.id,
          wexId: dayExerciseIdToDelete,
          position,
          exerciseId,
          mgId,
        });
      },
    });
  }, [
    day.id,
    dayExerciseIdToDelete,
    deleteDayExercise,
    exerciseId,
    mesoKey,
    mgId,
    position,
    setDayExerciseIdToDelete,
  ]);

  return (
    <ConfirmDialog
      title="Delete exercise?"
      isOpen={!!dayExerciseIdToDelete}
      onClose={handleClose}
      onConfirm={handleDeleteExercise}
      isLoading={deleteDayExercise.isWorking}
      description={`Are you sure you want to delete ${exerciseName} from your workout?`}
      message="Deleting an exercise from your workout will delete all of its sets, even if you've already completed them."
      variant="error"
    />
  );
}
