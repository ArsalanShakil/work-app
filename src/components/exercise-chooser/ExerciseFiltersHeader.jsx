import {Plus} from '@phosphor-icons/react';
import {func, object} from 'prop-types';

import {exerciseTypeNamesById} from '../../constants.js';
import {useMuscleGroupsById} from '../../utils/hooks.js';

export default function ExerciseFiltersHeader({filters, onClear, onOpen}) {
  const muscleGroupsById = useMuscleGroupsById();

  const showAddFilterButton = !filters.author || !filters.muscleGroupId || !filters.exerciseType;

  return (
    <div className="filter-bar-container z-10 border-y dark:border-base-200 dark:bg-base-100">
      <div className="flex items-center gap-2">
        {!!filters.muscleGroupId && (
          <button onClick={onOpen} className="btn btn-secondary btn-xs rounded-3xl font-medium">
            {muscleGroupsById[filters.muscleGroupId].name}
          </button>
        )}

        {!!filters.exerciseType && (
          <button onClick={onOpen} className="btn btn-secondary btn-xs rounded-3xl font-medium">
            {exerciseTypeNamesById[filters.exerciseType]}
          </button>
        )}

        {!!filters.author && (
          <button onClick={onOpen} className="btn btn-secondary btn-xs rounded-3xl font-medium">
            {filters.author}
          </button>
        )}

        {showAddFilterButton && (
          <button
            onClick={onOpen}
            className="btn btn-xs rounded-3xl font-normal uppercase text-base-content"
          >
            <Plus size={17} />
            filter
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-xs" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

ExerciseFiltersHeader.propTypes = {
  filters: object.isRequired,
  onClear: func.isRequired,
  onOpen: func.isRequired,
};
