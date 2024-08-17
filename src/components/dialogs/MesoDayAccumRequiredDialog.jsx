import {useCallback, useEffect, useState} from 'react';

import {isBlockedDeloadWorkout} from '../../../../../lib/training/utils.mjs';
import {useMesoDay} from '../../utils/hooks.js';
import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../../utils/index.js';
import useLocalStore from '../../utils/useLocalStore.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function MesoDayAccumRequiredDialog() {
  const [isOpen, setOpen] = useState(false);
  const [hasSeen, setSeen] = useState(false);

  const theme = useLocalStore(st => st.theme);
  const {meso, day} = useMesoDay();

  useEffect(() => {
    if (isBlockedDeloadWorkout(day, meso) && !hasSeen && !isOpen) {
      setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
      setOpen(true);
      setSeen(true);
    }
  }, [day, hasSeen, isOpen, meso, theme]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTheDomStatusBarColor(theme, false);
  }, [theme]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle title="Accumulation Incomplete" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative h-full desktop:min-h-[300px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="mt-4 min-h-0 grow space-y-4 overflow-auto px-4">
            <p>To begin a deload workout, all accumulation workouts must be finished.</p>
            <p>
              For any workout you don&apos;t intend on performing, click on the &quot;end
              workout&quot; option under the workout menu section. You&apos;ll then be able to click
              &quot;finish workout&quot;.
            </p>
          </div>
          <div className="shrink-0 p-4 standalone:pb-safe-offset-4">
            <div className="flex justify-end">
              <button className="btn btn-ghost" onClick={handleClose}>
                Ok
              </button>
            </div>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
