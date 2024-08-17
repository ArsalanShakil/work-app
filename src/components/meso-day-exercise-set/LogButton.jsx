import {bool, func, number, object, oneOfType, string} from 'prop-types';
import {memo, useCallback, useMemo} from 'react';

import {isNum} from '../../../../../lib/math.mjs';
import {STATUSES} from '../../../../../lib/training/constants.mjs';
import {BUTTON_TYPE} from '../../constants.js';
import isRepsError from '../../utils/getRepsError.js';
import useLocalStore from '../../utils/useLocalStore.js';
import LogButtonIcon from './LogButtonIcon.jsx';

const LogButton = memo(function LogButton({
  firstUnfinishedSetIndex,
  isWorking,
  isLastFinished,
  localWeight,
  localReps,
  set,
  onFinish,
  onReset,
  showIndicator,
  weightError,
}) {
  const {active, done, inactive, skipped, working} = BUTTON_TYPE;

  const hasValidWeight = isNum(localWeight) && !weightError;
  const hasValidReps = !isRepsError(localReps) && (isNum(localReps) || set.repsTarget > 0);
  const focusedSetInputType = useLocalStore(st => st.focusedSetInputType);

  const buttonType = useMemo(() => {
    if (isWorking) {
      return working;
    } else {
      if (set.finishedAt) {
        if (set.status === STATUSES.set.skipped) {
          return skipped;
        }
        return done;
      }
      if (hasValidWeight && hasValidReps && firstUnfinishedSetIndex === set.position) {
        return active;
      } else {
        return inactive;
      }
    }
  }, [
    isWorking,
    working,
    set.finishedAt,
    set.position,
    set.status,
    hasValidWeight,
    hasValidReps,
    firstUnfinishedSetIndex,
    done,
    skipped,
    active,
    inactive,
  ]);

  const handleClick = useCallback(() => {
    if (buttonType === active) {
      onFinish();
    } else if (
      (buttonType === done || buttonType === skipped) &&
      !focusedSetInputType &&
      isLastFinished
    ) {
      onReset();
    }
  }, [active, buttonType, done, focusedSetInputType, isLastFinished, onFinish, onReset, skipped]);

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={buttonType === inactive}
        className="disabled:cursor-not-allowed "
      >
        <LogButtonIcon showIndicator={showIndicator} type={buttonType} />
      </button>
    </div>
  );
});

export default LogButton;

LogButton.propTypes = {
  firstUnfinishedSetIndex: number.isRequired,
  isLastFinished: bool.isRequired,
  isWorking: bool.isRequired,
  localReps: number,
  localWeight: oneOfType([number, string]),
  onFinish: func.isRequired,
  onReset: func.isRequired,
  set: object.isRequired,
  showIndicator: bool.isRequired,
  weightError: string,
};
