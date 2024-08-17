import {bool, func} from 'prop-types';

import Dialog from '../ui/Dialog.jsx';

export default function ValidGroupingDialog({isOpen, onClose}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="flex gap-4">
        <div className="space-y-2">
          <p>
            For best results, we typically recommend that all exercises training a muscle group be
            trained together.
          </p>
          <p>
            In some situations with advanced training modalities it may be appropriate to deviate
            from this guideline.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-accent" onClick={onClose}>
          ok
        </button>
      </div>
    </Dialog>
  );
}

ValidGroupingDialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
