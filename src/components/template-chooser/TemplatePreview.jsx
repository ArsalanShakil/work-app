import {Copy, NotePencil, Trash} from '@phosphor-icons/react';
import {func, object} from 'prop-types';
import {useMemo, useRef, useState} from 'react';

import {MG_PROGRESSION_TYPES, TEMPLATE_ADMINS} from '../../../../../lib/training/constants.mjs';
import {useDeleteTemplate, useUserProfile} from '../../api.js';
import {WEEKDAYS_SHORT} from '../../constants.js';
import {useMutationCallback} from '../../utils/hooks.js';
import {getWorkoutDayIndexesForTemplate} from '../../utils/index.js';
import useLocalStore from '../../utils/useLocalStore.js';
import Sheet from '../sheet/Sheet.jsx';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import ConfirmContent from '../ui/ConfirmContent.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import ProgressionInfo from '../ui/ProgressionInfo.jsx';
import PullUpButton from '../ui/PullUpButton.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import SlotPreviewRow from '../ui/SlotPreviewRow.jsx';

export default function TemplatePreview({template, onDelete}) {
  const {data: user} = useUserProfile();

  const [dayIndex, setDayIndex] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDesktop = useLocalStore(st => st.isDesktop);
  const setTemplateChooserOpen = useLocalStore(st => st.setTemplateChooserOpen);

  const listRef = useRef();
  const deleteTemplate = useDeleteTemplate(template?.key);

  const handleDeleteTemplate = useMutationCallback(() => {
    deleteTemplate.mutate(null, {
      onSuccess: () => {
        setDeleteOpen(false);
        onDelete();
      },
    });
  }, [deleteTemplate, onDelete]);

  const options = useMemo(() => {
    if (!template?.days) {
      return [];
    }

    const dayIndexes = getWorkoutDayIndexesForTemplate(template.days.length, 0);

    return template.days.map(d => ({
      label: template.userId ? `Day ${d.position + 1}` : WEEKDAYS_SHORT[dayIndexes[d.position]],
      value: d.position,
    }));
  }, [template]);

  const containsSecondary =
    template?.progressions &&
    Object.values(template.progressions).some(
      p => p.mgProgressionType === MG_PROGRESSION_TYPES?.slow
    );

  return (
    <div className="flex h-full flex-col justify-between desktop:min-h-[700px] desktop:px-4 desktop:pb-4">
      <div className="shrink-0 space-y-2 pb-2">
        <div className="border-b px-4 pb-2 text-sm font-medium uppercase text-base-content/80 dark:border-base-300/60 dark:text-base-content desktop:px-0">
          {template?.sex}
        </div>

        <div className="px-4 desktop:px-0">
          <SegmentedControl options={options} selected={dayIndex} onClick={setDayIndex} />
        </div>
      </div>

      <div className="min-h-0 grow overflow-auto border-t dark:border-base-300/60">
        <ul
          ref={listRef}
          className="divide-y overflow-auto pl-4 dark:divide-base-300/40 desktop:pl-0"
        >
          {template?.days[dayIndex]?.slots?.map(slot => (
            <SlotPreviewRow
              key={slot.id}
              slot={slot}
              progression={template?.progressions[slot.muscleGroupId]}
            />
          ))}
        </ul>

        {containsSecondary && <ProgressionInfo className="px-4 desktop:px-0" />}
      </div>

      <div className="shrink-0 border-t p-4 dark:border-t-base-300 standalone:pb-safe-offset-4 desktop:px-0 desktop:pb-0 desktop:pt-4">
        <PullUpButton
          actions={[
            {
              label: 'Plan new mesocycle',
              to: `/mesocycles/new?sourceTemplateKey=${template?.key}`,
              onClick: () => setTemplateChooserOpen(false),
            },
            {
              label: 'Edit template',
              to: `/templates/${template?.key}`,
              icon: <NotePencil />,
              disabled:
                template?.userId === null
                  ? !TEMPLATE_ADMINS.includes(user.email)
                  : template?.userId !== user.id,
              onClick: () => setTemplateChooserOpen(false),
            },
            {
              label: 'Copy template',
              to: `/templates/new?sourceTemplateKey=${template?.key}`,
              icon: <Copy />,
              onClick: () => setTemplateChooserOpen(false),
            },
            {
              label: <span className="text-rose-600">Delete Template</span>,
              onClick: () => setDeleteOpen(true),
              icon: <Trash className="text-rose-600" />,
              disabled: !template?.userId, // TODO: Check for user id match here?
            },
          ]}
        />
      </div>

      {!isDesktop && (
        <Sheet isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <SheetTitle title="Delete Template" currentPage={1} pageNumber={1} variant="xl" />
          <SheetNav handleClose={() => setDeleteOpen(false)} />
          <div className="relative h-full">
            <SheetPage currentPage={1} pageNumber={1}>
              <div className="mt-6 space-y-6 px-4">
                <ConfirmContent
                  confirmButtonText="delete template"
                  confirmText="delete my template"
                  description="Are you sure you want to delete this template?"
                  isLoading={deleteTemplate.isWorking}
                  message="this cannot be undone"
                  onClose={() => setDeleteOpen(false)}
                  onConfirm={handleDeleteTemplate}
                  variant="error"
                />
              </div>
            </SheetPage>
          </div>
        </Sheet>
      )}

      {isDesktop && (
        <ConfirmDialog
          confirmButtonText="delete template"
          confirmText="delete my template"
          description="Are you sure you want to delete this template?"
          isLoading={deleteTemplate.isWorking}
          isOpen={deleteOpen}
          message="this cannot be undone"
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteTemplate}
          title="Delete Template"
          variant="error"
        />
      )}
    </div>
  );
}
TemplatePreview.propTypes = {
  onDelete: func.isRequired,
  template: object,
};
