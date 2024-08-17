import {bool, func, node, string} from 'prop-types';

import {useMutationCallback} from '../../utils/hooks.js';
import ConfirmContent from './ConfirmContent.jsx';
import Dialog from './Dialog.jsx';

// TODO: we think we like UIConfirmDialog and will migrate this over to that...
export default function ConfirmDialog({
  confirmText,
  confirmButtonText = 'Confirm',
  children,
  description,
  disabled,
  isLoading,
  message,
  onClose,
  onConfirm,
  isOpen,
  title = 'Are you sure?',
  variant = 'warning',
}) {
  const handleClose = useMutationCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg" title={title}>
      <ConfirmContent
        confirmText={confirmText}
        confirmButtonText={confirmButtonText}
        description={description}
        disabled={disabled}
        isLoading={isLoading}
        message={message}
        onClose={onClose}
        onConfirm={onConfirm}
        variant={variant}
      >
        {children}
      </ConfirmContent>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  confirmText: string,
  confirmButtonText: string,
  description: string,
  disabled: bool,
  isLoading: bool,
  message: string,
  onClose: func.isRequired,
  onConfirm: func,
  isOpen: bool.isRequired,
  title: string,
  children: node,
  variant: string,
};
