import {bool, func} from 'prop-types';

import Dialog from '../ui/Dialog.jsx';
import UpdateMesoDayLabelFrom from '../UpdateMesoDayLabelForm.jsx';

export default function CreateMesoDialog({isOpen, onClose}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update day label">
      <UpdateMesoDayLabelFrom onClose={onClose} />
    </Dialog>
  );
}

CreateMesoDialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
