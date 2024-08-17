import {Plus} from '@phosphor-icons/react';
import {bool, func, number} from 'prop-types';
import {Fragment, useCallback, useState} from 'react';

import {useExercisesById, useMutationCallback} from '../../utils/hooks.js';
import ExerciseForm from '../ExerciseForm.jsx';
import ExerciseRepeatSwitch from '../ExerciseRepeatSwitch.jsx';
import BottomSheet from '../sheet/BottomSheet.jsx';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetNavButton from '../sheet/SheetNavButton.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import ExerciseDetailPage from './ExerciseDetailPage.jsx';
import ExerciseFilters from './ExerciseFilters.jsx';
import ExercisesList from './ExercisesList.jsx';
import PositionInfo from './PositionInfo.jsx';

export default function ExercisePicker({
  exerciseId,
  isWorking,
  muscleGroupId,
  onRemoveExercise,
  onSelectExercise,
  offerRepeat,
  onClose,
}) {
  const [page, setPage] = useState(1);
  const [repeat, setRepeat] = useState(true);
  const [focusedExerciseId, setFocusedExerciseId] = useState(exerciseId);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customFormOpen, setCustomFormOpen] = useState(false);

  const [filters, setFilters] = useState({
    muscleGroupId: muscleGroupId,
    exerciseType: null,
    author: null,
  });

  const handleClearFilters = useCallback(() => {
    setFilters({
      muscleGroupId: null,
      exerciseType: null,
      author: null,
    });
  }, [setFilters]);

  const handleFocus = useCallback(exerciseId => {
    setFocusedExerciseId(exerciseId);
    setPage(2);
  }, []);

  const handleCustomExercise = useMutationCallback(
    (exerciseId, updatedExercises) => onSelectExercise({exerciseId, repeat, updatedExercises}),
    [onSelectExercise, repeat]
  );

  const exercisesById = useExercisesById();

  const openCustomExercisePage = useCallback(() => {
    setCustomFormOpen(true);
  }, []);

  const closeCustomExercisePage = useCallback(() => setCustomFormOpen(false), []);

  const openFirstPage = useCallback(() => setPage(1), []);

  const handleSelectExercise = useCallback(
    exerciseId => {
      setFocusedExerciseId(exerciseId); // TODO: Might not need this? Aren't we closing the dialog after we select an exercise
      onSelectExercise({exerciseId, repeat});
    },
    [onSelectExercise, repeat]
  );

  const handleRepeat = useCallback(e => setRepeat(e.target.checked), []);

  const handleOpenFilters = useCallback(() => setFiltersOpen(true), []);

  return (
    <Fragment>
      <div className="mt-2">
        <SheetTitle title="Exercises" currentPage={page} pageNumber={1} variant="xl">
          {/* TODO: We may want this to work mid workout as well, not just on the board*/}
          {!offerRepeat && <PositionInfo pageNumber={1} />}
        </SheetTitle>

        <SheetTitle
          title={exercisesById[focusedExerciseId]?.name}
          currentPage={page}
          pageNumber={2}
        >
          <PositionInfo pageNumber={2} />
        </SheetTitle>
      </div>

      <SheetNav handleClose={onClose}>
        <SheetNavButton
          label={<span className="text-accent">Create custom</span>}
          icon={<Plus size={20} className="mr-0.5 text-accent" />}
          currentPage={page}
          pageNumber={1}
          onClick={openCustomExercisePage}
        />

        <SheetNavButton
          label="Exercises"
          currentPage={page}
          pageNumber={2}
          onClick={openFirstPage}
        />
      </SheetNav>

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={page} pageNumber={1}>
          <ExercisesList
            focusedExerciseId={focusedExerciseId}
            isWorking={isWorking}
            pageNumber={1}
            onSelectExercise={handleSelectExercise}
            onRemoveExercise={onRemoveExercise}
            onFocus={handleFocus}
            filters={filters}
            offerRepeat={offerRepeat}
            onClearFilters={handleClearFilters}
            onOpenFilters={handleOpenFilters}
            onCustom={openCustomExercisePage}
            repeat={repeat}
            onRepeatChange={handleRepeat}
          />
        </SheetPage>

        <ExerciseDetailPage
          pageNumber={2}
          currentPage={page}
          onSelect={handleSelectExercise}
          onRemoveExercise={onRemoveExercise}
          focusedExerciseId={focusedExerciseId}
        />
      </div>

      <ExerciseFilters
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={filters}
        setFilters={setFilters}
      />

      <BottomSheet
        isOpen={customFormOpen}
        onClose={closeCustomExercisePage}
        title="Custom exercise"
      >
        <div className="px-4">
          <ExerciseForm
            onClose={closeCustomExercisePage}
            muscleGroupId={muscleGroupId}
            onSuccess={handleCustomExercise}
            saveLabel={`Create and ${muscleGroupId ? 'Replace' : 'Add'}`}
          >
            {offerRepeat && <ExerciseRepeatSwitch repeat={repeat} onChange={handleRepeat} />}
          </ExerciseForm>
        </div>
      </BottomSheet>
    </Fragment>
  );
}

ExercisePicker.propTypes = {
  exerciseId: number,
  isWorking: bool,
  muscleGroupId: number,
  onClose: func.isRequired,
  offerRepeat: bool,
  onRemoveExercise: func,
  onSelectExercise: func.isRequired,
};
