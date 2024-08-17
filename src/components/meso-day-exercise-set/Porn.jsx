import {ArrowLineDownRight, ArrowLineUpRight, FastForward, Target} from '@phosphor-icons/react';
import {number, string} from 'prop-types';
import {memo, useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {isNum} from '../../../../../lib/math.mjs';
import {STATUSES} from '../../../../../lib/training/constants.mjs';
import {useMesoDay} from '../../utils/hooks.js';

const Porn = memo(function Porn({finishedAt, reps, repsTarget, status}) {
  const {week} = useParams();
  const {meso} = useMesoDay();
  const [isOpen, setOpen] = useState(false);

  const isDeload = Number(week) === meso.weeks.length;

  const handleClick = useCallback(() => {
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setOpen(false), 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (isDeload) {
    return null;
  }

  if (status === STATUSES.set.skipped) {
    return <FastForward size={22} />;
  }

  // Except for skipped, there's no reason to render in week 1
  if (week === '1' || !finishedAt) {
    return null;
  }

  if (isNum(reps)) {
    if (reps >= 0 && repsTarget > 0) {
      if (reps > repsTarget) {
        return (
          <div className={isOpen ? 'tooltip tooltip-open' : ''} data-tip="Above target reps">
            <ArrowLineUpRight onClick={handleClick} size={22} />
          </div>
        );
      } else if (reps < repsTarget) {
        return (
          <div className={isOpen ? 'tooltip tooltip-open' : ''} data-tip="Below target reps">
            <ArrowLineDownRight onClick={handleClick} size={22} />
          </div>
        );
      } else {
        return (
          <div className={isOpen ? 'tooltip tooltip-open' : ''} data-tip="Met target reps">
            <Target onClick={handleClick} size={22} />
          </div>
        );
      }
    } else {
      return null;
    }
  }
  return null;
});

export default Porn;

Porn.propTypes = {
  finishedAt: string,
  reps: number,
  repsTarget: number,
  status: string,
};
