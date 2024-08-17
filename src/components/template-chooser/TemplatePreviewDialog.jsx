import {bool, func, object} from 'prop-types';

import {useTemplate} from '../../api.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import Loading from '../ui/Loading.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';
import TemplatePreview from './TemplatePreview.jsx';

export default function TemplatePreviewDialog({templateData, isOpen, onClose}) {
  const {data: templateDetail, isActuallyLoading} = useTemplate(templateData?.key, {
    enabled: !!templateData?.key,
  });

  return (
    <SheetDialog isOpen={isOpen} onClose={onClose}>
      <div>
        <SheetTitle title={templateData?.name} currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={onClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          {isActuallyLoading && <Loading />}
          {!isActuallyLoading && templateDetail && (
            <TemplatePreview template={templateDetail} onDelete={onClose} />
          )}
        </SheetPage>
      </div>
    </SheetDialog>
  );
}

TemplatePreviewDialog.propTypes = {
  templateData: object,
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
