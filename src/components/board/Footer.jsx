import {useCallback, useMemo} from 'react';
import {useMatch} from 'react-router-dom';

import {useNotifierContext} from '../../NotifierContext.jsx';
import useLocalStore from '../../utils/useLocalStore.js';

export default function Footer() {
  const days = useLocalStore(st => st.boardDays);

  const newMesoDisabled = useMemo(() => {
    const daysHaveExercises =
      days.length && days.every(day => day.length && day.every(slot => slot.exerciseId));

    return !daysHaveExercises;
  }, [days]);

  const {showNotification} = useNotifierContext();

  const setCreateMesoOpen = useLocalStore(st => st.setCreateMesoModalOpen);
  const setSaveTemplateOpen = useLocalStore(st => st.setSaveTemplateOpen);

  const isNewTemplate = useMatch('/templates/new');
  const isNewMeso = useMatch('/mesocycles/new');

  const validAsTemplate = useMemo(() => {
    return days.length && days.length > 1 && days.every(day => day.length);
  }, [days]);

  const handleOpenTemplateDialog = useCallback(() => {
    if (validAsTemplate) {
      setSaveTemplateOpen(true);
    } else {
      showNotification({
        message:
          'Templates must have at least 2 days and all days must have at least one muscle group',
        type: 'warning',
        autoClose: true,
      });
    }
  }, [setSaveTemplateOpen, showNotification, validAsTemplate]);

  const handleOpenMesoDialog = useCallback(() => {
    if (newMesoDisabled) {
      showNotification({
        message:
          'All days must have muscle groups with exercises. Click the menu icon to auto-fill your exercises',
        type: 'warning',
        autoClose: true,
      });
    } else {
      setCreateMesoOpen(true);
    }
  }, [newMesoDisabled, setCreateMesoOpen, showNotification]);

  const primaryLabel = isNewMeso
    ? 'Create mesocycle'
    : isNewTemplate
    ? 'Create template'
    : 'Save template';

  return (
    <div className="absolute inset-x-0 bottom-0 desktop:hidden">
      <div className="border-t border-base-200 bg-base-100 p-4 standalone:pb-safe-offset-4">
        <button
          className="btn btn-accent w-full"
          onClick={() => {
            if (isNewMeso) {
              handleOpenMesoDialog();
            } else {
              handleOpenTemplateDialog();
            }
          }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
