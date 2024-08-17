import {useCallback, useState} from 'react';

import {useConfirmation} from '../../ConfirmationContext.jsx';
import {runAfterAnimations} from '../../utils/misc.js';
import useLocalStore from '../../utils/useLocalStore.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import FormInput from './FormInput.jsx';
import Message from './Message.jsx';
import SheetDialog from './SheetDialog.jsx';

// TODO: if we like this, refactor other calls to ConfirmDialog to use it...
export default function UIConfirmDialog() {
  const {
    isConfirmDialogOpen,
    confirmDialogConfig,
    handleCancelConfirmDialog,
    handleAcceptConfirmDialog,
  } = useConfirmation();

  const [userConfirmText, setUserConfirmText] = useState('');

  const confirmText = confirmDialogConfig?.confirmText;
  const minHeight = confirmDialogConfig?.minHeight || 350;
  const variant = confirmDialogConfig?.variant || 'warning';
  const title = confirmDialogConfig?.title || 'Are you sure?';
  const confirmButtonText = confirmDialogConfig?.confirmButtonText || 'Confirm';
  const cancelButtonText = confirmDialogConfig?.cancelButtonText || 'Cancel';
  const message = confirmDialogConfig?.message;
  const description = confirmDialogConfig?.description;

  const isDesktop = useLocalStore(st => st.isDesktop);
  const desktopClasses = {minHeight};

  const handleClose = useCallback(() => {
    handleCancelConfirmDialog();
    runAfterAnimations(() => setUserConfirmText(''));
  }, [handleCancelConfirmDialog]);

  const handleConfirm = useCallback(() => {
    handleAcceptConfirmDialog();
    runAfterAnimations(() => setUserConfirmText(''));
  }, [handleAcceptConfirmDialog]);

  return (
    <SheetDialog isOpen={isConfirmDialogOpen} onClose={handleClose} sheetClasses="h-3/4">
      <div className="mt-2">
        <SheetTitle title={title} currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative h-full" style={isDesktop ? desktopClasses : {}}>
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow space-y-4 overflow-auto px-4 pt-6">
            {message && <Message variant={variant}>{message}</Message>}

            {description && <p className="">{description}</p>}

            {confirmText && (
              <div>
                <span>
                  Please type <span className="mx-2 font-bold">{confirmText}</span> to confirm:
                </span>

                <FormInput
                  placeholder={confirmText}
                  value={userConfirmText}
                  onChange={setUserConfirmText}
                />
              </div>
            )}
          </div>

          <div className="flex shrink-0 justify-between gap-4 border-t p-4 dark:border-t-base-300 standalone:pb-safe-offset-4">
            <button onClick={handleClose} className="btn btn-primary btn-ghost">
              {cancelButtonText}
            </button>

            <button
              disabled={confirmText && userConfirmText.toLowerCase().trim() !== confirmText}
              className="btn btn-primary"
              onClick={handleConfirm}
            >
              {confirmButtonText}
            </button>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
