import {func} from 'prop-types';
import {Fragment, useState} from 'react';

import {useUpdateDayLabel} from '../api.js';
import {WEEKDAYS} from '../constants.js';
import {useMesoDay, useMutationCallback} from '../utils/hooks.js';
import DaySelector from './board/DaySelector.jsx';

export default function UpdateMesoDayLabelDialog({onClose}) {
  const {day} = useMesoDay();
  const foundLabelIndex = WEEKDAYS.findIndex(wd => wd === day.label);
  const [weekdayIdx, setWeekdayIdx] = useState(foundLabelIndex >= 0 ? foundLabelIndex : '');
  const [repeat, setRepeat] = useState(false);

  const updateMesoDayLabel = useUpdateDayLabel(day.id);

  const handleClose = useMutationCallback(onClose);
  const handleRename = useMutationCallback(() => {
    const body = {
      label: WEEKDAYS[weekdayIdx],
      repeat,
    };
    updateMesoDayLabel.mutate(body, {onSuccess: handleClose});
  }, [handleClose, repeat, updateMesoDayLabel, weekdayIdx]);

  return (
    <Fragment>
      <p className="text-sm">You can apply a different weekday label to this day.</p>

      <DaySelector
        weekDayIndex={weekdayIdx}
        dayIndex={day.position}
        handleWeekDayIndex={index => setWeekdayIdx(index)}
        className="w-full"
      />

      <div className="form-control">
        <label className="label cursor-pointer justify-start">
          <input
            type="checkbox"
            className="checkbox outline-none" // TODO: make this accent if it's checked
            checked={repeat}
            onChange={e => setRepeat(e.target.checked)}
          />
          <span className="label-text ml-3 text-xs">Apply to all days in this position</span>
        </label>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button className="btn btn-ghost" onClick={handleClose}>
          Cancel
        </button>
        <button
          className="btn btn-accent"
          disabled={updateMesoDayLabel.isWorking}
          onClick={handleRename}
        >
          {updateMesoDayLabel.isWorking && <span className="loading"></span>}
          Save
        </button>
      </div>
    </Fragment>
  );
}

UpdateMesoDayLabelDialog.propTypes = {
  onClose: func.isRequired,
};
