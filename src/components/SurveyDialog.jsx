import {bool} from 'prop-types';
import {useCallback, useState} from 'react';

import common from '../../../../config/common.json5';
import {getSortedBy} from '../../../../lib/sort.mjs';
import {useAttributionSurvey} from '../api.js';
import Dialog from './ui/Dialog.jsx';

const options = [
  ...getSortedBy(common.attribution.survey.randomOrderValues, () => Math.random()),
  ...common.attribution.survey.fixedValues,
];

export default function SurveyDialog({isOpen}) {
  const [attribution, setAttribution] = useState('');
  const survey = useAttributionSurvey();

  const handleChange = useCallback(event => {
    if (event.target.checked) {
      setAttribution(event.target.value);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    survey.mutate({attribution});
  }, [attribution, survey]);

  return (
    <Dialog isOpen={isOpen} title="How did you hear about us?">
      <div className="form-control">
        {options.map(opt => {
          return (
            <label key={opt} className="label flex cursor-pointer justify-start">
              <input
                type="radio"
                value={opt}
                className="radio mr-3 checked:bg-primary"
                checked={attribution === opt}
                onChange={handleChange}
              />
              <span className="label-text">{opt}</span>
            </label>
          );
        })}
      </div>

      <button
        className="btn btn-accent w-full"
        disabled={!attribution || survey.isWorking}
        onClick={handleSubmit}
      >
        {survey.isWorking && <span className="loading" />}
        Submit
      </button>
    </Dialog>
  );
}

SurveyDialog.propTypes = {
  isOpen: bool.isRequired,
};
