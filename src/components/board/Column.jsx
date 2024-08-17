import {Droppable} from '@hello-pangea/dnd';
import {Trash} from '@phosphor-icons/react';
import {array, func, number} from 'prop-types';
import {useMatch} from 'react-router-dom';

import AddCardButton from './AddCardButton.jsx';
import Card from './Card.jsx';
import DaySelector from './DaySelector.jsx';

export function Column({
  day,
  dayIndex,
  handleWeekDayIndex,
  handleRemoveDay,
  handleRemoveSlot,
  setSelectedExerciseData,
  weekDayIndex,
}) {
  const isTemplate = !!useMatch('/templates/*');

  return (
    <Droppable droppableId={`${dayIndex}-droppable`}>
      {provided => (
        <div
          id={`${dayIndex}-column`}
          className="flex h-fit w-[300px] shrink-0 select-none flex-col bg-base-200 dark:bg-base-300/90"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-1.5 bg-base-200 p-2 dark:bg-base-300/90 md:py-2">
            {!isTemplate && (
              <DaySelector
                dayIndex={dayIndex}
                weekDayIndex={weekDayIndex}
                handleWeekDayIndex={handleWeekDayIndex}
              />
            )}

            {isTemplate && (
              <div className="w-full border border-[#d7d8db] bg-base-100 px-3 py-1">
                <h3 className="text-sm">Day {dayIndex + 1}</h3>
              </div>
            )}

            <button
              className="btn btn-square btn-ghost btn-sm text-base-300 dark:text-base-content"
              onClick={() => handleRemoveDay(dayIndex)}
            >
              <Trash size={16} />
            </button>
          </div>

          <div ref={provided.innerRef} className="grow px-2 pb-2">
            {day.map((slot, index) => (
              <Card
                key={`draggable-${dayIndex}-${index}`}
                slot={slot}
                slotIndex={index}
                dayIndex={dayIndex}
                handleRemoveSlot={handleRemoveSlot}
                setSelectedExerciseData={setSelectedExerciseData}
              />
            ))}
            <AddCardButton day={day} dayIndex={dayIndex} />
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

Column.propTypes = {
  day: array.isRequired,
  dayIndex: number.isRequired,
  handleWeekDayIndex: func.isRequired,
  handleRemoveDay: func.isRequired,
  handleRemoveSlot: func.isRequired,
  setSelectedExerciseData: func.isRequired,
  weekDayIndex: number,
};
