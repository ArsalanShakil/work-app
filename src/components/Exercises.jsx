import {DotsThreeVertical, Pencil, Plus, Trash, Wrench, YoutubeLogo} from '@phosphor-icons/react';
import {useCallback, useState} from 'react';

import {getSortedBy} from '../../../../lib/sort.mjs';
import {useDeleteExercise, useUserProfile} from '../api.js';
import {exerciseTypeNamesById} from '../constants.js';
import {useActiveExercises, useMuscleGroupsById, useMutationCallback} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import ExerciseDialog from './ExerciseDialog.jsx';
import ExerciseNote from './ExerciseNote.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';
import Dialog from './ui/Dialog.jsx';
import EmptyState from './ui/EmptyState.jsx';
import IconButton from './ui/IconButton.jsx';
import {MenuButton} from './ui/MenuItem.jsx';
import Video from './Video.jsx';

export default function Exercises() {
  const {data: user} = useUserProfile();

  const exercises = useActiveExercises(user.id);
  const muscleGroupsById = useMuscleGroupsById();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [createNoteExerciseId, setCreateNoteExerciseId] = useState(null);
  const [exercise, setExercise] = useState();

  const deleteExercise = useDeleteExercise(exercise?.id);
  const isDesktop = useLocalStore(st => st.isDesktop);

  const handleVideoOpen = useCallback(cex => {
    setExercise(cex);
    setIsVideoOpen(true);
  }, []);

  const handleVideoClose = useCallback(() => {
    setIsVideoOpen(false);
    runAfterAnimations(() => {
      setExercise(null);
    });
  }, []);

  const handleFormOpen = useCallback(cex => {
    setExercise(cex);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useMutationCallback(() => {
    setIsFormOpen(false);
    runAfterAnimations(() => {
      setExercise(null);
    });
  }, []);

  const handleDeleteOpen = useCallback(cex => {
    setExercise(cex);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteClose = useMutationCallback(() => {
    setIsDeleteOpen(false);
    runAfterAnimations(() => {
      setExercise(null);
    });
  }, []);

  const handleDeleteExercise = useMutationCallback(() => {
    deleteExercise.mutate(null, {onSuccess: handleDeleteClose});
  }, [deleteExercise, handleDeleteClose]);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col desktop:block desktop:px-4">
      <div className="flex shrink-0 items-center justify-between border-b p-4 dark:border-base-200 desktop:border-none desktop:px-0 desktop:py-8">
        <h1 className="text-2xl font-semibold text-base-content desktop:text-3xl desktop:font-bold">
          Custom exercises
        </h1>

        <button
          className="btn btn-xs flex items-center desktop:btn-accent desktop:btn-sm"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus size={isDesktop ? 19 : 17} />
          New
        </button>
      </div>

      <ul
        role="list"
        className="min-h-0 grow divide-y divide-base-200 overflow-auto overscroll-contain bg-base-100 pl-4 pb-safe-offset-0 dark:divide-base-300/40 dark:bg-base-200/80 desktop:grow-0 desktop:overflow-visible"
      >
        {exercises.custom.length === 0 && (
          <div className="my-4 mr-4 desktop:py-4">
            <EmptyState
              title="No exercises"
              description="Your custom exercises will appear here."
            />
          </div>
        )}

        {getSortedBy(exercises.custom, cex => cex.createdAt, {descending: true}).map(cex => {
          return (
            <li key={cex.id} className="py-4">
              <div className="mr-4 flex min-w-0 justify-between">
                <div className="grow truncate">
                  <p className="text-xs uppercase text-base-content/60">
                    {muscleGroupsById[cex.muscleGroupId]?.name}
                  </p>
                  <p className="truncate text-base-content">{cex.name}</p>
                  <p className="text-xs capitalize text-base-content/60">
                    {exerciseTypeNamesById[cex.exerciseType]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center space-x-3 pl-2">
                  {cex.youtubeId && (
                    <IconButton
                      title="See video"
                      icon={<YoutubeLogo />}
                      onClick={() => handleVideoOpen(cex)}
                    />
                  )}
                  <IconButton icon={<DotsThreeVertical weight="bold" />}>
                    <MenuButton
                      onClick={() => handleFormOpen(cex)}
                      label="Edit exercise"
                      icon={<Wrench size={16} />}
                    />
                    <MenuButton
                      onClick={() => setCreateNoteExerciseId(cex.id)}
                      label="Add exercise note"
                      icon={<Pencil size={16} />}
                    />
                    <MenuButton
                      className="text-rose-500 hover:bg-rose-100 disabled:text-rose-300 disabled:hover:bg-rose-50"
                      onClick={() => handleDeleteOpen(cex)}
                      label="Delete exercise"
                      icon={<Trash size={16} />}
                    />
                  </IconButton>
                </div>
              </div>

              <div className={`mr-4 ${cex.notes.length ? 'mb-1 mt-2' : ''}`}>
                {cex?.notes
                  .filter(n => !n.dayExerciseId)
                  .map(exerciseNote => (
                    <ExerciseNote
                      key={`exercise-note-${exerciseNote.id}`}
                      exercise={cex}
                      exerciseNote={exerciseNote}
                      hidePin
                    />
                  ))}

                <ExerciseNote
                  exercise={cex}
                  isNewNoteOpen={createNoteExerciseId === cex.id}
                  onNewNoteClose={() => setCreateNoteExerciseId(false)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {isDesktop && <div className="h-48" />}

      <ExerciseDialog exercise={exercise} isOpen={isFormOpen} onClose={handleFormClose} />

      <ConfirmDialog
        title="Delete custom exercise?"
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteExercise}
        isLoading={deleteExercise.isWorking}
        description="Deleting an exercise will remove it from the list of available exercises but will not remove it from any mesocycles that have already been created."
        confirmButtonText="Delete"
        confirmText="delete exercise"
        variant="error"
        message="This cannot be undone"
      />

      <Dialog isOpen={isVideoOpen} onClose={handleVideoClose} size="lg">
        <div className="flex items-center justify-center bg-black">
          <Video id={exercise?.youtubeId} onClose={handleVideoClose} />
        </div>
      </Dialog>
    </div>
  );
}
