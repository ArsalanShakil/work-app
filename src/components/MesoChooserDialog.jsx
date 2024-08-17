import {useCallback, useMemo, useState} from 'react';

import {getSortedBy} from '../../../../lib/sort.mjs';
import {useMesocycle, useMesocycles} from '../api.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import MesoPreview from './MesoPreview.jsx';
import SheetNav from './sheet/SheetNav.jsx';
import SheetNavButton from './sheet/SheetNavButton.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import Loading from './ui/Loading.jsx';
import MesocycleListItem from './ui/MesocycleListItem.jsx';
import SheetDialog from './ui/SheetDialog.jsx';

export default function MesoChooserDialog() {
  const isOpen = useLocalStore(st => st.isMesoChooserDialogOpen);
  const setOpen = useLocalStore(st => st.setIsMesoChooserDialogOpen);

  const [page, setPage] = useState(1);
  const [mesoData, setMesoData] = useState(null);

  const {data: mesocycles} = useMesocycles();
  const {data: mesocycle, isActuallyLoading} = useMesocycle(mesoData?.key, {
    enabled: !!mesoData?.key,
  });

  const mesosList = useMemo(() => {
    return mesocycles ? getSortedBy(mesocycles, m => m.createdAt, {descending: true}) : [];
  }, [mesocycles]);

  const handleMesoClick = useCallback((key, name) => {
    setPage(2);
    setMesoData({key, name});
  }, []);

  const handleBack = useCallback(() => {
    setPage(1);
    runAfterAnimations(() => {
      setMesoData(null);
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    runAfterAnimations(() => {
      setMesoData(null);
      if (page === 2) {
        setPage(1);
      }
    });
  }, [page, setOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle title="Mesocycles" currentPage={page} pageNumber={1} variant="xl" />
        <SheetTitle title={mesoData?.name} currentPage={page} pageNumber={2} variant="xl" />
      </div>

      <SheetNav handleClose={handleClose}>
        <SheetNavButton label="Mesocycles" currentPage={page} pageNumber={2} onClick={handleBack} />
      </SheetNav>

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={page} pageNumber={1}>
          <div className="min-h-0 grow overflow-auto">
            <ul className="divide-y pl-4 dark:divide-base-300/40">
              {mesosList?.map(meso => (
                <MesocycleListItem
                  key={meso.id}
                  mesoRow={meso}
                  onSelect={() => handleMesoClick(meso.key, meso.name)}
                />
              ))}
            </ul>
          </div>
        </SheetPage>
        <SheetPage currentPage={page} pageNumber={2}>
          {isActuallyLoading && <Loading />}
          {!isActuallyLoading && mesocycle && <MesoPreview meso={mesocycle} />}
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
