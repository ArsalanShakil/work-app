import {isNum} from '../../../../lib/math.mjs';
import {EXERCISE_TYPE} from '../../../../lib/training/constants.mjs';
import {parseNumberLocale} from './parseNumberLocale.js';

export default function getWeightError(weightInputText, min, max, exerciseType) {
  const weight = parseNumberLocale(weightInputText);

  // If we have no value, the input is empty
  if (!isNum(weight)) {
    return null;
  }

  // Once we have a value, check it again min / max
  if (weight < min) {
    if (exerciseType === EXERCISE_TYPE.machineAssistance) {
      return 'Assistance too low';
    }
    return 'Weight too low';
  }

  if (weight > max) {
    if (exerciseType === EXERCISE_TYPE.machineAssistance) {
      return 'Assistance too high';
    }
    return 'Weight too high';
  }

  return null;
}
