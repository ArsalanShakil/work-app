import {ErrorWithExtraData} from '../../../../lib/errors.mjs';
import {STATUSES, STATUSES_IN_PROGRESS} from '../../../../lib/training/constants.mjs';

export default function canAddSetWithDayStatus(mesoDayStatus) {
  if (!STATUSES.day[mesoDayStatus]) {
    throw new ErrorWithExtraData('Cannot add set with invalid meso day status', {
      mesoDayStatus,
    });
  }

  // If the day is ready or started, all muscle groups have been programmed and its safe to add a set
  return mesoDayStatus === STATUSES.day.ready || STATUSES_IN_PROGRESS.day.includes(mesoDayStatus);
}
