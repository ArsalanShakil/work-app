import {bool, func, object} from 'prop-types';

import ExerciseForm from './ExerciseForm.jsx';
import Dialog from './ui/Dialog.jsx';

export default function ExerciseDialog({exercise, isOpen, onClose}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Exercise">
      <ExerciseForm exercise={exercise} onClose={onClose} onSuccess={onClose} />
    </Dialog>
  );
}

ExerciseDialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
  exercise: object,
};
