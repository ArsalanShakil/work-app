import {X} from '@phosphor-icons/react';
import {bool, func, object} from 'prop-types';
import {Fragment, useCallback, useEffect, useState} from 'react';

import {useExerciseTypes, useMuscleGroups} from '../../api.js';
import {exerciseTypeNamesById} from '../../constants.js';
import FilterButton from '../ui/FilterButton.jsx';

export default function ExerciseFilters({filtersOpen, setFiltersOpen, filters, setFilters}) {
  const {data: muscleGroups} = useMuscleGroups();
  const {data: exerciseTypes} = useExerciseTypes();

  const [mgId, setMgId] = useState(filters.muscleGroupId);
  const [type, setType] = useState(filters.exerciseType);
  const [author, setAuthor] = useState(filters.author);

  const handleApply = useCallback(() => {
    setFilters(filters => ({
      ...filters,
      muscleGroupId: mgId,
      exerciseType: type,
      author: author,
    }));
    setFiltersOpen(false);
  }, [author, mgId, setFilters, setFiltersOpen, type]);

  const handleClose = useCallback(() => {
    setFiltersOpen(false);
  }, [setFiltersOpen]);

  useEffect(() => {
    setMgId(filters.muscleGroupId);
    setType(filters.exerciseType);
    setAuthor(filters.author);
  }, [filters]);

  const classes = `absolute inset-0 top-12 bg-base-100 ${
    filtersOpen ? 'translate-y-0' : 'translate-y-full'
  } duration-300 rounded-t-xl transition ease-in-out dark:bg-base-200`;

  // TODO: Refactor to use BottomSheet component

  return (
    <Fragment>
      <div
        onClick={handleClose}
        className={`absolute inset-0 transition duration-100 ease-in-out ${
          filtersOpen ? 'translate-y-0' : 'translate-y-full'
        } `}
      >
        <div
          className={`absolute inset-0 bg-base-300/50 transition duration-500 dark:bg-base-300 ${
            filtersOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className={classes} style={{boxShadow: filtersOpen ? '0px 0px 4px 0px #999' : ''}}>
        <div className="flex h-full w-full flex-col pb-4 standalone:pb-safe-offset-4">
          <div className="flex shrink-0 justify-end px-4 pt-4">
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setFiltersOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="border-b px-4 pb-2 dark:border-base-300/60">
            <h3 className="text-xl font-semibold">Exercise filters</h3>
          </div>

          <div className="min-h-0 grow overflow-auto">
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <h4 className="font-medium">Muscle groups</h4>

                <div className=" grid grid-cols-2 gap-4 desktop:p-0">
                  {muscleGroups.map(mg => (
                    <FilterButton
                      key={mg.id}
                      onClick={() => setMgId(mgId === mg.id ? null : mg.id)}
                      active={mg.id === mgId}
                    >
                      {mg.name}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pb-6">
                <h4 className="font-medium">Author</h4>

                <div className="grid grid-cols-2 gap-4 desktop:p-0">
                  <FilterButton
                    onClick={() => setAuthor(author === 'rp' ? null : 'rp')}
                    active={author === 'rp'}
                  >
                    RP Strength
                  </FilterButton>

                  <FilterButton
                    onClick={() => setAuthor(author === 'custom' ? null : 'custom')}
                    active={author === 'custom'}
                  >
                    Custom
                  </FilterButton>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Exercise types</h4>

                <div className=" grid grid-cols-2 gap-4 desktop:p-0">
                  {exerciseTypes?.map(et => (
                    <FilterButton
                      key={et.key}
                      onClick={() => setType(type === et.key ? null : et.key)}
                      active={et.key === type}
                    >
                      {exerciseTypeNamesById[et.key]}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-4 border-t px-4 pt-4 dark:border-base-300/60">
            <button onClick={handleClose} className="btn btn-ghost">
              cancel
            </button>
            <button onClick={handleApply} className="btn btn-accent">
              apply
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

ExerciseFilters.propTypes = {
  filtersOpen: bool.isRequired,
  setFiltersOpen: func.isRequired,
  filters: object.isRequired,
  setFilters: func.isRequired,
};
