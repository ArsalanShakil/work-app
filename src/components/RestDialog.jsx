import {useCallback, useState} from 'react';

import {LS_KEY_REST_INFO_SEEN} from '../constants.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import SheetDialog from './ui/SheetDialog.jsx';
import Video from './Video.jsx';

export default function RestDialog() {
  const [hide, setHide] = useState(false);
  const isOpen = useLocalStore(st => st.isRestDialogOpen);
  const setOpen = useLocalStore(st => st.setIsRestDialogOpen);

  const handleClose = useCallback(() => {
    if (hide) {
      storage.setItem(LS_KEY_REST_INFO_SEEN, true);
    }

    setOpen(false);
  }, [hide, setOpen]);

  return (
    <SheetDialog isOpen={isOpen} onClose={handleClose}>
      <div>
        <SheetTitle title="How to rest between sets" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={handleClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow overflow-auto px-4">
            <div className="space-y-4 ">
              <p>After every set, you should rest long enough to:</p>
              <ol className="list-decimal space-y-3 pl-4">
                <li>No longer be breathing super heavy.</li>
                <li>Feel mentally strong and ready for another hard set</li>
                <li>
                  Not be crampy in a supporting muscle (like being fatigued in your lower back
                  before another squat set, for example.)
                </li>
                <li>
                  Be recovered enough in the target muscle to be able to do at least 5 reps on your
                  next set.
                </li>
              </ol>
            </div>
            <div className="mb-4 mt-8 flex aspect-video w-full items-center justify-center bg-base-200">
              <Video id="0FZf6nv_aGg" />
            </div>

            <p>
              For more detail, see our article{' '}
              <a
                className="link"
                href="https://hypertrophy.zendesk.com/hc/en-us/articles/13515626891671-How-long-should-I-rest-"
                target="_blank"
                rel="noreferrer"
              >
                How long should I rest?
              </a>
            </p>
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
