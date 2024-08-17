import {useCallback} from 'react';

import useLocalStore from '../../utils/useLocalStore.js';
import MesoDayBodyweightForm from '../MesoDayBodyweightForm.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function MesoDayBodyweightDialog(props) {
  const isOpen = useLocalStore(st => st.readynessDialogOpen);
  const setIsOpen = useLocalStore(st => st.setReadynessDialogOpen);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose} sheetClasses="h-3/4" size="sm">
      <MesoDayBodyweightForm onClose={handleClose} {...props} />
    </SheetDialog>
  );
}
