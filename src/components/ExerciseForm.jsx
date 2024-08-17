import {Warning} from '@phosphor-icons/react';
import {func, node, object, string} from 'prop-types';
import {useMemo, useState} from 'react';

import {EXERCISE_TYPE} from '../../../../lib/training/constants.mjs';
import {extractYoutubeId, isValidYoutubeId} from '../../../../lib/training/utils.mjs';
import {useCreateExercise, useMuscleGroups, useUpdateExercise} from '../api.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import logError from '../utils/logError.js';
import FormInput from './ui/FormInput.jsx';
import Select from './ui/Select.jsx';

export default function ExerciseForm({children, exercise, onClose, onSuccess, saveLabel = 'Save'}) {
  const {data: muscleGroups} = useMuscleGroups();
  const {showNotification} = useNotifierContext();

  const [name, setName] = useState(exercise?.name || '');
  const [type, setType] = useState(exercise?.exerciseType || '');
  const [group, setGroup] = useState(exercise?.muscleGroupId || '');
  const [youtubeId, setYoutubeId] = useState(exercise?.youtubeId || '');

  const isFormUntouched = useMemo(() => {
    return (
      exercise &&
      name === exercise.name &&
      type === exercise.exerciseType &&
      group === exercise.muscleGroupId &&
      (youtubeId === exercise.youtubeId || (youtubeId === '' && exercise.youtubeId === null))
    );
  }, [exercise, group, name, type, youtubeId]);

  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise(exercise?.id);

  // NOTE: you may not change the muscle group of an existing exercise because fuck off
  const handleUpdateExercise = useMutationCallback(() => {
    const body = {
      name,
      exerciseType: type,
      youtubeId,
    };

    updateExercise.mutate(body, {
      onSuccess: () => {
        onClose();
        showNotification({
          message: 'Exercise updated!',
          type: 'success',
          autoClose: true,
        });
      },
    });
  }, [name, onClose, showNotification, type, updateExercise, youtubeId]);

  const handleCreateExercise = useMutationCallback(() => {
    const body = {
      name,
      muscleGroupId: group,
      exerciseType: type,
      youtubeId,
    };

    createExercise.mutate(body, {
      onSuccess: ({exerciseId, exercises}) => {
        onSuccess && onSuccess(exerciseId, exercises);
      },
    });
  }, [createExercise, group, name, onSuccess, type, youtubeId]);

  const youtubeFormErrorMsg = useMemo(() => {
    return youtubeId && !isValidYoutubeId(youtubeId) ? 'Invalid YouTube video id' : '';
  }, [youtubeId]);

  const isFormComplete = !!name && !!type && !!group;
  const isFormValid = !youtubeFormErrorMsg;
  const isWorking = exercise ? updateExercise.isWorking : createExercise.isWorking;
  const isSaveDisabled =
    !isFormValid || (exercise ? !isFormComplete || isFormUntouched : !isFormComplete);

  return (
    <div className="space-y-6">
      <FormInput label="Name" value={name} onChange={setName} autoFocus />

      <Select
        onChange={e => setGroup(Number(e.target.value))}
        value={group}
        label="Muscle group"
        disabled={!!exercise}
      >
        <option value="" disabled>
          Choose muscle group
        </option>
        {muscleGroups &&
          muscleGroups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
      </Select>

      <Select
        onChange={e => setType(e.target.value)}
        value={type}
        label="Exercise type"
        disabled={!!exercise}
      >
        <option value="" disabled>
          Choose exercise type
        </option>
        {Object.values(EXERCISE_TYPE).map(type => {
          return (
            <option key={`exercise-type-${type}`} value={type}>
              {type.charAt(0).toUpperCase() + type.replaceAll('-', ' ').slice(1)}
            </option>
          );
        })}
      </Select>

      <FormInput
        label={
          <div className="flex space-x-2">
            {!!youtubeFormErrorMsg && <Warning className="shrink-0" size={20} />}
            <span>{youtubeFormErrorMsg || 'YouTube video id'}</span>
          </div>
        }
        value={youtubeId}
        hasError={!!youtubeFormErrorMsg}
        onChange={text => {
          const parsedId = extractYoutubeId(text);
          if (isValidYoutubeId(parsedId)) {
            setYoutubeId(parsedId);

            return;
          } else {
            logError(new Error('Failed to parse YouTube url'), {
              extraData: {
                text,
                parsedId,
              },
            });
          }

          setYoutubeId(text);
        }}
      />

      {/* Children be passed in that are controlled by another component but appear in the middle of this form */}
      <div>{children}</div>

      <div className="flex justify-end gap-4">
        <button className="btn btn-primary btn-ghost" onClick={onClose}>
          Cancel
        </button>

        <button
          className="btn btn-primary"
          disabled={isSaveDisabled || isWorking}
          onClick={exercise ? handleUpdateExercise : handleCreateExercise}
        >
          {isWorking && <span className="loading"></span>}
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

ExerciseForm.propTypes = {
  children: node,
  exercise: object,
  onClose: func.isRequired,
  onSuccess: func,
  saveLabel: string,
};
