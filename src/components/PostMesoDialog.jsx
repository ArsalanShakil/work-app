import {useCallback} from 'react';
import {Link} from 'react-router-dom';

import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import SheetDialog from './ui/SheetDialog.jsx';

export function PostMesoDialog() {
  const isOpen = useLocalStore(st => st.isFinishMesoDialogOpen);
  const setIsOpen = useLocalStore(st => st.setIsFinishMesoDialogOpen);
  const setIsMesoSummaryOpen = useLocalStore(st => st.setIsMesoSummaryOpen);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleSummary = useCallback(() => {
    handleClose();
    runAfterAnimations(() => {
      setIsMesoSummaryOpen(true);
    });
  }, [handleClose, setIsMesoSummaryOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle
          title="Mesocycle complete!"
          currentPage={1}
          pageNumber={1}
          variant="xl"
          className="text-center"
        />
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative mt-4 h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="flex h-full min-h-full flex-col justify-between pb-4 standalone:pb-safe-offset-4 desktop:min-h-[700px] desktop:px-4">
            <div className="flex flex-col gap-6 text-center">
              <div className="mx-4 flex flex-col gap-4 border p-4 text-left">
                <div className="font-semibold">Your meso journey</div>
                <p>You&apos;ve finished your meso and that&apos;s amazing! </p>

                <p>
                  Every meso you finish is more muscle stacked on top of what you&apos;ve built
                  before.
                </p>

                <p>
                  Whether or not you deload, make sure to rest up for at least a few days before
                  beginning your next meso.
                </p>

                <p>Either way, great work and we&apos;ll see you for the next one!</p>
              </div>
              <p></p>
            </div>

            <div className="flex shrink-0 flex-col gap-6 px-4">
              <div className="flex flex-col gap-0">
                <button onClick={handleSummary} className="btn btn-ghost w-full">
                  View mesocycle stats
                </button>

                <Link onClick={handleClose} to="/mesocycles" className="btn btn-ghost w-full">
                  View all mesocycles
                </Link>
              </div>

              <Link onClick={handleClose} to="/mesocycles/plan" className="btn btn-accent w-full">
                Plan a new mesocycle
              </Link>
            </div>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
