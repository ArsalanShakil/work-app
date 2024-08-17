import {Question} from '@phosphor-icons/react';
import {bool, func, number, oneOf, oneOfType, string} from 'prop-types';

import {
  exerciseJointPainFeedbackText,
  feedbackTypeNames,
  feedbackTypes,
  muscleGroupFeedbackText,
} from '../constants.js';
import {useMuscleGroupsById} from '../utils/hooks.js';
import IconButton from './ui/IconButton.jsx';
import Message from './ui/Message.jsx';

export default function FeedbackForm({
  disabled,
  exerciseName,
  muscleGroupId,
  onChange,
  onClickHelp,
  value,
  type,
}) {
  const muscleGroupsById = useMuscleGroupsById();

  // we don't need feedback
  if (value === -1) {
    return;
  }

  const text =
    type === feedbackTypes.jointPain
      ? exerciseJointPainFeedbackText(exerciseName)
      : muscleGroupFeedbackText(muscleGroupId)[type];

  const options = Object.keys(text.short).map(Number);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold uppercase">
            {type !== feedbackTypes.jointPain && muscleGroupsById[muscleGroupId].name}{' '}
            {feedbackTypeNames[type]}
          </h2>
          {!disabled && (
            <IconButton
              icon={<Question size={18} className="hover:text-accent-focus" />}
              onClick={onClickHelp}
            />
          )}
        </div>

        {!disabled && <h3 className="text-xs text-base-content">{text.prompt}</h3>}
      </div>

      {disabled && (
        <Message>
          <span className="uppercase">{feedbackTypes[type]}</span> feedback is not required at this
          time
        </Message>
      )}

      {!disabled && (
        <div className="grid grid-flow-row grid-cols-4 gap-1">
          {options.map(index => (
            <button
              onClick={() => onChange(index)}
              key={`${type}-${index}`}
              className={`btn btn-accent px-1 dark:border-accent dark:text-base-content ${
                value === index
                  ? ''
                  : 'btn-outline bg-accent/5 hover:bg-accent focus:bg-accent focus:text-accent-content dark:bg-accent/20 dark:text-accent-content'
              }`}
            >
              <span className="!text-xxs sm:text-sm sm:!leading-4">{text.short[index]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

FeedbackForm.propTypes = {
  disabled: bool,
  exerciseName: string,
  muscleGroupId: number,
  onChange: func.isRequired,
  onClickHelp: func.isRequired,
  type: oneOf(Object.keys(feedbackTypes)).isRequired,
  value: oneOfType([string, number]),
};
