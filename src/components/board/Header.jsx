import {
  ArrowCounterClockwise,
  CalendarPlus,
  ClockClockwise,
  DotsThreeVertical,
  Info,
  MagicWand,
  SquaresFour,
  TrendUp,
  X,
} from '@phosphor-icons/react';
import {func} from 'prop-types';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useMatch, useParams} from 'react-router-dom';
import {twMerge} from 'tailwind-merge';

import {useConfirmation} from '../../ConfirmationContext.jsx';
import {DIALOG_CONFIGS, UNTITLED_MESO} from '../../constants.js';
import {useNotifierContext} from '../../NotifierContext.jsx';
import {goodDay, setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../../utils/index.js';
import useLocalStore from '../../utils/useLocalStore.js';
import IconButton from '../ui/IconButton.jsx';
import {MenuButton} from '../ui/MenuItem.jsx';
import UpdateStartDayDialog from './UpdateStartDayDialog.jsx';
import ValidGroupingDialog from './ValidGroupingDialog.jsx';

const disabledButtonClasses =
  'btn-ghost bg-base-300 text-base-100 dark:bg-base-100 dark:text-base-content/70';

export default function Header({handleAutoFill, handleClearExercises, handleNewDay}) {
  const [isUpdateStartDayOpen, setUpdateStartDayOpen] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [validGroupingOpen, setValidGroupingOpen] = useState(false);

  const {templateKey} = useParams();
  const isNewTemplate = useMatch('/templates/new');
  const isNewMeso = useMatch('/mesocycles/new');
  const {showNotification} = useNotifierContext();
  const {confirmation} = useConfirmation();

  const theme = useLocalStore(st => st.theme);
  const days = useLocalStore(st => st.boardDays);
  const boardName = useLocalStore(st => st.boardName);
  const isDesktop = useLocalStore(st => st.isDesktop);
  const generatedFrom = useLocalStore(st => st.boardGeneratedFrom);
  const setProgressionOpen = useLocalStore(st => st.setTemplateProgressionsOpen);
  const setCreateMesoOpen = useLocalStore(st => st.setCreateMesoModalOpen);
  const setSaveTemplateOpen = useLocalStore(st => st.setSaveTemplateOpen);
  const resetBoard = useLocalStore(st => st.resetBoard);

  const validGrouping = useMemo(() => days.every(goodDay), [days]);

  const validAsTemplate = useMemo(() => {
    return days.length && days.length > 1 && days.every(day => day.length);
  }, [days]);

  const newMesoDisabled = useMemo(() => {
    const daysHaveExercises =
      days.length && days.every(day => day.length && day.every(slot => slot.exerciseId));

    return !daysHaveExercises;
  }, [days]);

  const handleNavClick = useCallback(id => {
    document.getElementById(id).scrollIntoView({behavior: 'smooth', inline: 'center'});
  }, []);

  const onNewDay = useCallback(() => {
    handleNewDay();
    setShouldScroll(true);
  }, [handleNewDay]);

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

  useEffect(() => {
    if (shouldScroll) {
      handleNavClick(`${days.length - 1}-column`);
      setShouldScroll(false);
    }
  }, [days.length, handleNavClick, shouldScroll]);

  return (
    <div className="absolute inset-x-0 top-16 desktop:top-0">
      <div className="mt-2 flex h-fit min-w-0 items-center justify-between px-4 desktop:mt-4">
        <div className="flex flex-col justify-center gap-0.5 truncate">
          <p className="mr-4 flex-1 truncate text-sm font-semibold leading-tight">
            {boardName || UNTITLED_MESO}
          </p>
          {generatedFrom && (
            <p className="text-xxs leading-tight">
              Generated from <span className="font-medium">{generatedFrom}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {!validGrouping && (
            <button
              className="btn btn-circle btn-ghost btn-sm text-info-content"
              onClick={() => setValidGroupingOpen(true)}
            >
              <Info size={25} />
            </button>
          )}

          {isDesktop && (
            <Fragment>
              {/* TODO: THESE NEED TO BE HIDDEN ON MOBILE VIEWS BECUause they are the seconddary action */}

              {isNewTemplate && (
                <button
                  onClick={handleOpenTemplateDialog}
                  className={twMerge(
                    'btn btn-accent btn-sm',
                    validAsTemplate ? '' : disabledButtonClasses
                  )}
                >
                  Create template
                </button>
              )}

              {templateKey && (
                <button
                  // TODO: do we need a separate dialog?
                  onClick={() => setSaveTemplateOpen(true)}
                  className="btn btn-accent btn-sm"
                >
                  Save template
                </button>
              )}

              {isNewMeso && (
                <button
                  onClick={handleOpenMesoDialog}
                  className={twMerge(
                    'btn btn-accent btn-sm',
                    newMesoDisabled ? disabledButtonClasses : ''
                  )}
                >
                  Create mesocycle
                </button>
              )}
            </Fragment>
          )}

          <IconButton
            icon={<DotsThreeVertical size={25} weight="bold" />}
            buttonClasses="btn btn-sm btn-square"
          >
            <MenuButton
              onClick={handleAutoFill}
              label="Autofill exercises"
              icon={<MagicWand size={17} />}
            />

            <MenuButton
              onClick={handleClearExercises}
              label="Clear exercises"
              icon={<X size={17} />}
            />

            {days.length < 6 && (
              <MenuButton onClick={onNewDay} label="Add a day" icon={<CalendarPlus size={17} />} />
            )}

            {isNewMeso && (
              <MenuButton
                onClick={() => setSaveTemplateOpen(true)}
                label="Save as Template"
                icon={<SquaresFour size={17} />}
              />
            )}

            <MenuButton
              onClick={() => {
                setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
                setUpdateStartDayOpen(true);
              }}
              label="Update start day"
              icon={<ClockClockwise size={17} />}
            />

            <MenuButton
              onClick={() => setProgressionOpen(true)}
              label="Edit set progressions"
              icon={<TrendUp size={17} />}
            />

            <MenuButton
              className="text-rose-500 hover:bg-rose-100 disabled:text-rose-300 disabled:hover:bg-rose-50"
              onClick={async () => {
                const shouldContinue = await confirmation(DIALOG_CONFIGS.resetBoard);
                if (!shouldContinue) {
                  return;
                }
                resetBoard();
              }}
              label="Reset board"
              icon={<ArrowCounterClockwise size={17} />}
            />
          </IconButton>
        </div>
      </div>

      <UpdateStartDayDialog
        isOpen={isUpdateStartDayOpen}
        onClose={() => {
          setUpdateStartDayOpen(false);
          setTheDomStatusBarColor(theme, false);
        }}
      />

      <ValidGroupingDialog isOpen={validGroupingOpen} onClose={() => setValidGroupingOpen(false)} />
    </div>
  );
}

Header.propTypes = {
  handleNewDay: func.isRequired,
  handleAutoFill: func.isRequired,
  handleClearExercises: func.isRequired,
};
