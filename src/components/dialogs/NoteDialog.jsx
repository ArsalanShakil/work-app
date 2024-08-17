import {bool, func, string} from 'prop-types';

import Dialog from '../ui/Dialog.jsx';
import NoteDialogContent from '../ui/NoteDialogContent.jsx';

export default function NoteDialog({title, noteText, isOpen, onClose, ...restProps}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`${noteText ? '' : 'New'} ${title}`}>
      <NoteDialogContent onClose={onClose} noteText={noteText} {...restProps} />
    </Dialog>
  );
}

NoteDialog.propTypes = {
  title: string.isRequired,
  noteText: string,
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
