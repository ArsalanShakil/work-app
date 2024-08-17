import {useCallback} from 'react';

import useLocalStore from '../../utils/useLocalStore.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function SetTypeDialog() {
  const isOpen = useLocalStore(st => st.isSetTypeDialogOpen);
  const setOpen = useLocalStore(st => st.setIsSetTypeDialogOpen);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle title="Set types" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow space-y-4 overflow-auto px-4">
            <p>Keep track of how you performed your sets by specifying a type:</p>
            <ol className="list-decimal space-y-3 pl-4">
              <li>
                <span className="font-semibold">Regular:</span> perform sets normally by hitting rep
                target or week over week RIR target
              </li>
              <li>
                <span className="font-semibold">Myoreps:</span> take 5-15 second pauses between
                mini-sets of reps to hit rep target or week over week RIR target. Log total reps.
              </li>
              <li>
                <span className="font-semibold">Myorep match:</span> take 5-15 second pauses between
                mini-sets of reps to match reps from your <i>first</i> set. Log total reps.
              </li>
            </ol>
          </div>
          <div className="shrink-0 p-4 standalone:pb-safe-offset-4">
            <div className="flex justify-end">
              <button className="btn btn-ghost" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
