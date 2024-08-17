import {func} from 'prop-types';
import {useCallback} from 'react';

import useLocalStore from '../../utils/useLocalStore.js';
import CreateMesoForm from '../board/CreateMesoForm.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function CreateMesoDialog({onClose, ...restProps}) {
  const isOpen = useLocalStore(st => st.createMesoModalOpen);
  const setIsOpen = useLocalStore(st => st.setCreateMesoModalOpen);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose, setIsOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <CreateMesoForm {...restProps} onClose={handleClose} />
    </SheetDialog>
  );
}

CreateMesoDialog.propTypes = {
  onClose: func,
};
