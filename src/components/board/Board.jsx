import {DragDropContext} from '@hello-pangea/dnd';
import {Plus} from '@phosphor-icons/react';
import cloneDeep from 'lodash.clonedeep';
import {object} from 'prop-types';
import {Fragment, useCallback, useMemo, useState} from 'react';

import {
  useActiveExercises,
  useExercisesById,
  useHandleCardChange,
  useHandleNewDayCallback,
} from '../../utils/hooks.js';
import {arrayMove, getFilteredExercises} from '../../utils/index.js';
import {runAfterAnimations} from '../../utils/misc.js';
import useLocalStore from '../../utils/useLocalStore.js';
import CopyMesoDialog from '../CopyMesoDialog.jsx';
import CreateMesoDialog from '../dialogs/CreateMesoDialog.jsx';
import ExercisePicker from '../exercise-chooser/ExercisePicker.jsx';
import MuscleGroupPickerDialog from '../MuscleGroupPickerDialog.jsx';
import ProgressionsDialog from '../ProgressionsDialog.jsx';
import SaveTemplateDialog from '../SaveTemplateDialog.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';
import {Column} from './Column.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

function getDroppableId(dropLabel) {
  return Number(dropLabel.split('-')[0]);
}

export default function Board({template}) {
  const days = useLocalStore(st => st.boardDays);
  const setBoardDays = useLocalStore(st => st.setBoardDays);

  const weekDays = useLocalStore(st => st.boardWeekDays);
  const setWeekDays = useLocalStore(st => st.setBoardWeekDays);

  const slotIndex = useLocalStore(st => st.cardSlotIndex);
  const setSlotIndex = useLocalStore(st => st.setSlotIndex);

  const dayIndex = useLocalStore(st => st.cardDayIndex);
  const setDayIndex = useLocalStore(st => st.setDayIndex);

  const muscleGroupProgressions = useLocalStore(st => st.muscleGroupProgressions);
  const setMuscleGroupProgressions = useLocalStore(st => st.setMuscleGroupProgressions);
  const removeMuscleGroupProgression = useLocalStore(st => st.removeMuscleGroupProgression);

  const progressionsOpen = useLocalStore(st => st.templateProgressionsOpen);
  const setProgressionsOpen = useLocalStore(st => st.setTemplateProgressionsOpen);

  const exercisesById = useExercisesById();

  const [selectedExerciseData, setSelectedExerciseData] = useState(null);
  const handleCardChange = useHandleCardChange();

  const handleRemoveExercise = useCallback(
    prevExercise => {
      if (prevExercise) {
        handleCardChange({
          exerciseId: null,
          muscleGroupId: prevExercise.muscleGroupId,
        });
        setSelectedExerciseData(null);
      }
    },
    [handleCardChange]
  );

  const handleNewDay = useHandleNewDayCallback();

  const slot = useMemo(() => {
    return days[dayIndex]?.[slotIndex];
  }, [dayIndex, days, slotIndex]);

  const exercises = useActiveExercises();

  const handleExercisePickerClose = useCallback(() => {
    setSelectedExerciseData(null);
    setSlotIndex(null);
    setDayIndex(null);
  }, [setSelectedExerciseData, setDayIndex, setSlotIndex]);

  const handleSelectExercise = useCallback(
    ({exerciseId, updatedExercises}) => {
      let exercise;

      if (updatedExercises) {
        exercise = updatedExercises.find(ex => ex.id === exerciseId);
      } else {
        exercise = exercisesById[exerciseId];
      }

      handleCardChange(
        {
          ...slot,
          exerciseId,
          muscleGroupId: exercise.muscleGroupId,
        },
        {merge: false}
      );

      runAfterAnimations(handleExercisePickerClose);
    },
    [exercisesById, handleCardChange, handleExercisePickerClose, slot]
  );

  const handleRemoveDay = useCallback(
    dayIndex => {
      const newDays = cloneDeep(days);
      newDays.splice(dayIndex, 1);

      const newWeekDays = [...weekDays];
      newWeekDays.splice(dayIndex, 1);

      setBoardDays(newDays);
      setWeekDays(newWeekDays);
    },
    [days, setBoardDays, setWeekDays, weekDays]
  );

  const handleRemoveSlot = useCallback(
    (dayIndex, slotIndex) => {
      const newDays = cloneDeep(days);

      // Hold onto muscle group id from slot
      const muscleGroupId = newDays[dayIndex][slotIndex].muscleGroupId;

      // Remove the slot
      newDays[dayIndex].splice(slotIndex, 1);

      // See if the muscle group id exists anymore
      const flatDays = newDays.flatMap(d => d);
      const foundMg = flatDays.find(s => s.muscleGroupId === muscleGroupId);

      // If the MG no longer exists, we need to remove it from progressions:
      if (!foundMg) {
        removeMuscleGroupProgression(muscleGroupId);
      }

      // Set new days state
      setBoardDays(newDays);
    },
    [days, removeMuscleGroupProgression, setBoardDays]
  );

  const moveExercise = useCallback(
    (prevY, newY, prevX, newX) => {
      const newDays = cloneDeep(days);

      // the exercise is changing position within the same day
      if (prevX === newX) {
        const newExercises = arrayMove(newDays[newX], prevY, newY);
        newDays[newX] = newExercises;
      }
      // the exercise is moving across days
      else {
        // add the dragged item to the new day
        const newExercise = cloneDeep(newDays[prevX][prevY]);
        newDays[newX].splice(newY, 0, newExercise);
        // remove the dragged item out of the old day
        newDays[prevX].splice(prevY, 1);
      }

      setBoardDays(newDays);
    },
    [days, setBoardDays]
  );

  const onDragEnd = useCallback(
    ({destination, source}) => {
      if (!destination || !source) {
        return;
      }

      const prevX = getDroppableId(source.droppableId);
      const newX = getDroppableId(destination.droppableId);
      const prevY = source.index;
      const newY = destination.index;

      // TODO: Unify this with the move exercise callback
      moveExercise(prevY, newY, prevX, newX);
    },
    [moveExercise]
  );

  const handleClearExercises = useCallback(() => {
    const newDays = cloneDeep(days);

    for (const [dayIndex, day] of newDays.entries()) {
      for (const [slotIndex, slot] of day.entries()) {
        newDays[dayIndex][slotIndex] = {
          ...slot,
          exerciseId: null,
        };
      }
    }

    setBoardDays(newDays);
  }, [days, setBoardDays]);

  const handleAutoFill = useCallback(() => {
    const newDays = cloneDeep(days);

    for (const [dayIndex, day] of newDays.entries()) {
      for (const [slotIndex, slot] of day.entries()) {
        if (!slot.exerciseId) {
          const filteredExercises = getFilteredExercises(
            exercises.all,
            slot.muscleGroupId,
            slot.exerciseType
          );

          const exerciseIndex = Math.floor(filteredExercises.length * Math.random());
          const exerciseId = filteredExercises[exerciseIndex].id;
          newDays[dayIndex][slotIndex] = {
            ...slot,
            exerciseId,
          };
        }
      }
    }

    setBoardDays(newDays);
  }, [days, exercises.all, setBoardDays]);

  const handleWeekDayIndex = useCallback(
    (value, dayIndex) => {
      const newWeekDays = [...weekDays];
      newWeekDays[dayIndex] = value;

      setWeekDays(newWeekDays);
    },
    [setWeekDays, weekDays]
  );

  const handleProgressionsSave = useCallback(
    localProgressions => {
      setMuscleGroupProgressions(localProgressions);
      setProgressionsOpen(false);
    },
    [setMuscleGroupProgressions, setProgressionsOpen]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Fragment>
        <Header
          handleAutoFill={handleAutoFill}
          handleClearExercises={handleClearExercises}
          handleNewDay={handleNewDay}
        />

        <div className="absolute inset-x-0 bottom-[80px] top-[120px] standalone:pb-safe-offset-0 desktop:bottom-0 desktop:top-16">
          <div className="flex h-full w-full gap-4 overflow-auto overscroll-contain px-4 pb-12">
            {days.map((day, dayIndex) => (
              <Column
                key={`column=${dayIndex}`}
                day={day}
                dayIndex={dayIndex}
                handleWeekDayIndex={handleWeekDayIndex}
                handleRemoveDay={handleRemoveDay}
                handleRemoveSlot={handleRemoveSlot}
                setSelectedExerciseData={setSelectedExerciseData}
                weekDayIndex={weekDays[dayIndex]}
              />
            ))}

            {days.length <= 5 && (
              <div className="">
                <div onClick={handleNewDay} className="btn sticky top-0 w-[332px]">
                  <Plus size={20} />
                  <p className="pl-2">Add a day</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />

        <CreateMesoDialog weekDays={weekDays} />

        <MuscleGroupPickerDialog />

        <SheetDialog isOpen={Boolean(selectedExerciseData)} onClose={handleExercisePickerClose}>
          <ExercisePicker
            exerciseId={selectedExerciseData?.exerciseId}
            muscleGroupId={selectedExerciseData?.muscleGroupId}
            offerRepeat={false}
            onClose={handleExercisePickerClose}
            onRemoveExercise={handleRemoveExercise}
            onSelectExercise={handleSelectExercise}
          />
        </SheetDialog>

        <CopyMesoDialog />

        <SaveTemplateDialog template={template} />

        <ProgressionsDialog
          isOpen={progressionsOpen}
          isSaving={false}
          onClose={() => setProgressionsOpen(false)}
          onSave={handleProgressionsSave}
          progressions={muscleGroupProgressions}
        />
      </Fragment>
    </DragDropContext>
  );
}

Board.propTypes = {
  template: object,
};
