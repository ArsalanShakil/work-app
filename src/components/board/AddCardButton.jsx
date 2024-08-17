import {Plus} from '@phosphor-icons/react';
import {array, number} from 'prop-types';
import {Fragment, useCallback} from 'react';

import useLocalStore from '../../utils/useLocalStore.js';

export default function AddCardButton({day, dayIndex}) {
  const setSlotIndex = useLocalStore(st => st.setSlotIndex);
  const setDayIndex = useLocalStore(st => st.setDayIndex);
  const setMuscleGroupPickerOpen = useLocalStore(st => st.setMuscleGroupPickerOpen);

  const openNewSlot = useCallback(() => {
    setSlotIndex(day.length);
    setDayIndex(dayIndex);
    setMuscleGroupPickerOpen(true);
  }, [day.length, dayIndex, setDayIndex, setMuscleGroupPickerOpen, setSlotIndex]);

  return (
    <Fragment>
      <button onClick={openNewSlot} className="btn btn-block">
        <Plus size={20} weight="bold" />
        <span className="text-sm">Add a muscle group</span>
      </button>
    </Fragment>
  );
}

AddCardButton.propTypes = {
  day: array.isRequired,
  dayIndex: number.isRequired,
};
