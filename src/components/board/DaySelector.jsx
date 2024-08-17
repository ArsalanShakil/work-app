import {func, number, oneOfType, string} from 'prop-types';
import {useCallback} from 'react';

import {isNum} from '../../../../../lib/math.mjs';
import {WEEKDAYS} from '../../constants.js';
import Select from '../ui/Select.jsx';

export default function DaySelector({weekDayIndex, dayIndex, handleWeekDayIndex}) {
  const handleChange = useCallback(
    ({target}) => {
      const value = target.value === '' ? null : Number(target.value);
      handleWeekDayIndex(value, dayIndex);
    },
    [dayIndex, handleWeekDayIndex]
  );

  return (
    <Select
      value={isNum(weekDayIndex) ? weekDayIndex : ''}
      onChange={handleChange}
      classNameWrapper="w-full"
      classNameSelect="select-sm"
    >
      <option value="">Add a label</option>
      {WEEKDAYS.map((weekday, index) => (
        <option key={weekday} value={index}>
          {weekday}
        </option>
      ))}
    </Select>
  );
}

DaySelector.propTypes = {
  weekDayIndex: oneOfType([number, string]),
  dayIndex: number.isRequired,
  handleWeekDayIndex: func.isRequired,
};
