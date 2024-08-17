import {object} from 'prop-types';

import {useExercisesById, useMuscleGroupsById} from '../../utils/hooks.js';
import SecondaryBadge from './SecondaryBadge.jsx';

export default function SlotPreviewRow({slot, progression}) {
  const muscleGroupsById = useMuscleGroupsById();
  const exercisesById = useExercisesById();

  return (
    <li className="py-2 pr-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base-content">{muscleGroupsById[slot.muscleGroupId]?.name}</h4>
          <p className="text-xs text-base-content/70">{exercisesById[slot.exerciseId]?.name}</p>
        </div>
        {progression?.mgProgressionType === 'slow' && <SecondaryBadge />}
      </div>
    </li>
  );
}

SlotPreviewRow.propTypes = {
  slot: object.isRequired,
  progression: object,
};
