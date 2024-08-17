import {bool, func, node, string} from 'prop-types';

import useLocalStore from '../../utils/useLocalStore.js';
import Sheet from '../sheet/Sheet.jsx';
import Dialog from './Dialog.jsx';

export default function SheetDialog({
  children,
  isOpen,
  onClose,
  size = 'xl',
  sheetClasses,
  inDialog,
}) {
  const isDesktop = useLocalStore(st => st.isDesktop);

  if (isDesktop) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} disablePadding supportSheets size={size}>
        {children}
      </Dialog>
    );
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} sheetClasses={sheetClasses} inDialog={inDialog}>
      {children}
    </Sheet>
  );
}

SheetDialog.propTypes = {
  children: node.isRequired,
  isOpen: bool.isRequired,
  inDialog: bool,
  size: string,
  onClose: func.isRequired,
  sheetClasses: string,
};
