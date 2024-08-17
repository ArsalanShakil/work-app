import {bool, func} from 'prop-types';
import {useParams} from 'react-router-dom';

import {useMesocycle} from '../api.js';
import Checkbox from './ui/Checkbox.jsx';

export default function ExerciseRepeatSwitch({repeat, onChange}) {
  const {mesoKey, week} = useParams();
  const {data: meso} = useMesocycle(mesoKey);
  const isDeloadLoadWeek = meso.weeks.length === Number(week);

  if (isDeloadLoadWeek) {
    return null;
  }

  return (
    <Checkbox checked={repeat} label="Repeat until the end of this mesocycle" onChange={onChange} />
  );
}

ExerciseRepeatSwitch.propTypes = {
  repeat: bool.isRequired,
  onChange: func.isRequired,
};
