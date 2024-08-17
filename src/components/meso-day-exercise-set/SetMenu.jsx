import {DotsThreeVertical} from '@phosphor-icons/react';
import {bool, func, number, object, string} from 'prop-types';

import IconButton from '../ui/IconButton.jsx';
import SetMenuItems from './SetMenuItems.jsx';

export default function SetMenu({
  dayExerciseStatus,
  dayFinished,
  firstUnfinishedSetIndex,
  handleAddSet,
  handleDeleteSet,
  handleSkipSet,
  handleType,
  isBaseSet,
  set,
  setsLength,
}) {
  if (dayFinished) {
    return (
      <DotsThreeVertical
        size={22}
        className="w-[32px] text-base-300 hover:cursor-not-allowed dark:text-base-content/30"
      />
    );
  }

  return (
    <IconButton
      anchorX="left"
      buttonClasses="h-[32px] w-[32px] flex items-center justify-center"
      icon={<DotsThreeVertical weight="bold" size={22} />}
    >
      <SetMenuItems
        dayExerciseStatus={dayExerciseStatus}
        firstUnfinishedSetIndex={firstUnfinishedSetIndex}
        handleAddSet={handleAddSet}
        handleDeleteSet={handleDeleteSet}
        handleSkipSet={handleSkipSet}
        handleType={handleType}
        isBaseSet={isBaseSet}
        set={set}
        setsLength={setsLength}
      />
    </IconButton>
  );
}

SetMenu.propTypes = {
  dayExerciseStatus: string.isRequired,
  dayFinished: bool.isRequired,
  firstUnfinishedSetIndex: number.isRequired,
  handleAddSet: func.isRequired,
  handleDeleteSet: func.isRequired,
  handleSkipSet: func.isRequired,
  handleType: func.isRequired,
  isBaseSet: bool.isRequired,
  set: object.isRequired,
  setsLength: number,
};
