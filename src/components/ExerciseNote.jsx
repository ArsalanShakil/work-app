import {bool, func, object} from 'prop-types';
import {Fragment, useEffect, useState} from 'react';

import {useCreateExerciseNote, useDeleteExerciseNote, useUpdateExerciseNote} from '../api.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import NoteDialog from './dialogs/NoteDialog.jsx';
import Expander from './ui/Expander.jsx';
import NoteDefault from './ui/NoteDefault.jsx';

export default function ExerciseNote({
  dayExercise,
  exercise,
  exerciseNote,
  isNewNoteOpen,
  onNewNoteClose,
  hidePin,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const createExerciseNote = useCreateExerciseNote(exercise.id);
  const updateExerciseNote = useUpdateExerciseNote(exercise.id, exerciseNote?.id);
  const deleteExerciseNote = useDeleteExerciseNote(exercise.id, exerciseNote?.id);

  const {showNotification} = useNotifierContext();
  const isPinned = !exerciseNote?.dayExerciseId;

  const handleClose = useMutationCallback(() => {
    setIsOpen(false);
    if (onNewNoteClose) {
      onNewNoteClose();
    }
  }, [onNewNoteClose]);

  const handleCreate = useMutationCallback(
    text =>
      createExerciseNote.mutate({text, dayExerciseId: dayExercise?.id}, {onSuccess: handleClose}),
    [createExerciseNote, dayExercise?.id, handleClose]
  );
  const handleUpdate = useMutationCallback(
    text => updateExerciseNote.mutate({text}, {onSuccess: handleClose}),
    [handleClose, updateExerciseNote]
  );
  const handlePin = useMutationCallback(
    cb => {
      if (isPinned && !dayExercise) {
        showNotification({
          message: 'Unable to un-pin exercise note',
          type: 'info',
          autoClose: true,
        });
      } else {
        updateExerciseNote.mutate(
          {dayExerciseId: isPinned ? dayExercise.id : null},
          {onSuccess: cb}
        );
      }
    },
    [dayExercise, isPinned, showNotification, updateExerciseNote]
  );
  const handleDelete = useMutationCallback(
    () => deleteExerciseNote.mutate(null, {onSuccess: handleClose}),
    [deleteExerciseNote, handleClose]
  );

  useEffect(() => {
    if (isNewNoteOpen !== null && isNewNoteOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [isNewNoteOpen, isOpen]);

  useEffect(() => {
    if (exerciseNote) {
      setIsExpanded(true);
    }
  }, [exerciseNote]);

  useEffect(() => {
    if (deleteExerciseNote.isSuccess) {
      setIsExpanded(false);
    }
  }, [deleteExerciseNote.isSuccess]);

  return (
    <Fragment>
      <Expander isOpen={isExpanded}>
        {exerciseNote?.id && (
          <NoteDefault
            noteText={exerciseNote?.text}
            isPinned={isPinned}
            isSaving={updateExerciseNote.isWorking}
            isDeleting={deleteExerciseNote.isWorking}
            onOpen={() => setIsOpen(true)}
            onPin={hidePin ? null : handlePin}
          />
        )}
      </Expander>
      <NoteDialog
        title="Exercise Note"
        description={`For: ${exercise.name}`}
        noteText={isNewNoteOpen ? '' : exerciseNote?.text}
        isOpen={isOpen}
        isSaving={createExerciseNote.isWorking || updateExerciseNote.isWorking}
        isDeleting={deleteExerciseNote.isWorking}
        onClose={handleClose}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Fragment>
  );
}

ExerciseNote.propTypes = {
  dayExercise: object,
  exercise: object.isRequired,
  exerciseNote: object,
  isNewNoteOpen: bool,
  onNewNoteClose: func,
  hidePin: bool,
};
