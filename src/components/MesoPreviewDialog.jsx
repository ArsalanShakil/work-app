import {bool, func, object} from 'prop-types';

import {useMesocycle} from '../api.js';
import MesoPreview from './MesoPreview.jsx';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import Loading from './ui/Loading.jsx';
import SheetDialog from './ui/SheetDialog.jsx';

export default function MesoPreviewDialog({isOpen, onClose, mesoData}) {
  const {data: mesoDetail, isActuallyLoading} = useMesocycle(mesoData?.key, {
    enabled: !!mesoData?.key,
  });

  return (
    <SheetDialog isOpen={isOpen} onClose={onClose}>
      <div>
        <SheetTitle title={mesoData?.name} currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={onClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          {isActuallyLoading && <Loading />}
          {!isActuallyLoading && mesoDetail && <MesoPreview meso={mesoDetail} />}
        </SheetPage>
      </div>
    </SheetDialog>
  );
}

MesoPreviewDialog.propTypes = {
  isOpen: bool.isRequired,
  mesoData: object,
  onClose: func.isRequired,
};
