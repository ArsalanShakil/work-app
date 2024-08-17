import {EXERCISE_TYPE} from '../../../../lib/training/constants.mjs';
import {
  getMinMaxAddedLoad,
  getMinMaxAssistance,
  getMinMaxWeight,
} from '../../../../lib/training/utils.mjs';

export default function getWeightInputMinMax(exerciseType, bodyweight, unit) {
  if (exerciseType === EXERCISE_TYPE.bodyweight) {
    throw new Error('THIS SHOULD NOT HAPPEN. SEE YOU IN THE LOGS');
  }

  switch (exerciseType) {
    case EXERCISE_TYPE.bodyweightLoadable:
      return getMinMaxAddedLoad(unit);
    case EXERCISE_TYPE.machineAssistance:
      return getMinMaxAssistance(bodyweight, unit);
    default:
      return getMinMaxWeight(exerciseType, bodyweight, unit);
  }
}
