import {Plus} from '@phosphor-icons/react';
import {func} from 'prop-types';

import {useTemplateFilterResetCallback} from '../../utils/hooks.js';
import useLocalStore from '../../utils/useLocalStore.js';

export default function TemplateFiltersHeader({onOpen}) {
  const onClear = useTemplateFilterResetCallback();
  const templateFilterSex = useLocalStore(st => st.templateFilterSex);
  const templateFilterEmphasis = useLocalStore(st => st.templateFilterEmphasis);
  const templateFilterNumberOfDays = useLocalStore(st => st.templateFilterNumberOfDays);

  const showAddFilterButton =
    !templateFilterSex || !templateFilterEmphasis || !templateFilterNumberOfDays;

  return (
    <div className="filter-bar-container border-y dark:border-base-200">
      <div className="flex items-center gap-2">
        {!!templateFilterEmphasis && (
          <button onClick={onOpen} className="btn btn-secondary btn-xs rounded-3xl font-medium">
            {templateFilterEmphasis}
          </button>
        )}

        {!!templateFilterNumberOfDays && (
          <button onClick={onOpen} className="btn btn-secondary btn-xs rounded-3xl font-medium">
            {templateFilterNumberOfDays} workouts
          </button>
        )}

        {!!templateFilterSex && (
          <button onClick={onOpen} className="btn btn-secondary btn-xs rounded-3xl font-medium">
            {templateFilterSex}
          </button>
        )}

        {showAddFilterButton && (
          <button
            onClick={onOpen}
            className="btn btn-xs rounded-3xl font-normal capitalize text-base-content"
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

TemplateFiltersHeader.propTypes = {
  onOpen: func.isRequired,
};
