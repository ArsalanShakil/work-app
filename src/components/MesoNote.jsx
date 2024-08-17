import {bool, func, object, string} from 'prop-types';
import {Fragment, useEffect, useState} from 'react';

import {useCreateMesoNote, useDeleteMesoNote, useUpdateMesoNote} from '../api.js';
import {useMutationCallback} from '../utils/hooks.js';
import NoteDialog from './dialogs/NoteDialog.jsx';
import Expander from './ui/Expander.jsx';
import NoteDefault from './ui/NoteDefault.jsx';

export default function MesoNote({mesoKey, mesoNote, isNewNoteOpen, onNewNoteClose}) {
  const [isOpen, setIsOpen] = useState(isNewNoteOpen || false);
  const [isExpanded, setIsExpanded] = useState(false);

  const createMesoNote = useCreateMesoNote(mesoKey);
  const updateMesoNote = useUpdateMesoNote(mesoKey, mesoNote?.id);
  const deleteMesoNote = useDeleteMesoNote(mesoKey, mesoNote?.id);

  const handleClose = useMutationCallback(() => {
    setIsOpen(false);
    if (onNewNoteClose) {
      onNewNoteClose();
    }
  }, [onNewNoteClose]);

  const handleCreate = useMutationCallback(
    text => createMesoNote.mutate({text}, {onSuccess: handleClose}),
    [createMesoNote, handleClose]
  );
  const handleUpdate = useMutationCallback(
    text => updateMesoNote.mutate({text}, {onSuccess: handleClose}),
    [handleClose, updateMesoNote]
  );
  const handleDelete = useMutationCallback(
    () => deleteMesoNote.mutate(null, {onSuccess: handleClose}),
    [deleteMesoNote, handleClose]
  );

  useEffect(() => {
    if (isNewNoteOpen !== null && isNewNoteOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [isOpen, isNewNoteOpen]);

  useEffect(() => {
    if (mesoNote) {
      setIsExpanded(true);
    }
  }, [mesoNote]);

  useEffect(() => {
    if (deleteMesoNote.isSuccess) {
      setIsExpanded(false);
    }
  }, [deleteMesoNote.isSuccess]);

  return (
    <Fragment>
      <Expander isOpen={isExpanded}>
        {mesoNote?.id && (
          <NoteDefault
            noteText={mesoNote?.text}
            isSaving={updateMesoNote.isWorking}
            isDeleting={deleteMesoNote.isWorking}
            onOpen={() => setIsOpen(true)}
          />
        )}
      </Expander>
      <NoteDialog
        title="Mesocycle Note"
        noteText={isNewNoteOpen ? '' : mesoNote?.text}
        isOpen={isOpen}
        isSaving={createMesoNote.isWorking || updateMesoNote.isWorking}
        isDeleting={deleteMesoNote.isWorking}
        onClose={handleClose}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Fragment>
  );
}

MesoNote.propTypes = {
  mesoKey: string.isRequired,
  mesoNote: object,

  isNewNoteOpen: bool,
  onNewNoteClose: func,
};
