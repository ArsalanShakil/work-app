import {bool, func} from 'prop-types';

import MesoNotes from '../MesoNotes.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function MesoNotesDialog({isOpen, onClose}) {
  return (
    <SheetDialog isOpen={isOpen} onClose={onClose}>
      <MesoNotes onClose={onClose} />
    </SheetDialog>
  );
}

MesoNotesDialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
