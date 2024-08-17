import {bool, func, string} from 'prop-types';
import {Fragment, useCallback, useEffect, useState} from 'react';

export default function NoteDialogContent({
  noteText,
  description,
  isSaving,
  isDeleting,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [text, setText] = useState(noteText || '');

  const trimmedText = text?.trim() || '';
  const trimmedNoteText = noteText?.trim() || '';
  const isNewNote = !trimmedNoteText;
  const isSaveable = trimmedText !== '' && (isNewNote ? true : trimmedText !== trimmedNoteText);

  const handleSave = useCallback(() => {
    if (isNewNote) {
      onCreate(trimmedText);
    } else {
      onUpdate(trimmedText);
    }
  }, [isNewNote, onCreate, onUpdate, trimmedText]);

  // Update internal text state when parent passes in new noteText (i.e onSuccess)
  useEffect(() => setText(noteText), [noteText]);

  return (
    <Fragment>
      {description && <p>{description}</p>}

      <textarea
        className="textarea textarea-bordered w-full focus:border-base-content focus:outline-none focus:ring-0"
        onChange={({target}) => setText(target.value)}
        value={text}
        rows="5"
        onFocus={e => {
          const textarea = e.target;
          const length = textarea.value.length;
          textarea.selectionStart = length;
          textarea.selectionEnd = length;
          textarea.focus();
        }}
      />

      <div className="flex justify-between gap-2">
        {!isNewNote ? (
          <button
            onClick={onDelete}
            disabled={isSaving || isDeleting}
            className="btn btn-ghost text-primary"
          >
            {isDeleting && <span className="loading"></span>}
            Delete
          </button>
        ) : (
          <div />
        )}

        <div className="flex gap-3">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button className="btn btn-accent" disabled={!isSaveable | isSaving} onClick={handleSave}>
            {isSaving && <span className="loading"></span>}
            {isNewNote ? 'Save' : 'Update'}
          </button>
        </div>
      </div>
    </Fragment>
  );
}

NoteDialogContent.propTypes = {
  description: string,
  noteText: string,
  isSaving: bool.isRequired,
  isDeleting: bool.isRequired,
  onClose: func.isRequired,
  onCreate: func.isRequired,
  onUpdate: func.isRequired,
  onDelete: func.isRequired,
};
