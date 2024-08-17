import {useCallback, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {LS_KEY_EDIT_MESO_CREATION} from '../constants.js';
import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../utils/index.js';
import {runAfterAnimations} from '../utils/misc.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import MesoChooserDialog from './MesoChooserDialog.jsx';
import MesoPreviewDialog from './MesoPreviewDialog.jsx';
import PlanMesocycleContent from './PlanMesocycleContent.jsx';
import TemplateChooserDialog from './template-chooser/TemplateChooserDialog.jsx';
import TemplatePreviewDialog from './template-chooser/TemplatePreviewDialog.jsx';

export default function PlanMesocycle() {
  const navigate = useNavigate();

  const [mesoData, setMesoData] = useState(null);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  const [mesoPreviewOpen, setMesoPreviewOpen] = useState(false);

  const theme = useLocalStore(st => st.theme);
  const setTemplateChooserOpen = useLocalStore(st => st.setTemplateChooserOpen);

  const handleMesoClick = useCallback(
    (key, name) => {
      setMesoPreviewOpen(true);
      setMesoData({key, name});
      setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
    },
    [theme]
  );

  const handleMesoPreviewClose = useCallback(() => {
    setMesoPreviewOpen(false);
    setTheDomStatusBarColor(theme, false);
    runAfterAnimations(() => setMesoData(null));
  }, [theme]);

  const handleTemplateClick = useCallback(
    (key, name) => {
      setTemplatePreviewOpen(true);
      setSelectedTemplateData({key, name});
      setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
    },
    [theme]
  );

  const handleTemplatePreviewClose = useCallback(() => {
    setTemplatePreviewOpen(false);
    setTheDomStatusBarColor(theme, false);
    runAfterAnimations(() => setSelectedTemplateData(null));
  }, [theme]);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col desktop:px-4">
      <div className="z-10 shadow desktop:shadow-none">
        <div className="my-4 shrink-0 space-y-4 px-4 desktop:my-8 desktop:px-0">
          <h1 className="text-2xl font-semibold text-base-content desktop:text-3xl desktop:font-bold">
            Plan a mesocycle
          </h1>

          <div className="flex flex-col gap-3 desktop:gap-1">
            <button onClick={() => setTemplateChooserOpen(true)} className="btn btn-accent w-full">
              Find a template
            </button>

            <button
              className="w-full text-xs desktop:btn desktop:btn-ghost desktop:btn-sm desktop:font-normal"
              onClick={() => {
                storage.removeItem(LS_KEY_EDIT_MESO_CREATION);
                navigate('/mesocycles/new');
              }}
            >
              Build a meso from scratch
            </button>
          </div>

          {storage.getItem(LS_KEY_EDIT_MESO_CREATION) && (
            <Link className="btn btn-sm btn-block font-normal" to="../new">
              Continue plan in progress
            </Link>
          )}
        </div>
      </div>

      <PlanMesocycleContent onMesoClick={handleMesoClick} onTemplateClick={handleTemplateClick} />

      <TemplateChooserDialog />
      <TemplatePreviewDialog
        isOpen={templatePreviewOpen}
        onClose={handleTemplatePreviewClose}
        templateData={selectedTemplateData}
      />

      <MesoChooserDialog />
      <MesoPreviewDialog
        isOpen={mesoPreviewOpen}
        onClose={handleMesoPreviewClose}
        mesoData={mesoData}
      />
    </div>
  );
}
