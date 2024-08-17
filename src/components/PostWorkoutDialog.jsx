import {ArrowArcRight, CheckCircle} from '@phosphor-icons/react';
import {bool, func} from 'prop-types';
import {Fragment, useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';

import {STATUSES} from '../../../../lib/training/constants.mjs';
import {useMesoDay} from '../utils/hooks.js';
import {getCurrentDayRoute} from '../utils/index.js';
import {runAfterAnimations} from '../utils/misc.js';
import useLocalStore from '../utils/useLocalStore.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import SheetDialog from './ui/SheetDialog.jsx';

export default function PostWorkoutDialog({handleFinishMeso, isWorking, onSummary}) {
  const {meso, day} = useMesoDay();
  const navigate = useNavigate();

  const isOpen = useLocalStore(st => st.isFinishWorkoutDialogOpen);
  const setIsOpen = useLocalStore(st => st.setIsFinishWorkoutDialogOpen);

  const handleSummary = useCallback(() => {
    setIsOpen(false);
    runAfterAnimations(onSummary);
  }, [setIsOpen, onSummary]);

  const handelNextWorkout = useCallback(() => {
    setIsOpen(false);
    runAfterAnimations(() => {
      navigate(getCurrentDayRoute(meso));
    });
  }, [meso, navigate, setIsOpen]);

  const {completed, skipped} = useMemo(() => {
    const res = {
      completed: 0,
      skipped: 0,
    };

    for (const dex of day.exercises) {
      if (dex.status === STATUSES.exercise.skipped) {
        res.skipped += 1;
      } else {
        res.completed += 1;
      }
    }

    return res;
  }, [day.exercises]);

  return (
    <SheetDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div>
        <SheetTitle
          title="Workout complete!"
          currentPage={1}
          pageNumber={1}
          variant="xl"
          className="text-center"
        />
      </div>

      <SheetNav handleClose={() => setIsOpen(false)} />

      <div className="relative mt-4 h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="flex h-full min-h-full flex-col justify-between pb-4 standalone:pb-safe-offset-4 desktop:min-h-[700px] desktop:px-4">
            <div className="flex flex-col gap-4 text-center">
              {completed !== 0 && (
                <Fragment>
                  <div className="flex flex-col gap-1">
                    <h2 className="px-4 pt-4 text-left text-lg font-medium">Exercises</h2>
                    <ul className="min-h-0 grow divide-y pl-4 dark:divide-base-300/40">
                      <li className="flex items-center justify-between py-3 capitalize">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={20} />
                          Completed
                        </div>
                        <div className="pr-6 text-lg">{completed}</div>
                      </li>
                      <li className="flex items-center justify-between py-3 capitalize">
                        <div className="flex items-center gap-3">
                          <ArrowArcRight size={20} />
                          Skipped
                        </div>
                        <div className="pr-6 text-lg">{skipped}</div>
                      </li>
                    </ul>
                  </div>

                  <div className="mx-4 flex flex-col gap-2 border p-4 text-left dark:border-base-100 dark:bg-base-100">
                    <div className="font-semibold">Advancing through your meso</div>
                    <p>
                      Now it&apos;s time to focus on as much rest and relaxation as you can get so
                      that you grow as much muscle as possible before your next workout! Rest well!
                    </p>
                  </div>
                </Fragment>
              )}

              {completed === 0 && (
                <div className="mx-4 flex flex-col gap-2 border p-4 text-left dark:border-base-100 dark:bg-base-100">
                  <div className="font-semibold">Advancing through your meso</div>
                  <p>
                    We get it, sometimes you just need to skip workouts. At the same time,
                    consistency is the king of muscle growth. Do your best to get all of your future
                    workouts done as planned.
                  </p>
                </div>
              )}
            </div>

            <div className="shrink-0 space-y-2 px-4">
              <button onClick={handleSummary} className="btn btn-ghost w-full">
                View mesocycle stats
              </button>
              {meso.status === STATUSES.meso.pendingConfirmation ? (
                <button
                  disabled={isWorking}
                  onClick={() => handleFinishMeso()}
                  className="btn btn-accent w-full"
                >
                  {isWorking && <span className="loading" />}
                  Finish Meso
                </button>
              ) : (
                <button onClick={handelNextWorkout} className="btn btn-secondary w-full">
                  next workout
                </button>
              )}
            </div>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}

PostWorkoutDialog.propTypes = {
  handleFinishMeso: func.isRequired,
  isWorking: bool,
  onSummary: func.isRequired,
};
