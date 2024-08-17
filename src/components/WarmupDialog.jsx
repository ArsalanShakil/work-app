import {useCallback, useState} from 'react';

import {LS_KEY_WARMUP_INFO_SEEN} from '../constants.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import SheetDialog from './ui/SheetDialog.jsx';

export default function WarmupDialog() {
  const [hide, setHide] = useState(false);

  const isDesktop = useLocalStore(st => st.isDesktop);
  const isOpen = useLocalStore(st => st.isWarmupOpen);
  const setOpen = useLocalStore(st => st.setIsWarmupOpen);

  const handleClose = useCallback(() => {
    if (hide) {
      storage.setItem(LS_KEY_WARMUP_INFO_SEEN, true);
    }

    setOpen(false);
  }, [hide, setOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle
          title={isDesktop ? 'Warming up and choosing a starting weight' : 'How to choose weight'}
          currentPage={1}
          pageNumber={1}
          variant="xl"
        />
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow overflow-auto px-4">
            <div className="prose space-y-4 leading-normal">
              <p className="">
                In order to find your working set weights, please warm up by following these
                guidelines, and remember that you only have to use approximate rep max loads, so
                don&apos;t worry about knowing your exact rep maxes, just &quot;in the
                vicinity.&quot;
              </p>
              <ol className="list-decimal">
                <li>Do your 30 rep max for 12 reps, rest a minute.</li>
                <li>Do your 20 rep max for 8 reps, rest a minute.</li>
                <li>Do your 10 rep max for 4 reps, rest a minute.</li>
              </ol>
              <p>
                Then choose any load in the 5-30 rep range and begin the working sets, resting as
                much time in between each set as gets you breathing normally and feeling strong
                again.
              </p>
              <p>
                This is how you warm up and choose loads for the{' '}
                <span className="italic">first</span> exercise in your daily session. For all
                others, you can just do the set of 8 and 4, or even just the set of 4 if you already
                feel nice and warmed up.
              </p>
              <p>
                Any weight in between your 5 and 30 rep max technically works for all exercises, but
                we recommend choosing mostly weights that challenge you in the 5-10 rep range for
                beginners and weights in the 5-20 rep range for intermediates.
              </p>
              <p>
                If you&apos;re advanced and know about load-specific and exercise-specific SFR, you
                already know what you&apos;re doing! If you&apos;d like to use different weights for
                the same exercise for down sets or drop sets, just click on &quot;duplicate
                exercise&quot; in the top right hand menu of the exercise you&apos;re doing and
                choose your new weights.
              </p>
              <p>
                If you&apos;d like a deeper dive with slightly different suggestions on warming up
                and selecting weights, give these two videos on the topic a watch:{' '}
                <a
                  href="https://youtu.be/HDq-68SlPgQ?list=PLyqKj7LwU2RukxJbBHi9BtEuYYKm9UqQQ"
                  className="underline outline-none"
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                >
                  How to warm up
                </a>{' '}
                and{' '}
                <a
                  href="https://youtu.be/f2Er6AfYRs0?list=PLyqKj7LwU2RukxJbBHi9BtEuYYKm9UqQQ"
                  className="underline outline-none"
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                >
                  How to choose your working set weights
                </a>
                .
              </p>
              <p>
                You can also check out our{' '}
                <a
                  href="https://hypertrophy.zendesk.com/hc/en-us"
                  className="underline outline-none"
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                >
                  help
                </a>{' '}
                center if you have any other questions.
              </p>
            </div>
          </div>
          <div className="shrink-0 p-4 standalone:pb-safe-offset-4">
            <div className="flex items-center justify-between">
              <div className="form-control">
                <label className="label flex cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    checked={hide}
                    onChange={e => {
                      setHide(!!e.target.checked);
                    }}
                    className="checkbox checkbox-sm outline-none" // TODO: make this accent if it's checked
                  />
                  <span className="label-text">Don&apos;t show me again</span>
                </label>
              </div>

              <button className="btn btn-ghost" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}
