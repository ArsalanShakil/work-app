import {Plus} from '@phosphor-icons/react';
import {useCallback, useState} from 'react';
import {Link} from 'react-router-dom';

import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../utils/index.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import TemplatePreviewDialog from './template-chooser/TemplatePreviewDialog.jsx';
import TemplatesList from './TemplatesList.jsx';

export default function Templates() {
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  const [isPreviewOpen, setPreviewOpen] = useState(false);

  const theme = useLocalStore(st => st.theme);
  const isDesktop = useLocalStore(st => st.isDesktop);

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
    setTheDomStatusBarColor(theme, false);
    runAfterAnimations(() => setSelectedTemplateData(null));
  }, [theme]);

  const handleTemplateClick = useCallback(
    (key, name) => {
      setPreviewOpen(true);
      setSelectedTemplateData({key, name});
      setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
    },
    [theme]
  );

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col overflow-hidden desktop:bottom-8 desktop:top-0 desktop:px-4">
      <div className="flex shrink-0 items-center justify-between p-4 desktop:border-none desktop:px-0 desktop:py-8">
        <h1 className="text-2xl font-semibold text-base-content desktop:text-3xl desktop:font-bold">
          Templates
        </h1>

        <Link
          to="/templates/new"
          className="btn btn-xs flex items-center desktop:btn-accent desktop:btn-sm"
        >
          <Plus size={isDesktop ? 19 : 17} />
          New
        </Link>
      </div>

      <div className="relative flex h-full min-h-0 grow">
        <div className="absolute inset-0 flex h-full flex-col">
          <TemplatesList onClick={handleTemplateClick} />
        </div>
      </div>

      <TemplatePreviewDialog
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        templateData={selectedTemplateData}
      />
    </div>
  );
}
