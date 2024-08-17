import {number, object, string} from 'prop-types';
import {useCallback} from 'react';

import {EXERCISE_TYPE} from '../../../../lib/training/constants.mjs';
import {exerciseTypeNamesById, UNIT_DISPLAY} from '../constants.js';
import useLocalStore from '../utils/useLocalStore.js';

export default function MesoDayExerciseTypeLabel({bodyweight, exercise, unit}) {
  const type = exercise?.exerciseType;
  const setReadynessDialogOpen = useLocalStore(st => st.setReadynessDialogOpen);

  const openBodyweight = useCallback(() => setReadynessDialogOpen(true), [setReadynessDialogOpen]);

  let label;
  switch (type) {
    case EXERCISE_TYPE.bodyweightOnly:
      label = (
        <>
          {exerciseTypeNamesById[type]}
          {' @ '}
          <span className="link" onClick={openBodyweight}>
            {bodyweight || '?'} {UNIT_DISPLAY.plural[unit]}
          </span>
        </>
      );
      break;
    case EXERCISE_TYPE.bodyweightLoadable:
    case EXERCISE_TYPE.machineAssistance:
      label = (
        <>
          {exerciseTypeNamesById[type]}
          {' @ '}
          <span className="link" onClick={openBodyweight}>
            {bodyweight || '?'} {UNIT_DISPLAY.plural[unit]} bodyweight
          </span>
        </>
      );
      break;
    default:
      label = exerciseTypeNamesById[type];
      break;
  }

  return <h4 className="mt-1 text-xs uppercase text-base-content/60">{label}</h4>;
}

MesoDayExerciseTypeLabel.propTypes = {
  bodyweight: number,
  exercise: object.isRequired,
  unit: string.isRequired,
};
