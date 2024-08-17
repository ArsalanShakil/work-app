import {array, func} from 'prop-types';
import {Fragment, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import common from '../../../../../config/common.json5';
import events from '../../../../../lib/events/index.mjs';
import {isNum} from '../../../../../lib/math.mjs';
import {
  TRAINING_EVENTS,
  TRAINING_USER_ATTRIBUTES,
  UNIT,
} from '../../../../../lib/training/constants.mjs';
import {useCreateMeso, useFetch, useTrackEvent, useUserProfile} from '../../api.js';
import {LS_KEY_EDIT_MESO_CREATION, UNTITLED_MESO, WEEKDAYS} from '../../constants.js';
import {useMutationCallback} from '../../utils/hooks.js';
import {runAfterAnimations} from '../../utils/misc.js';
import storage from '../../utils/storage.js';
import useLocalStore from '../../utils/useLocalStore.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import FormInput from '../ui/FormInput.jsx';

export default function CreateMesoForm({weekDays, onClose}) {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState(4);
  const [unit, setUnit] = useState(UNIT.lb);

  const {data: user} = useUserProfile();
  const fetchSecondMeso = useFetch('/training/meta/second-meso');

  const boardName = useLocalStore(st => st.boardName);
  const setBoardName = useLocalStore(st => st.setBoardName);
  const boardDays = useLocalStore(st => st.boardDays);
  const boardSourceTemplateId = useLocalStore(st => st.boardSourceTemplateId);
  const boardSourceMesoId = useLocalStore(st => st.boardSourceMesoId);
  const resetBoard = useLocalStore(st => st.resetBoard);

  const progressions = useLocalStore(st => st.muscleGroupProgressions);
  const setProgressions = useLocalStore(st => st.setMuscleGroupProgressions);

  const createMeso = useCreateMeso();
  const labels = weekDays.map(wd => (isNum(wd) ? WEEKDAYS[wd] : null));
  const trackEvent = useTrackEvent();

  const handleClose = useMutationCallback(() => onClose());
  const handleCreate = useMutationCallback(() => {
    const meso = {
      name: boardName,
      weeks,
      days: boardDays.map(day => day.map(slot => slot.exerciseId)),
      weekDays: labels,
      unit,
      progressions,
      sourceTemplateId: boardSourceTemplateId,
      sourceMesoId: boardSourceMesoId,
    };

    createMeso.mutate(meso, {
      onSuccess: async meso => {
        const secondMeso = await fetchSecondMeso();
        const createMesoEvent = {type: common.eventTypes.mesoCreated, mesoKey: meso.key};

        if (!user.attributes[TRAINING_USER_ATTRIBUTES.TRAINING_MESO_FIRST_FINISHED_AT]) {
          // If user has never finished a meso, this is the first complete set of their first meso
          createMesoEvent.first = true;
        } else if (!secondMeso) {
          // Else if they don't have any saved sets on a second meso,  this is the first complete set of their second meso
          createMesoEvent.second = true;
        }

        events.track(createMesoEvent);

        trackEvent.mutate({
          event: TRAINING_EVENTS.TRAINING_MESO_CREATED_AT,
          at: new Date().toISOString(),
          mesoKey: meso.key,
        });

        onClose();

        runAfterAnimations(() => {
          storage.removeItem(LS_KEY_EDIT_MESO_CREATION);

          navigate(`/mesocycles/${meso.key}/weeks/1/days/1`, {replace: true});

          // TODO: This is hilarious. If we don't wait, we don't navigate
          runAfterAnimations(() => {
            resetBoard();
            setProgressions({}, {replace: true});
          });
        });
      },
    });
  }, [
    boardDays,
    boardName,
    boardSourceMesoId,
    boardSourceTemplateId,
    createMeso,
    fetchSecondMeso,
    labels,
    navigate,
    onClose,
    progressions,
    resetBoard,
    setProgressions,
    trackEvent,
    unit,
    user.attributes,
    weeks,
  ]);

  const isFormComplete = !!boardName;

  return (
    <Fragment>
      <div className="mt-2">
        <SheetTitle title="Create your mesocycle" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={onClose} />

      <div className="relative h-full desktop:min-h-[500px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow space-y-4 overflow-auto px-4 pt-6">
            <FormInput
              placeholder={UNTITLED_MESO}
              label="Mesocycle name"
              // value={boardName ?? ''}
              value={boardName && boardName !== UNTITLED_MESO ? boardName : ''}
              onChange={setBoardName} // Note: Setting board name here is okay as long as we don't offer this from the template creation flow
              autoFocus
            />

            <div className="py-2">
              <p className="text-sm font-medium text-base-content">
                How many weeks will you train (including deload)?
              </p>

              <div className="btn-group mt-3 flex">
                <button
                  onClick={() => setWeeks(4)}
                  className={`btn btn-accent -ml-px grow items-center gap-1 ${
                    weeks === 4 ? '' : 'btn-group-custom'
                  }`}
                >
                  4
                </button>
                <button
                  onClick={() => setWeeks(5)}
                  className={`btn btn-accent -ml-px grow items-center gap-1 ${
                    weeks === 5 ? '' : 'btn-group-custom'
                  }`}
                >
                  5
                </button>
                <button
                  onClick={() => setWeeks(6)}
                  className={`btn btn-accent -ml-px grow items-center gap-1 ${
                    weeks === 6 ? '' : 'btn-group-custom'
                  }`}
                >
                  6
                </button>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm font-medium text-base-content">
                What units do you use for measuring weight?
              </p>
              <div className="btn-group mt-3 flex">
                <button
                  onClick={() => setUnit(UNIT.lb)}
                  className={`btn btn-accent -ml-px grow items-center gap-1 ${
                    unit === UNIT.lb ? '' : 'btn-group-custom'
                  }`}
                >
                  lb
                </button>
                <button
                  onClick={() => setUnit(UNIT.kg)}
                  className={`btn btn-accent -ml-px grow items-center gap-1 ${
                    unit === UNIT.kg ? '' : 'btn-group-custom'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-4 border-t p-4 dark:border-t-base-300 standalone:pb-safe-offset-4">
            <button className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>

            <button
              className="btn btn-accent"
              disabled={!isFormComplete || createMeso.isWorking}
              onClick={handleCreate}
            >
              {createMeso.isWorking && <span className="loading"></span>}
              Create
            </button>
          </div>
        </SheetPage>
      </div>
    </Fragment>
  );
}

CreateMesoForm.propTypes = {
  onClose: func.isRequired,
  weekDays: array.isRequired,
};
