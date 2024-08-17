import {bool, func} from 'prop-types';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';

import {BODYWEIGHT_MAX, BODYWEIGHT_MIN} from '../../../../lib/training/constants.mjs';
import {getLatestBodyweight} from '../../../../lib/training/utils.mjs';
import {useUpdateDayBodyweight} from '../api.js';
import {UNIT_DISPLAY} from '../constants.js';
import {useMesoDay, useMutationCallback} from '../utils/hooks.js';
import {parseNumberLocale} from '../utils/parseNumberLocale.js';
import SheetNav from './sheet/SheetNav.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import FormInput from './ui/FormInput.jsx';
import Message from './ui/Message.jsx';

function getInputTextFromNum(num) {
  if (num === null) {
    return '';
  }
  return String(num);
}

function getNumFromInputText(text) {
  if (text === '') {
    return null;
  }

  return parseNumberLocale(text);
}

export default function MesoDayBodyweightForm({hasCompletedBodyweightSets, onClose}) {
  const {day, meso} = useMesoDay();

  const [weightText, setWeightText] = useState(getInputTextFromNum(day.bodyweight));
  const [focused, setFocused] = useState('');
  const [found, setFound] = useState(false);

  const updateBodyweight = useUpdateDayBodyweight(day.id);

  const handleUpdateBodyweight = useMutationCallback(
    (bodyweight, unit) => {
      updateBodyweight.mutate({bodyweight, unit}, {onSuccess: onClose});
    },
    [onClose, updateBodyweight]
  );

  const handleClose = useCallback(() => {
    setWeightText('');
    onClose();
  }, [onClose]);

  const weight = useMemo(() => getNumFromInputText(weightText), [weightText]);

  const buttonDisabled =
    updateBodyweight.isWorking ||
    weight < BODYWEIGHT_MIN[meso.unit] ||
    weight > BODYWEIGHT_MAX[meso.unit];

  // Find best initial value for weight input.
  useEffect(() => {
    if (!weightText) {
      if (!day.bodyweight) {
        if (!found) {
          // if we haven't already found something, look backwards in the meso for a previous bodyweight
          const {bodyweight} = getLatestBodyweight(meso.weeks);
          if (bodyweight) {
            setWeightText(getInputTextFromNum(bodyweight));
            setFound(true);
          }
        }
      } else if (!focused) {
        // start with bodyweight
        setWeightText(getInputTextFromNum(day.bodyweight));
      }
    }
  }, [focused, found, meso.weeks, day.bodyweight, weightText]);

  const handleChange = useCallback(val => {
    setWeightText(val);
  }, []);

  return (
    <Fragment>
      <div>
        <SheetTitle title="Bodyweight" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={onClose} />

      <div className="relative h-full desktop:min-h-[300px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 px-4 desktop:grow">
            <div className="mt-4 space-y-6">
              {day.bodyweight && hasCompletedBodyweightSets ? (
                <Message variant="warning">
                  Your updated bodyweight will be applied to already performed sets
                </Message>
              ) : (
                <p>This workout contains an exercise that requires your bodyweight.</p>
              )}

              <div className="space-y-3">
                <FormInput
                  label="Bodyweight"
                  type="number"
                  value={getInputTextFromNum(weightText)}
                  inputMode="decimal"
                  onChange={handleChange}
                  onBlur={() => setFocused(false)}
                  onFocus={() => setFocused(true)}
                  trailingAddOn={
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-base-content">
                      {UNIT_DISPLAY.plural[meso.unit]}
                    </div>
                  }
                />

                {found && (
                  <p className="text-xs text-base-content">* Prefilled based on a previous day.</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 shrink-0 p-4 standalone:pb-safe-offset-4">
            <div className="flex justify-end gap-4">
              <button className="btn btn-ghost" onClick={handleClose}>
                Cancel
              </button>
              <button
                disabled={buttonDisabled}
                className="btn btn-accent"
                onClick={() => handleUpdateBodyweight(weight, meso.unit)}
              >
                {updateBodyweight.isWorking && <span className="loading" />}
                {day.bodyweight ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </SheetPage>
      </div>
    </Fragment>
  );
}

MesoDayBodyweightForm.propTypes = {
  hasCompletedBodyweightSets: bool.isRequired,
  onClose: func.isRequired,
};
