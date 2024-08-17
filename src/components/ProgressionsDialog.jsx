import {bool, func, object} from 'prop-types';
import {useCallback, useEffect, useState} from 'react';

import {MG_PROGRESSION_TYPES} from '../../../../lib/training/constants.mjs';
import {useMuscleGroupsById} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import EmptyState from './ui/EmptyState.jsx';
import ProgressionInfo from './ui/ProgressionInfo.jsx';
import SheetDialog from './ui/SheetDialog.jsx';
export default function ProgressionsDialog({isOpen, mutation, onClose, onSave, progressions = {}}) {
  const muscleGroupsById = useMuscleGroupsById();

  const [localProgressions, setLocalProgressions] = useState(progressions);

  const handleChange = useCallback((checked, muscleGroupId) => {
    setLocalProgressions(localProgs => ({
      ...localProgs,
      [muscleGroupId]: {
        ...localProgs[muscleGroupId],
        mgProgressionType: checked ? MG_PROGRESSION_TYPES.regular : MG_PROGRESSION_TYPES.slow,
      },
    }));
  }, []);

  const handleCancel = useCallback(() => {
    onClose();
    runAfterAnimations(() => {
      setLocalProgressions(progressions);
    });
  }, [onClose, progressions]);

  const handleSave = useCallback(() => {
    if (mutation) {
      mutation.mutate(localProgressions, {
        onSuccess: progressions => {
          setLocalProgressions(progressions);
          onClose();
        },
      });
    } else if (onSave) {
      onSave(localProgressions);
    }
  }, [localProgressions, onClose, onSave, mutation]);

  useEffect(() => {
    setLocalProgressions(progressions);
  }, [progressions]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleCancel}>
      <div>
        <SheetTitle title="Muscle group progressions" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={handleCancel} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow overflow-auto">
            <ul className="mt-6 divide-y pl-4 dark:divide-base-300/40">
              {Object.keys(localProgressions).map(key => {
                const progressionType = localProgressions[key].mgProgressionType;
                const muscleGroupId = Number(key);
                const mgName = muscleGroupsById[muscleGroupId]?.name;
                const isPrimary = progressionType === MG_PROGRESSION_TYPES.regular;

                return (
                  <div key={key} className="flex items-center justify-between py-3 pr-4">
                    <div>{mgName}</div>
                    <div className="btn-group shrink-0">
                      <button
                        onClick={() => !isPrimary && handleChange(true, muscleGroupId)}
                        className={`btn btn-xs font-normal lowercase ${
                          isPrimary ? 'btn-secondary' : 'dark:bg-base-100'
                        }`}
                      >
                        Primary
                      </button>
                      <button
                        onClick={() => isPrimary && handleChange(false, muscleGroupId)}
                        className={`btn btn-xs font-normal lowercase ${
                          !isPrimary ? 'btn-secondary' : 'dark:bg-base-100'
                        }`}
                      >
                        Secondary
                      </button>
                    </div>
                  </div>
                );
              })}
            </ul>

            {Object.keys(localProgressions).length === 0 && (
              <div className="mt-6 px-4">
                <EmptyState
                  title="No muscle groups"
                  description="When muscle groups are present, you will be able to configure their progression rates here."
                />
              </div>
            )}

            <ProgressionInfo className="px-4" />
          </div>

          <div className="shrink-0 border-t p-4 dark:border-t-base-300 standalone:pb-safe-offset-4">
            <div className="flex items-center justify-end gap-2">
              <button className="btn btn-ghost" onClick={handleCancel}>
                Cancel
              </button>

              <button
                className="btn btn-secondary"
                disabled={mutation?.isWorking}
                onClick={handleSave}
              >
                {mutation?.isWorking && <span className="loading" />}
                Save
              </button>
            </div>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}

ProgressionsDialog.propTypes = {
  isOpen: bool.isRequired,
  mutation: object,
  onClose: func.isRequired,
  onSave: func,
  progressions: object,
};
