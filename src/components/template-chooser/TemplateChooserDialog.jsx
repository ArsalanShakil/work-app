import {Plus} from '@phosphor-icons/react';
import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {useTemplate} from '../../api.js';
import {useTemplateFilterResetCallback} from '../../utils/hooks.js';
import {runAfterAnimations} from '../../utils/misc.js';
import useLocalStore from '../../utils/useLocalStore.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetNavButton from '../sheet/SheetNavButton.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import TemplatesList from '../TemplatesList.jsx';
import Loading from '../ui/Loading.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';
import TemplatePreview from './TemplatePreview.jsx';

export default function TemplateChooserDialog() {
  const isOpen = useLocalStore(st => st.templateChooserOpen);
  const setOpen = useLocalStore(st => st.setTemplateChooserOpen);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);

  const {data: templateDetail, isActuallyLoading} = useTemplate(selectedTemplateData?.key, {
    enabled: !!selectedTemplateData?.key,
  });

  const handleTemplateFilterReset = useTemplateFilterResetCallback();

  const handleTemplateClick = useCallback((key, name) => {
    setPage(2);
    setSelectedTemplateData({key, name});
  }, []);

  const handleBack = useCallback(() => {
    setPage(1);
    runAfterAnimations(() => {
      setSelectedTemplateData(null);
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    runAfterAnimations(() => {
      setPage(1);
      setSelectedTemplateData(null);
      handleTemplateFilterReset();
    });
  }, [handleTemplateFilterReset, setOpen]);

  const handleNewTemplate = useCallback(() => {
    setOpen(false);
    runAfterAnimations(() => {
      handleTemplateFilterReset();
      navigate('/templates/new');
    });
  }, [handleTemplateFilterReset, navigate, setOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle title="Templates" currentPage={page} pageNumber={1} variant="xl">
          <button className="btn btn-xs flex items-center" onClick={handleNewTemplate}>
            <Plus />
            New
          </button>
        </SheetTitle>
        <SheetTitle title={templateDetail?.name} currentPage={page} pageNumber={2} variant="xl" />
      </div>

      <SheetNav handleClose={handleClose}>
        <SheetNavButton label="Templates" currentPage={page} pageNumber={2} onClick={handleBack} />
      </SheetNav>

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={page} pageNumber={1} className="pt-1 desktop:pt-2">
          <TemplatesList onClick={handleTemplateClick} inDialog={true} />
        </SheetPage>

        <SheetPage currentPage={page} pageNumber={2}>
          {isActuallyLoading && <Loading />}
          {!isActuallyLoading && templateDetail && (
            <TemplatePreview template={templateDetail} onDelete={handleBack} />
          )}
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
