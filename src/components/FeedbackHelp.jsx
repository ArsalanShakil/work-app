import {ArrowLeft} from '@phosphor-icons/react';
import {func, number, oneOf, string} from 'prop-types';
import {Fragment} from 'react';

import {
  exerciseJointPainFeedbackText,
  feedbackTypeNames,
  feedbackTypes,
  muscleGroupFeedbackText,
} from '../constants.js';
import IconButton from './ui/IconButton.jsx';

export default function FeedbackHelp({subject, muscleGroupId, type, onClickBack}) {
  const text =
    type === feedbackTypes.jointPain
      ? exerciseJointPainFeedbackText(subject)
      : muscleGroupFeedbackText(muscleGroupId)[type];

  return (
    <Fragment>
      <div className="flex items-center gap-2">
        <IconButton icon={<ArrowLeft className="text-primary" />} onClick={onClickBack} />
        <h2 className="dialog-heading">{feedbackTypeNames[type]} Ratings</h2>
      </div>
      <div className="space-y-4">
        {Object.keys(text.short).map(idx => (
          <div key={idx} className="space-y-1">
            <div className="font-bold">{text.short[idx]}:</div>
            <div className="text-xs">{text.long[idx]}</div>
          </div>
        ))}
      </div>
    </Fragment>
  );
}

FeedbackHelp.propTypes = {
  subject: string.isRequired,
  muscleGroupId: number,
  type: oneOf(Object.keys(feedbackTypes)).isRequired,
  onClickBack: func.isRequired,
};
