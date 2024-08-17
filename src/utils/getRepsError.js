import {isNum} from '../../../../lib/math.mjs';
import {REPS_MAX} from '../constants.js';

export default function getRepsError(reps) {
  return isNum(reps) && reps > REPS_MAX ? 'Reps too high' : '';
}
