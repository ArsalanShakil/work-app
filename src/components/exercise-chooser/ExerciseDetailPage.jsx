import {func, number} from 'prop-types';
import {useMemo} from 'react';

import {useExercisesById} from '../../utils/hooks.js';
import ExerciseNote from '../ExerciseNote.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import Video from '../Video.jsx';

export default function ExerciseDetailPage({currentPage, pageNumber, onSelect, focusedExerciseId}) {
  const exercisesById = useExercisesById();

  const exercise = exercisesById[focusedExerciseId];

  const exerciseNotes = useMemo(() => {
    return exercise?.notes.filter(n => !n.dayExerciseId);
  }, [exercise?.notes]);

  return (
    <SheetPage currentPage={currentPage} pageNumber={pageNumber}>
      <div className="flex h-full w-full flex-col justify-between p-4 standalone:pb-safe-offset-4">
        <div className="flex h-full flex-col gap-6">
          <div className="flex aspect-video w-full items-center justify-center bg-base-200">
            {exercise?.youtubeId && currentPage === pageNumber && (
              <Video disabled={currentPage !== pageNumber} id={exercise?.youtubeId} />
            )}

            {!exercise?.youtubeId && (
              <div className="space-y-2 px-4 text-center">
                <p className="text-xl text-base-content">No video</p>
                {exercise?.userId ? (
                  <p className="text-base-content">
                    You can add a YouTube link to this exercise by navigating to custom exercises.
                  </p>
                ) : (
                  <p className="text-base-content">
                    Whoops, we don&apos;t appear to have a video for this exercise
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Exercise type</h4>
            <p className="text-sm uppercase">{exercise?.exerciseType.replace('-', ' ')}</p>
          </div>

          {exerciseNotes?.length > 0 && (
            <div className="z-40 space-y-2">
              <h4 className="font-semibold">Notes</h4>
              <div className="">
                {exerciseNotes.map(n => (
                  <div key={`exercise-note-${n.id}`} className="my-0.5 overflow-hidden rounded-lg">
                    <ExerciseNote exercise={exercise} exerciseNote={n} hidePin />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => onSelect(focusedExerciseId)} className="btn btn-accent w-full">
          Select
        </button>
      </div>
    </SheetPage>
  );
}

ExerciseDetailPage.propTypes = {
  pageNumber: number.isRequired,
  currentPage: number.isRequired,
  onSelect: func.isRequired,
  focusedExerciseId: number,
};
