import {
  DotsThreeVertical,
  Pencil,
  PlusCircle,
  SquaresFour,
  TextItalic,
  Trash,
} from '@phosphor-icons/react';
import {func, object} from 'prop-types';
import {Fragment, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {useDeleteMeso} from '../api.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import RenameMesoModal from './RenameMesoModal.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';
import IconButton from './ui/IconButton.jsx';
import {MenuButton} from './ui/MenuItem.jsx';

export default function MesoCycleMenu({meso, onClickAddMesoNote}) {
  const {showNotification} = useNotifierContext();
  const [deleteMesoOpen, setDeleteMesoOpen] = useState(false);
  const [renameMesoOpen, setRenameMesoOpen] = useState(false);

  const navigate = useNavigate();

  const deleteMeso = useDeleteMeso(meso.key, {
    onSuccess: callback => {
      navigate('/mesocycles');
      showNotification({
        message: `Successfully deleted ${meso?.name}`,
        type: 'success',
        autoClose: true,
      });

      callback();
    },
  });

  const handleDelete = useMutationCallback(() => {
    deleteMeso.mutate();
  }, [deleteMeso]);

  return (
    <>
      <IconButton title="Mesocycle" icon={<DotsThreeVertical weight="bold" />}>
        <MenuButton onClick={onClickAddMesoNote} label="New note" icon={<Pencil size={16} />} />
        <MenuButton
          onClick={() => setRenameMesoOpen(true)}
          label="Rename"
          icon={<TextItalic size={16} />}
        />
        <MenuButton
          onClick={() => navigate(`/mesocycles/new?sourceMesoKey=${meso?.key}`)}
          label="Plan new meso"
          icon={<PlusCircle size={16} />}
        />
        <MenuButton
          onClick={() => navigate(`/templates/new?sourceMesoKey=${meso?.key}`)}
          label="Save as template"
          icon={<SquaresFour size={16} />}
        />
        <MenuButton
          className="text-rose-500 hover:bg-rose-100 disabled:text-rose-300 disabled:hover:bg-rose-50"
          onClick={() => setDeleteMesoOpen(true)}
          label="Delete meso"
          icon={<Trash size={16} />}
        />
      </IconButton>

      <RenameMesoModal
        isOpen={renameMesoOpen}
        onClose={() => setRenameMesoOpen(false)}
        mesoKey={meso.key}
      />

      <ConfirmDialog
        isOpen={deleteMesoOpen}
        title="Delete mesocycle?"
        onClose={() => setDeleteMesoOpen(false)}
        variant="error"
        message="This cannot be undone"
        confirmText="delete meso"
        onConfirm={handleDelete}
        isLoading={deleteMeso.isWorking}
      >
        <Fragment>
          <p>
            You are about to delete &quot;<span className="uppercase">{meso?.name}</span>&quot;
          </p>
          <p>This will permanently delete your meso and all of the data associated with it.</p>
        </Fragment>
      </ConfirmDialog>
    </>
  );
}

MesoCycleMenu.propTypes = {
  meso: object.isRequired,
  onClickAddMesoNote: func.isRequired,
};
