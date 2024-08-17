import cloneDeep from 'lodash.clonedeep';
import {bool, func, number, object, string} from 'prop-types';
import {useEffect, useState} from 'react';

import {isNum} from '../../../../lib/math.mjs';
import {useUpdateDay} from '../api.js';
import {feedbackTypes} from '../constants.js';
import {useMutationCallback} from '../utils/hooks.js';
import FeedbackForm from './FeedbackForm.jsx';
import FeedbackHelp from './FeedbackHelp.jsx';
import Dialog from './ui/Dialog.jsx';

export default function JointPainFeedbackDialog({
  isOpen,
  pain,
  day,
  exercise,
  exerciseName,
  onClose,
}) {
  const [localPain, setLocalPain] = useState('');
  const [helpType, setHelpType] = useState(null);

  // TODO: refactor to separate endpoint
  const saveJointPain = useUpdateDay(day.id, {meta: {action: 'saveJointPainFeedback'}});

  const handleClose = useMutationCallback(onClose);

  const setJointPainAndSaveDay = useMutationCallback(() => {
    const newExercises = cloneDeep(day.exercises);
    newExercises[exercise.position].jointPain = localPain;
    saveJointPain.mutate(
      {
        ...day,
        exercises: newExercises,
      },
      {onSuccess: handleClose}
    );
  }, [day, exercise.position, localPain, handleClose, saveJointPain]);

  useEffect(() => {
    if (isOpen) {
      if (!isNum(localPain)) {
        setLocalPain(pain);
      }
    } else {
      if (isNum(localPain)) {
        setLocalPain('');
      }
    }
  }, [localPain, isOpen, pain]);

  if (helpType) {
    return (
      <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
        <FeedbackHelp
          subject={exerciseName}
          muscleGroupId={null}
          type={helpType}
          onClickBack={() => setHelpType(null)}
          onClickHelp={() => setHelpType(feedbackTypes.jointPain)}
        />
      </Dialog>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg" title="Exercise Feedback">
      <FeedbackForm
        exerciseName={exerciseName}
        onChange={setLocalPain}
        onClickHelp={() => setHelpType(feedbackTypes.jointPain)}
        value={localPain}
        type={feedbackTypes.jointPain}
      />
      <div className="flex justify-end space-x-3">
        <button className="btn btn-ghost" onClick={handleClose}>
          Cancel
        </button>
        <button
          className="btn btn-accent"
          disabled={!isNum(localPain) || saveJointPain.isWorking}
          onClick={setJointPainAndSaveDay}
        >
          {saveJointPain.isWorking && <span className="loading"></span>}
          Save
        </button>
      </div>
    </Dialog>
  );
}

JointPainFeedbackDialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
  exerciseName: string.isRequired,
  pain: number,
  day: object.isRequired,
  exercise: object.isRequired,
};
