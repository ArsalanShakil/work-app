import {useCallback, useState} from 'react';

import {useMuscleGroups} from '../api.js';
import {useHandleCardChange} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import PositionInfo from './exercise-chooser/PositionInfo.jsx';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import SheetDialog from './ui/SheetDialog.jsx';

export default function MuscleGroupPickerDialog() {
  const isOpen = useLocalStore(st => st.muscleGroupPickerOpen);
  const setIsOpen = useLocalStore(st => st.setMuscleGroupPickerOpen);

  const setSlotIndex = useLocalStore(st => st.setSlotIndex);
  const setDayIndex = useLocalStore(st => st.setDayIndex);

  const {data: muscleGroups} = useMuscleGroups();
  const handleCardChange = useHandleCardChange();

  const [page, setPage] = useState(1);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    runAfterAnimations(() => {
      setPage(1);
      setSlotIndex(null);
      setDayIndex(null);
    });
  }, [setDayIndex, setIsOpen, setSlotIndex]);

  const handleClick = useCallback(
    mgId => {
      handleCardChange({muscleGroupId: mgId, exerciseId: null}, {merge: false});
      handleClose();
    },
    [handleCardChange, handleClose]
  );

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle title="Muscle groups" currentPage={page} pageNumber={1} variant="xl">
          <PositionInfo pageNumber={1} />
        </SheetTitle>
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={page} pageNumber={1} className="">
          <div className="flex h-full flex-col pt-2">
            <div className="border-b pb-2 pl-4 dark:border-base-300/60">
              <p>Choose a muscle group</p>
            </div>

            <ul className="min-h-0 grow divide-y overflow-y-auto overscroll-contain pl-4 dark:divide-base-300/40">
              {muscleGroups?.map(mg => (
                <li
                  onClick={() => handleClick(mg.id)}
                  key={mg.id}
                  className="flex cursor-pointer items-center justify-between gap-x-6 py-3"
                >
                  <div className="flex w-full items-center gap-4">
                    <input id={`mg-${mg.id}`} type="radio" name="radio-1" className="radio" />
                    <label className="w-full cursor-pointer" htmlFor={`mg-${mg.id}`}>
                      {mg.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
