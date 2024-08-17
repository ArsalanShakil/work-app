import {Draggable} from '@hello-pangea/dnd';
import {Trash} from '@phosphor-icons/react';
import {func, number, object} from 'prop-types';
import {useCallback} from 'react';

import {MG_PROGRESSION_TYPES} from '../../../../../lib/training/constants.mjs';
import {useMuscleGroups} from '../../api.js';
import {useExercisesById, useMuscleGroupsById} from '../../utils/hooks.js';
import useLocalStore from '../../utils/useLocalStore.js';
import SecondaryBadge from '../ui/SecondaryBadge.jsx';

// https://react-beautiful-dnd.netlify.com/iframe.html?id=single-vertical-list--basic

export default function Card({
  slot,
  slotIndex,
  dayIndex,
  handleRemoveSlot,
  setSelectedExerciseData,
}) {
  const {data: muscleGroups} = useMuscleGroups();

  const exercisesById = useExercisesById();
  const muscleGroupsById = useMuscleGroupsById();

  const muscleGroup = muscleGroups?.find(group => group.id === Number(slot?.muscleGroupId));

  const setSlotIndex = useLocalStore(st => st.setSlotIndex);
  const setDayIndex = useLocalStore(st => st.setDayIndex);
  const muscleGroupProgressions = useLocalStore(st => st.muscleGroupProgressions);

  const handleOpenCard = useCallback(
    e => {
      e.stopPropagation();
      setSlotIndex(slotIndex);
      setDayIndex(dayIndex);
      setSelectedExerciseData({
        exerciseId: slot?.exerciseId,
        muscleGroupId: slot?.muscleGroupId,
      });
    },
    [
      dayIndex,
      setDayIndex,
      setSelectedExerciseData,
      setSlotIndex,
      slot?.exerciseId,
      slot?.muscleGroupId,
      slotIndex,
    ]
  );

  return (
    <Draggable draggableId={`draggable-${dayIndex}-${slotIndex}`} index={slotIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className={`group relative my-2 select-none bg-base-100 dark:bg-base-200/80 ${
            snapshot.isDragging ? 'border-none shadow-lg' : 'border border-base-100'
          }`}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="flex flex-col gap-1 px-3 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex w-full items-center">
                <p className="badge flex w-fit items-center border-none bg-accent/10 px-1.5 uppercase text-accent focus:bg-accent/20 focus:outline-none dark:bg-accent/30 dark:text-accent-content">
                  <span className="">{muscleGroupsById[muscleGroup?.id]?.name}</span>

                  {muscleGroupProgressions[slot.muscleGroupId]?.mgProgressionType ===
                    MG_PROGRESSION_TYPES.slow && <SecondaryBadge />}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveSlot(dayIndex, slotIndex);
                  }}
                  className="btn btn-square btn-ghost btn-xs text-base-300 transition-opacity duration-300 group-hover:opacity-100 dark:text-base-content"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>

            <div onClick={handleOpenCard} className="pt-2">
              <button
                className={`w-full border px-2 py-1 text-left text-sm dark:border-base-100 dark:bg-base-200 ${
                  slot.exerciseId
                    ? 'border border-base-300/80 bg-base-200/10 text-base-content/90 group-hover:bg-base-200/50 dark:bg-base-300 dark:group-hover:bg-base-100'
                    : 'border-dashed text-base-content/50 shadow-none group-hover:border-solid group-hover:bg-base-200/50 dark:group-hover:bg-base-100 [@media(hover:none)]:border-base-300/50'
                }`}
              >
                {exercisesById[slot.exerciseId]?.name || 'Choose an exercise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

Card.propTypes = {
  slot: object,
  slotIndex: number,
  dayIndex: number,
  handleRemoveSlot: func.isRequired,
  setSelectedExerciseData: func.isRequired,
};
