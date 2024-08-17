import {number} from 'prop-types';

import useLocalStore from '../../utils/useLocalStore.js';

// TODO: This component is very "Board" specific and should not be part of the exercise chooser
export default function PositionInfo({pageNumber, currentPage}) {
  const cardSlotIndex = useLocalStore(st => st.cardSlotIndex);
  const cardDayIndex = useLocalStore(st => st.cardDayIndex);

  return (
    <div
      className={`flex space-x-1 text-sm text-base-content transition-opacity duration-200 ease-in-out ${
        currentPage > pageNumber ? 'opacity-0' : ''
      }`}
    >
      <span className="">Day</span>
      <span className="pr-2">{cardDayIndex + 1}</span>
      <span className="">Exercise</span>
      <span className="">{cardSlotIndex + 1}</span>
    </div>
  );
}

PositionInfo.propTypes = {
  pageNumber: number.isRequired,
  currentPage: number,
};
