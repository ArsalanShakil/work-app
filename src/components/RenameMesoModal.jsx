import {bool, func, string} from 'prop-types';
import {useState} from 'react';

import {useMesocycle, useUpdateMeso} from '../api.js';
import {useMutationCallback} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import Dialog from './ui/Dialog.jsx';
import FormInput from './ui/FormInput.jsx';

export default function RenameMesoModal({isOpen, onClose, mesoKey}) {
  const {data: meso} = useMesocycle(mesoKey, {enabled: Boolean(mesoKey) && isOpen});
  const [name, setName] = useState(null); // null is initial state. '' is user deleted all text, 'asdfsdf' is name

  const newName = name ?? meso?.name ?? '';

  const handleClose = useMutationCallback(() => {
    onClose();

    runAfterAnimations(() => {
      setName(null);
    });
  }, [onClose]);

  const renameMeso = useUpdateMeso(mesoKey, {meta: {action: 'renameMeso'}});

  const handleRename = useMutationCallback(
    () => renameMeso.mutate({name: newName}, {onSuccess: handleClose}),
    [handleClose, newName, renameMeso]
  );

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Rename your mesocycle">
      <FormInput
        placeholder={meso?.name || ''}
        label="Mesocycle name"
        value={newName}
        onChange={setName}
        autoFocus
      />
      <div className="mt-8 flex justify-end space-x-3 pt-2">
        <div className="flex items-center space-x-3">
          <button className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>

          <button className="btn btn-accent" disabled={renameMeso.isWorking} onClick={handleRename}>
            {renameMeso.isWorking && <span className="loading"></span>}
            Rename
          </button>
        </div>
      </div>
    </Dialog>
  );
}

RenameMesoModal.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
  mesoKey: string,
};
