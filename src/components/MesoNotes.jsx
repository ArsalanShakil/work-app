import {CaretRight, Plus} from '@phosphor-icons/react';
import {func} from 'prop-types';
import {Fragment, useCallback, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useCreateMesoNote, useDeleteMesoNote, useUpdateMesoNote} from '../api.js';
import {useMesoDay, useMutationCallback} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetNavButton from './sheet/SheetNavButton.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import EmptyState from './ui/EmptyState.jsx';

export default function MesoNotes({onClose}) {
  const {meso} = useMesoDay();

  const [page, setPage] = useState(1);
  const [note, setNote] = useState(null);
  const [text, setText] = useState('');

  const trimmedText = text?.trim() || '';
  const trimmedNoteText = note?.text?.trim() || '';
  const isNewNote = !trimmedNoteText;
  const isSaveable = trimmedText !== '' && (isNewNote ? true : trimmedText !== trimmedNoteText);

  const {mesoKey} = useParams();
  const createMesoNote = useCreateMesoNote(mesoKey);
  const updateMesoNote = useUpdateMesoNote(mesoKey, note?.id);
  const deleteMesoNote = useDeleteMesoNote(mesoKey, note?.id);

  const handlePage1 = useCallback(() => {
    setPage(1);
    runAfterAnimations(() => {
      setNote(null);
      setText('');
    });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    runAfterAnimations(handlePage1);
  }, [handlePage1, onClose]);

  const handleNoteClick = useCallback(note => {
    setNote(note);
    setText(note.text);
    setPage(2);
  }, []);

  const handleCreate = useMutationCallback(
    text => createMesoNote.mutate({text}, {onSuccess: handlePage1}),
    [createMesoNote, handlePage1]
  );
  const handleUpdate = useMutationCallback(
    text => updateMesoNote.mutate({text}, {onSuccess: handlePage1}),
    [updateMesoNote, handlePage1]
  );
  const handleDelete = useMutationCallback(
    () => deleteMesoNote.mutate(null, {onSuccess: handlePage1}),
    [deleteMesoNote, handlePage1]
  );

  const handleSave = useCallback(() => {
    if (isNewNote) {
      handleCreate(trimmedText);
    } else {
      handleUpdate(trimmedText);
    }
  }, [handleCreate, handleUpdate, isNewNote, trimmedText]);

  const isSaving = createMesoNote.isWorking || updateMesoNote.isWorking;
  const isDeleting = deleteMesoNote.isWorking;

  return (
    <Fragment>
      <div className="mt-2">
        <SheetTitle title="Meso notes" currentPage={page} pageNumber={1} variant="xl">
          <button
            className="btn btn-xs flex items-center dark:bg-base-100"
            onClick={() => setPage(2)}
          >
            <Plus />
            New
          </button>
        </SheetTitle>
        <SheetTitle title="Note detail" currentPage={page} pageNumber={2} />
        <SheetTitle title="Delete note" currentPage={page} pageNumber={3} />
      </div>

      <SheetNav handleClose={handleClose}>
        <SheetNavButton
          label="Meso notes"
          currentPage={page}
          pageNumber={2}
          onClick={handlePage1}
        />
        <SheetNavButton
          label="Note detail"
          currentPage={page}
          pageNumber={3}
          onClick={() => setPage(2)}
        />
      </SheetNav>

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={page} pageNumber={1}>
          <div className="flex min-h-0 grow flex-col overflow-auto bg-base-100 pl-4 dark:bg-base-200">
            <ul className="divide-y divide-base-200 dark:divide-base-300/40">
              {meso.notes.map(n => (
                <li
                  onClick={() => handleNoteClick(n)}
                  className="flex w-full cursor-pointer items-center justify-between py-3 pr-4"
                  key={n.id}
                >
                  <span className="line-clamp-3">{n.text}</span>
                  <button
                    onClick={() => handleNoteClick(n)}
                    className="btn btn-circle btn-ghost btn-sm"
                  >
                    <CaretRight size={18} className="text-base-content/80 dark:text-base-content" />
                  </button>
                </li>
              ))}
            </ul>

            {meso.notes.length === 0 && (
              <div className="pr-4 pt-4">
                <EmptyState
                  title="No mesocycle notes"
                  description="Your mesocycle notes will appear here"
                />
              </div>
            )}
          </div>
        </SheetPage>

        <SheetPage currentPage={page} pageNumber={2}>
          <div className="flex grow flex-col bg-base-100 px-4 dark:bg-base-200">
            <textarea
              className="textarea textarea-bordered w-full focus:border-base-content focus:outline-none focus:ring-0"
              onChange={({target}) => setText(target.value)}
              value={text || ''}
              rows="5"
              onFocus={e => {
                const textarea = e.target;
                const length = textarea.value.length;
                textarea.selectionStart = length;
                textarea.selectionEnd = length;
                textarea.focus();
              }}
            />
          </div>

          <div className="flex justify-end gap-8 px-4 pb-4 standalone:pb-safe-offset-4">
            {!isNewNote && (
              <button onClick={() => setPage(3)} className="btn btn-ghost text-primary">
                Delete
              </button>
            )}

            <button
              onClick={handleSave}
              className="btn btn-accent"
              disabled={!isSaveable | isSaving}
            >
              {isSaving && <span className="loading" />}
              {isNewNote ? 'Save new note' : 'Update'}
            </button>
          </div>
        </SheetPage>

        <SheetPage currentPage={page} pageNumber={3}>
          <div className="flex grow flex-col justify-between px-4">
            <h2>Are you sure you want to delete this note?</h2>

            <div className="flex justify-end gap-8 px-4 pb-4 standalone:pb-safe-offset-4">
              <button onClick={() => setPage(2)} className="btn btn-ghost">
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
                className="btn btn-accent"
              >
                {isDeleting && <span className="loading" />}
                Delete note
              </button>
            </div>
          </div>
        </SheetPage>
      </div>
    </Fragment>
  );
}

MesoNotes.propTypes = {
  onClose: func.isRequired,
};
