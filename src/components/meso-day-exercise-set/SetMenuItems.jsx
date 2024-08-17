import {Menu} from '@headlessui/react';
import {ArrowBendDownRight, FastForward, Info, Trash} from '@phosphor-icons/react';
import {bool, func, number, object, string} from 'prop-types';
import {Fragment} from 'react';

import {SET_TYPE, STATUSES, STATUSES_FINISHED} from '../../../../../lib/training/constants.mjs';
import canAddSetWithDayStatus from '../../utils/canAddSetWithDayStatus.js';
import {useMesoDay} from '../../utils/hooks.js';
import useLocalStore from '../../utils/useLocalStore.js';
import IconButton from '../ui/IconButton.jsx';
import IconButtonMenuLabel from '../ui/IconButtonMenuLabel.jsx';
import {MenuButton} from '../ui/MenuItem.jsx';

export default function SetMenuItems({
  dayExerciseStatus,
  firstUnfinishedSetIndex,
  handleAddSet,
  handleDeleteSet,
  handleSkipSet,
  handleType,
  isBaseSet,
  set,
  setsLength,
}) {
  const {day} = useMesoDay();
  const setSetTypeDialogOpen = useLocalStore(st => st.setIsSetTypeDialogOpen);

  const canAddSet = canAddSetWithDayStatus(day.status);
  const exerciseDone = STATUSES_FINISHED.exercise.includes(dayExerciseStatus);
  const canRemoveSet = canAddSet && setsLength > 1 && !isBaseSet;

  const canSkipSet =
    !exerciseDone &&
    !day.finishedAt &&
    day.status !== STATUSES.day.pending &&
    !set.finishedAt &&
    firstUnfinishedSetIndex === set.position &&
    !isBaseSet;

  return (
    <Fragment>
      <IconButtonMenuLabel label="Set" />
      <MenuButton
        disabled={!canAddSet}
        onClick={handleAddSet}
        label="Add set below"
        icon={<ArrowBendDownRight size={16} />}
      />

      <MenuButton
        disabled={!canSkipSet}
        onClick={handleSkipSet}
        label="Skip set"
        icon={<FastForward size={16} />}
      />

      <MenuButton
        disabled={!canRemoveSet}
        onClick={handleDeleteSet}
        label="Delete set"
        className="text-rose-500 hover:bg-rose-100"
        icon={<Trash size={16} />}
      />

      <IconButtonMenuLabel label="Set type" />

      <div className="form-control divide-y dark:divide-base-200">
        <Menu.Item>
          <div className="px-4 py-3">
            <label className="cursor-pointer">
              <div className="flex items-center justify-start ">
                <input
                  type="radio"
                  className="radio radio-xs mr-2 checked:bg-primary"
                  checked={set.setType === SET_TYPE.regular}
                  onChange={() => handleType(SET_TYPE.regular)}
                />
                <span className="label-text">Regular</span>
              </div>
              <span className="pl-6 text-xs text-base-content/60">(straight, down, ascending)</span>
            </label>
          </div>
        </Menu.Item>
        <Menu.Item>
          <div className="flex items-center justify-between pr-4">
            <label className="mr-4 flex grow cursor-pointer items-center justify-start px-4 py-3">
              <input
                type="radio"
                className="radio radio-xs mr-2 checked:bg-primary"
                checked={set.setType === SET_TYPE.myorep}
                onChange={() => handleType(SET_TYPE.myorep)}
              />
              <span className="label-text">Myorep</span>
            </label>
            <IconButton
              onClick={() => setSetTypeDialogOpen(true)}
              icon={<Info size={17} className="text-info-content" />}
            />
          </div>
        </Menu.Item>
        <Menu.Item>
          <div className="flex items-center justify-between pr-4">
            <label
              className={`mr-4 flex grow cursor-pointer items-center justify-start px-4 py-3 text-red-500 ${
                set.position === 0 ? 'text-red-600' : 'text-base-content/50'
              }`}
            >
              <input
                disabled={set.position === 0}
                type="radio"
                className="radio radio-xs mr-2 checked:bg-primary"
                checked={set.setType === SET_TYPE['myorep-match']}
                onChange={() => handleType(SET_TYPE['myorep-match'])}
              />
              <span className={`label-text ${set.position === 0 ? 'text-base-content/50' : ''}`}>
                Myorep match
              </span>
            </label>
            <IconButton
              onClick={() => setSetTypeDialogOpen(true)}
              icon={<Info size={17} className="text-info-content" />}
            />
          </div>
        </Menu.Item>
      </div>
    </Fragment>
  );
}

SetMenuItems.propTypes = {
  dayExerciseStatus: string.isRequired,
  firstUnfinishedSetIndex: number.isRequired,
  handleAddSet: func.isRequired,
  handleDeleteSet: func.isRequired,
  handleSkipSet: func.isRequired,
  handleType: func.isRequired,
  isBaseSet: bool.isRequired,
  set: object.isRequired,
  setsLength: number,
};
