import {bool, func, object} from 'prop-types';
import {Fragment, useEffect, useState} from 'react';

import {useCreateDayNote, useDeleteDayNote, useUpdateDayNote} from '../api.js';
import {useMutationCallback} from '../utils/hooks.js';
import NoteDialog from './dialogs/NoteDialog.jsx';
import Expander from './ui/Expander.jsx';
import NoteDefault from './ui/NoteDefault.jsx';

export default function MesoDayNote({day, dayNote, isNewNoteOpen, onNewNoteClose}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const createDayNote = useCreateDayNote(day.id);
  const updateDayNote = useUpdateDayNote(day.id, dayNote?.id);
  const deleteDayNote = useDeleteDayNote(day.id, dayNote?.id);

  const isPinned = dayNote?.pinned;

  const handleClose = useMutationCallback(() => {
    setIsOpen(false);
    if (onNewNoteClose) {
      onNewNoteClose();
    }
  }, [onNewNoteClose]);

  const handleCreate = useMutationCallback(
    text => createDayNote.mutate({text}, {onSuccess: handleClose}),
    [createDayNote, handleClose]
  );
  const handleUpdate = useMutationCallback(
    text => updateDayNote.mutate({text}, {onSuccess: handleClose}),
    [handleClose, updateDayNote]
  );
  const handlePin = useMutationCallback(
    cb => updateDayNote.mutate({pinned: !isPinned}, {onSuccess: cb}),
    [isPinned, updateDayNote]
  );
  const handleDelete = useMutationCallback(
    () => deleteDayNote.mutate(null, {onSuccess: handleClose}),
    [deleteDayNote, handleClose]
  );

  useEffect(() => {
    if (isNewNoteOpen !== null && isNewNoteOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [isNewNoteOpen, isOpen]);

  useEffect(() => {
    if (dayNote) {
      setIsExpanded(true);
    }
  }, [dayNote]);

  useEffect(() => {
    if (deleteDayNote.isSuccess) {
      setIsExpanded(false);
    }
  }, [deleteDayNote.isSuccess]);

  return (
    <Fragment>
      <Expander isOpen={isExpanded}>
        {dayNote?.id && (
          <NoteDefault
            noteText={dayNote?.text}
            isPinned={isPinned}
            isSaving={updateDayNote.isWorking}
            isDeleting={deleteDayNote.isWorking}
            onOpen={() => setIsOpen(true)}
            onPin={handlePin}
          />
        )}
      </Expander>
      <NoteDialog
        title="Day Note"
        noteText={isNewNoteOpen ? '' : dayNote?.text}
        isOpen={isOpen}
        isSaving={createDayNote.isWorking || updateDayNote.isWorking}
        isDeleting={deleteDayNote.isWorking}
        onClose={handleClose}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Fragment>
  );
}

MesoDayNote.propTypes = {
  day: object.isRequired,
  dayNote: object,

  isNewNoteOpen: bool,
  onNewNoteClose: func,
};
