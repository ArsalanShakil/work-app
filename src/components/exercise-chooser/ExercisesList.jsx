import {bool, func, number, object} from 'prop-types';
import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FixedSizeList as List} from 'react-window';

import {isNum} from '../../../../../lib/math.mjs';
import {getSortedBy} from '../../../../../lib/sort.mjs';
import {useUserProfile} from '../../api.js';
import {LIST_ITEM_HEIGHT} from '../../constants.js';
import {
  useActiveExercises,
  useDebounce,
  useExercisesById,
  useMuscleGroupsById,
} from '../../utils/hooks.js';
import ExerciseRepeatSwitch from '../ExerciseRepeatSwitch.jsx';
import ListItem from '../ui/ListItem.jsx';
import ListItemBadge from '../ui/ListItemBadge.jsx';
import ListWrapper from '../ui/ListWrapper.jsx';
import SearchInput from '../ui/SearchInput.jsx';
import EmptyExerciseRow from './EmptyExerciseRow.jsx';
import ExerciseFiltersHeader from './ExerciseFiltersHeader.jsx';

const ExercisesList = memo(function ExercisesList({
  isWorking,
  focusedExerciseId,
  pageNumber,
  onSelectExercise,
  onRemoveExercise,
  onFocus,
  onOpenFilters,
  filters,
  onClearFilters,
  onCustom,
  offerRepeat,
  repeat,
  onRepeatChange,
}) {
  const {data: user} = useUserProfile();
  const containerRef = useRef();
  const listRef = useRef();
  const exercises = useActiveExercises(user.id);
  const [listHeight, setListHeight] = useState(0);

  const muscleGroupsById = useMuscleGroupsById();
  const exercisesById = useExercisesById();

  const [searchText, setSearchText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const debouncedOnChange = useDebounce(() => setSearchFilter(searchText));

  const handleSearchChange = useCallback(
    value => {
      debouncedOnChange();
      setSearchText(value);
    },
    [debouncedOnChange]
  );

  const handleClearSearch = useCallback(() => {
    debouncedOnChange();
    setSearchText('');
  }, [debouncedOnChange]);

  const initialIndex = useRef();

  const exerciseList = useMemo(() => {
    const list = [];

    if (exercises?.all) {
      for (const ex of exercises.all) {
        const mgMatch = filters.muscleGroupId ? filters.muscleGroupId === ex.muscleGroupId : true;
        const typeMatch = filters.exerciseType ? filters.exerciseType === ex.exerciseType : true;
        const authorMatch =
          filters.author === 'custom'
            ? ex.userId === user.id
            : filters.author === 'rp'
            ? ex.userId === null
            : true;

        const searchMatch = searchFilter
          ? ex.name.toLowerCase().includes(searchFilter.toLowerCase())
          : true;

        if (mgMatch && typeMatch && authorMatch && searchMatch) {
          list.push({
            id: ex.id,
            isLoading: !!focusedExerciseId && focusedExerciseId === ex.id && isWorking,
            name: ex.name,
            header: muscleGroupsById[ex?.muscleGroupId]?.name,
            selected: !!focusedExerciseId && focusedExerciseId === ex.id,
            badges: [
              <ListItemBadge
                key="list-item-badge"
                label={exercisesById[ex.id]?.exerciseType.replace('-', ' ')}
                className="uppercase"
              />,
            ],
            onFocus,
            onRemove: onRemoveExercise ? () => onRemoveExercise(ex) : null,
            onSelect: onSelectExercise,
          });

          if (ex.id === focusedExerciseId) {
            initialIndex.current = list.length - 1;
          }
        }
      }
      getSortedBy(list, e => e.createdAt, {descending: true});
    }

    return list;
  }, [
    exercises.all,
    exercisesById,
    filters.author,
    filters.exerciseType,
    filters.muscleGroupId,
    focusedExerciseId,
    isWorking,
    muscleGroupsById,
    onFocus,
    onRemoveExercise,
    onSelectExercise,
    searchFilter,
    user.id,
  ]);

  useEffect(() => {
    if (listHeight === 0 && containerRef.current && exerciseList.length) {
      setListHeight(containerRef.current.clientHeight);
    }
  }, [listHeight, exerciseList.length]);

  useEffect(() => {
    if (isNum(initialIndex.current) && initialIndex.current > 3) {
      listRef.current.scrollToItem(initialIndex.current - 1, 'smart');
    }
  }, []);

  return (
    <Fragment>
      <div className="px-4 pb-4">
        <SearchInput onChange={handleSearchChange} onClear={handleClearSearch} value={searchText} />
      </div>

      <ExerciseFiltersHeader filters={filters} onClear={onClearFilters} onOpen={onOpenFilters} />

      {exerciseList.length > 0 && (
        <div ref={containerRef} className="flex grow flex-col bg-base-100 pl-4 dark:bg-base-200">
          <List
            ref={listRef}
            height={listHeight}
            itemCount={exerciseList.length + 1}
            itemSize={LIST_ITEM_HEIGHT}
            itemData={{
              list: exerciseList,
              pageNumber,
              emptyRow: <EmptyExerciseRow onClick={onCustom} />,
            }}
            innerElementType={ListWrapper}
            overscanCount={2}
          >
            {props => <ListItem {...props} />}
          </List>
        </div>
      )}

      {exerciseList.length > 0 && offerRepeat && (
        <div className="shrink-0 border-t px-4 py-2 pb-safe-offset-2 dark:border-base-300/40">
          <ExerciseRepeatSwitch repeat={repeat} onChange={onRepeatChange} />
        </div>
      )}

      {exerciseList.length === 0 && (
        <div className="m-auto flex flex-col space-y-4 text-center">
          <h4>No exercises match your results.</h4>

          {(filters.muscleGroupId || filters.author || filters.exerciseType) && (
            <button onClick={onClearFilters} className="btn btn-sm">
              clear filters
            </button>
          )}

          {searchFilter && (
            <button onClick={handleClearSearch} className="btn btn-sm">
              clear search
            </button>
          )}

          <button onClick={onCustom} className="btn btn-sm">
            Create custom exercise
          </button>
        </div>
      )}
    </Fragment>
  );
});

export default ExercisesList;

ExercisesList.propTypes = {
  isWorking: bool,
  focusedExerciseId: number,
  initialFilters: object,
  onOpenFilters: func.isRequired,
  onSelectExercise: func.isRequired,
  onRemoveExercise: func,
  pageNumber: number.isRequired,
  onFocus: func.isRequired,
  filters: object,
  onClearFilters: func.isRequired,
  onCustom: func.isRequired,
  offerRepeat: bool,
  repeat: bool.isRequired,
  onRepeatChange: func.isRequired,
};
