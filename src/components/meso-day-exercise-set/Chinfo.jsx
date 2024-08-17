import {number, string} from 'prop-types';
import {memo} from 'react';

import {roundTo} from '../../../../../lib/math.mjs';
import {EXERCISE_TYPE} from '../../../../../lib/training/constants.mjs';
import {SET_INPUTS, UNIT_DISPLAY} from '../../constants.js';
import {useTargetRIR} from '../../utils/hooks.js';
import useLocalStore from '../../utils/useLocalStore.js';
import Expander from '../ui/Expander.jsx';

const Chinfo = memo(function Chinfo({
  bodyweight,
  exerciseType,
  repsError,
  repsTarget,
  setId,
  unit,
  weight,
  weightError,
  weightTargetMax,
  weightTargetMin,
}) {
  const focusedSetId = useLocalStore(st => st.focusedSetId);
  const focusedInput = useLocalStore(st => st.focusedSetInputType);
  const targetRIR = useTargetRIR();

  const weightFocused = focusedInput === SET_INPUTS.weight;
  const repsFocused = focusedInput === SET_INPUTS.reps;

  const weightMin =
    exerciseType === EXERCISE_TYPE.machineAssistance
      ? bodyweight - weightTargetMax
      : exerciseType === EXERCISE_TYPE.bodyweightLoadable
      ? weightTargetMin - bodyweight
      : weightTargetMin;

  const weightMax =
    exerciseType === EXERCISE_TYPE.machineAssistance
      ? bodyweight - weightTargetMin
      : exerciseType === EXERCISE_TYPE.bodyweightLoadable
      ? weightTargetMax - bodyweight
      : weightTargetMax;

  const recommendationString =
    weightTargetMin && weightTargetMax
      ? weightTargetMin === weightTargetMax
        ? `We recommend ${roundTo(weightMin, 0.01)} ${UNIT_DISPLAY.plural[unit]}`
        : `We recommend ${roundTo(weightMin, 0.01)} - ${roundTo(weightMax, 0.01)} ${
            UNIT_DISPLAY.plural[unit]
          }`
      : roundTo(weight, 0.01)
      ? 'No weight recommendation at this time'
      : 'Choose your starting weight';

  return (
    <Expander isOpen={focusedSetId === setId} specificHeight={26}>
      <div className="flex items-center">
        <div className="w-[32px] shrink-0" />
        <div className="mr-4 mt-2.5 grid w-full grid-cols-7 text-xs text-base-content/70">
          <div className="col-span-1" />

          <div
            className="col-span-4 -mx-14"
            // Negative margin used to align with the proper grid cells, but have more room to display text
          >
            <div
              className={`flex items-center justify-center gap-3 transition ${
                weightFocused ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
              }`}
            >
              {weightError && <span className="text-accent">{weightError}</span>}
              {!weightError && <span>{recommendationString}</span>}
            </div>

            <div
              className={`flex items-center justify-center gap-3 transition ${
                repsFocused ? '-translate-y-full opacity-100' : 'translate-y-0 opacity-0'
              }`}
            >
              {repsError && <span className="text-accent">{repsError}</span>}
              {!repsError && (
                <span>
                  {repsTarget > 0
                    ? `We recommend ${repsTarget} reps or ${targetRIR} RIR`
                    : `We recommend ${targetRIR} RIR`}
                </span>
              )}
            </div>
          </div>

          <div className="col-span-2" />
        </div>
      </div>
    </Expander>
  );
});

Chinfo.propTypes = {
  bodyweight: number,
  exerciseType: string.isRequired,
  repsError: string,
  repsTarget: number,
  setId: number.isRequired,
  unit: string,
  weight: number,
  weightError: string,
  weightTargetMax: number,
  weightTargetMin: number,
};

export default Chinfo;
