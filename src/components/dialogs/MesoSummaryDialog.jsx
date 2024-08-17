import {useCallback} from 'react';

import useLocalStore from '../../utils/useLocalStore.js';
import MesoSummary from '../MesoSummary.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function MesoSummaryDialog() {
  const isOpen = useLocalStore(st => st.isMesoSummaryOpen);
  const setIsOpen = useLocalStore(st => st.setIsMesoSummaryOpen);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <MesoSummary onClose={handleClose} />
    </SheetDialog>
  );
}
