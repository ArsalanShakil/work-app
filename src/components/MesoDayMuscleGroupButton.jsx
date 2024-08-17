import {
  BookOpenText,
  CheckCircle,
  HourglassHigh,
  PauseCircle,
  PlayCircle,
  ProhibitInset,
  SkipForwardCircle,
} from '@phosphor-icons/react';
import {bool, func, object} from 'prop-types';

import {STATUSES} from '../../../../lib/training/constants.mjs';
import {useMuscleGroupsById} from '../utils/hooks.js';
import useLocalStore from '../utils/useLocalStore.js';

const muscleGroupStatusMap = {
  [STATUSES.muscleGroup.unprogrammed]: <PauseCircle size={16} />, // no recommendation
  [STATUSES.muscleGroup.programmed]: <PlayCircle size={16} />, // ready to start
  [STATUSES.muscleGroup.pendingFeedback]: <BookOpenText size={16} />, // waiting on user to provide feedback
  [STATUSES.muscleGroup.started]: (
    <HourglassHigh size={16} weight="fill" className="animate-pulse duration-500" />
  ), // started

  // All below are "done"
  [STATUSES.muscleGroup.skipped]: <SkipForwardCircle weight="fill" size={16} />, // all skipped
  [STATUSES.muscleGroup.partial]: <CheckCircle weight="fill" size={16} />, // some skipped
  [STATUSES.muscleGroup.complete]: <CheckCircle weight="fill" size={16} />, // all performed
  [STATUSES.muscleGroup.noProgramming]: <ProhibitInset size={16} />, // won't be programmed
};

const muscleGroupStatusText = {
  [STATUSES.muscleGroup.unprogrammed]: 'Pending',
  [STATUSES.muscleGroup.programmed]: 'Ready',
  [STATUSES.muscleGroup.pendingFeedback]: 'Pending feedback',
  [STATUSES.muscleGroup.started]: 'In progress',

  // All below are "done"
  [STATUSES.muscleGroup.skipped]: 'Skipped',
  [STATUSES.muscleGroup.partial]: 'Complete',
  [STATUSES.muscleGroup.complete]: 'Complete',
  [STATUSES.muscleGroup.noProgramming]: 'No programming',
};

export default function MesoDayMuscleGroupButton({disabled, dayMuscleGroup, muscleGroup, onClick}) {
  const isDesktop = useLocalStore(st => st.isDesktop);
  const muscleGroupsById = useMuscleGroupsById();

  const useIndicator = onClick && dayMuscleGroup;
  const muscleGroupId = dayMuscleGroup?.muscleGroupId || muscleGroup?.id;
  const activeStyles =
    'badge badge-accent badge-outline badge-lg w-full gap-1.5 bg-accent/5 uppercase hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:border-accent dark:bg-accent/20 dark:text-accent-content dark:hover:bg-accent/30 dark:focus:bg-accent/30 px-1.5';
  const disabledStyles =
    'badge badge-ghost badge-outline badge-lg w-full gap-1.5 uppercase border-base-300/50 text-base-content/70 dark:border-neutral-content/30 dark:text-neutral-content/50 px-1.5';

  return (
    <div
      className={isDesktop ? 'tooltip tooltip-bottom' : null}
      data-tip={muscleGroupStatusText[dayMuscleGroup?.status]}
    >
      <button
        disabled={disabled}
        onClick={() => (useIndicator ? onClick(dayMuscleGroup) : false)}
        className={disabled ? disabledStyles : activeStyles}
      >
        <span className="text-xs font-medium">{muscleGroupsById[muscleGroupId]?.name}</span>
        {useIndicator && <span>{muscleGroupStatusMap[dayMuscleGroup.status]}</span>}
      </button>
    </div>
  );
}

MesoDayMuscleGroupButton.propTypes = {
  disabled: bool,
  dayMuscleGroup: object,
  muscleGroup: object,
  onClick: func,
};
