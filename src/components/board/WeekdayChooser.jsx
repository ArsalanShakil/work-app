import {Info} from '@phosphor-icons/react';
import {func} from 'prop-types';
import {useCallback, useMemo, useState} from 'react';

import {WEEKDAYS_SHORT} from '../../constants.js';
import {getWorkoutDayIndexesForTemplate} from '../../utils/index.js';
import useLocalStore from '../../utils/useLocalStore.js';

export default function WeekdayChooser({onCancel, onApply}) {
  const days = useLocalStore(st => st.boardDays);
  const weekDays = useLocalStore(st => st.boardWeekDays);
  const setBoardWeekDays = useLocalStore(st => st.setBoardWeekDays);

  const [startDayIndex, setStartDayIndex] = useState(weekDays[0] || 0);

  const handleApply = useCallback(() => {
    setBoardWeekDays(getWorkoutDayIndexesForTemplate(days.length, startDayIndex));
    onApply();
  }, [days.length, onApply, setBoardWeekDays, startDayIndex]);

  const recommendation = useMemo(() => {
    return getWorkoutDayIndexesForTemplate(days.length, startDayIndex);
  }, [days.length, startDayIndex]);

  return (
    <div className="mt-2 flex min-h-0 grow flex-col justify-between overflow-auto border-t p-4 dark:border-base-300/60">
      <div className="space-y-6">
        <div className="flex gap-2 rounded-md bg-base-200/50 p-4 text-base-content/70 dark:bg-base-300">
          <Info size={19} className="shrink-0" />
          <p className="text-[13px]">Update your start day to reset recommended workout days</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-medium">Choose a start day</h2>

          <div className="flex justify-between gap-2 font-medium uppercase">
            {WEEKDAYS_SHORT.map((wkdy, index) => (
              <div
                key={wkdy}
                onClick={() => setStartDayIndex(index)}
                className={`grow cursor-pointer py-1 text-center ${
                  startDayIndex === index
                    ? 'bg-secondary text-secondary-content'
                    : 'bg-base-200/50 dark:bg-base-100'
                }`}
              >
                {wkdy}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="">Recommended workout days</h3>

          <div className="flex justify-between gap-2 font-medium uppercase">
            {WEEKDAYS_SHORT.map((wkdy, index) => (
              <div
                key={wkdy}
                className={`grow py-1 text-center text-base-content ${
                  recommendation.includes(index)
                    ? 'border border-blue-100 bg-blue-100/70 dark:border-base-300/60 dark:text-black'
                    : 'border dark:border-base-300/60'
                }`}
              >
                {wkdy}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-safe-offset-0">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-accent" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
}

WeekdayChooser.propTypes = {
  onApply: func.isRequired,
  onCancel: func.isRequired,
};
