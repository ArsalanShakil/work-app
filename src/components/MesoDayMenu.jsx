import {
  ArrowArcLeft,
  BookOpenText,
  Gauge,
  NotePencil,
  Pencil,
  Plus,
  StopCircle,
  TextItalic,
  TrendUp,
} from '@phosphor-icons/react';
import {array, func} from 'prop-types';
import {Fragment} from 'react';

import {STATUSES, STATUSES_FINISHED} from '../../../../lib/training/constants.mjs';
import {useConfirmation} from '../ConfirmationContext.jsx';
import {DIALOG_CONFIGS} from '../constants.js';
import {useMesoDay} from '../utils/hooks.js';
import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../utils/index.js';
import useLocalStore from '../utils/useLocalStore.js';
import IconButtonMenuLabel from './ui/IconButtonMenuLabel.jsx';
import {MenuButton} from './ui/MenuItem.jsx';

export default function MesoDayMenu({
  bodyweightDexes,
  handleResetDay,
  handleSkipDay,
  setAddExerciseOpen,
  setMesoNotesOpen,
  setProgressionsOpen,
  setRenameDayOpen,
  setRenameMesoOpen,
  setShouldAddNote,
}) {
  const {meso, day} = useMesoDay();
  const {confirmation} = useConfirmation();

  const theme = useLocalStore(st => st.theme);
  const setEndMesoOpen = useLocalStore(st => st.setEndMesoOpen);
  const setIsMesoSummaryOpen = useLocalStore(st => st.setIsMesoSummaryOpen);
  const setReadynessDialogOpen = useLocalStore(st => st.setReadynessDialogOpen);

  const canReset =
    !day.finishedAt && day.exercises.find(dex => dex?.sets.find(set => set.finishedAt));

  return (
    <Fragment>
      <IconButtonMenuLabel label="mesocycle" />

      <MenuButton
        onClick={() => setRenameMesoOpen(true)}
        label="Rename meso"
        icon={<TextItalic size={16} />}
      />

      {!meso.finishedAt && (
        <MenuButton
          onClick={() => setEndMesoOpen(true)}
          label="End meso"
          icon={<StopCircle size={16} />}
        />
      )}

      <MenuButton
        onClick={() => {
          setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
          setMesoNotesOpen(true);
        }}
        label="View notes"
        icon={<NotePencil size={16} />}
      />

      <MenuButton
        onClick={() => {
          setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
          setProgressionsOpen(true);
        }}
        label="Edit set progressions"
        icon={<TrendUp size={16} />}
      />

      <MenuButton
        onClick={() => setIsMesoSummaryOpen(true)}
        label="Mesocycle summary"
        icon={<BookOpenText size={16} />}
      />

      <IconButtonMenuLabel label="workout" />

      <MenuButton
        onClick={() => setShouldAddNote(true)}
        label="New workout note"
        icon={<Pencil size={16} />}
      />
      <MenuButton
        onClick={() => setRenameDayOpen(true)}
        label="Rename workout"
        icon={<TextItalic size={16} />}
      />

      {!day.finishedAt && (
        <MenuButton
          onClick={() => setAddExerciseOpen(true)}
          label="Add exercise"
          icon={<Plus size={16} />}
        />
      )}

      {bodyweightDexes.length > 0 && (
        <MenuButton
          onClick={async () => {
            if (STATUSES_FINISHED.day.includes(day.status)) {
              const shouldContinue = await confirmation(DIALOG_CONFIGS.dayCompleteWarning);
              if (!shouldContinue) {
                return;
              }
            }
            setReadynessDialogOpen(true);
          }}
          label="Set bodyweight"
          icon={<Gauge size={16} />}
        />
      )}

      {canReset && (
        <MenuButton onClick={handleResetDay} label="Reset" icon={<ArrowArcLeft size={16} />} />
      )}

      {!day.finishedAt &&
        day.status !== STATUSES.day.pending &&
        day.status !== STATUSES.day.pendingConfirmation && (
          <MenuButton onClick={handleSkipDay} label="End workout" icon={<StopCircle size={16} />} />
        )}
    </Fragment>
  );
}

MesoDayMenu.propTypes = {
  bodyweightDexes: array.isRequired,
  handleResetDay: func.isRequired,
  handleSkipDay: func.isRequired,
  setAddExerciseOpen: func.isRequired,
  setMesoNotesOpen: func.isRequired,
  setRenameDayOpen: func.isRequired,
  setRenameMesoOpen: func.isRequired,
  setProgressionsOpen: func.isRequired,
  setShouldAddNote: func.isRequired,
};
