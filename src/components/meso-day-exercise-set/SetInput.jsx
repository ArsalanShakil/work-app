import {bool, func, node, number, oneOfType, string} from 'prop-types';
import {memo, useCallback, useRef} from 'react';

import {STATUSES_FINISHED} from '../../../../../lib/training/constants.mjs';
import {SET_INPUTS} from '../../constants.js';
import {useMutationCallback} from '../../utils/hooks.js';
import useLocalStore from '../../utils/useLocalStore.js';
import NumberInput from '../ui/NumberInput.jsx';
import Ping from '../ui/Ping.jsx';

const SetInput = memo(function SetInput({
  setId,
  setStatus,
  inputType,
  placeholder,
  value,
  onChange,
  onBlur,
  showPing,
  error,
  children,
  ...inputProps
}) {
  const setFocusedSetId = useLocalStore(st => st.setFocusedSetId);
  const setFocusedSetInputType = useLocalStore(st => st.setFocusedSetInputType);
  const inputRef = useRef();

  const handleEnter = useMutationCallback(event => {
    if (event.key === 'Enter') {
      inputRef.current.blur();
    }
  }, []);

  const handleFocus = useCallback(() => {
    setFocusedSetId(setId);
    setFocusedSetInputType(inputType);
  }, [setFocusedSetId, setId, setFocusedSetInputType, inputType]);

  const isSetCompleted = STATUSES_FINISHED.set.includes(setStatus);

  return (
    <div className="relative flex w-4/5 items-center justify-center desktop:w-2/3">
      <NumberInput
        ref={inputRef}
        id={`input-${inputType}-${setId}`}
        className={`h-[32px] w-full rounded-none px-1 text-center text-base-content outline-none transition-opacity ${
          isSetCompleted
            ? 'bg-base-200/30 dark:bg-base-300/20'
            : 'border bg-base-200/50 dark:border-base-300/70 dark:bg-base-300/40'
        } ${error ? 'border-accent' : ''}`}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={handleFocus}
        onKeyDown={handleEnter}
        placeholder={placeholder}
        value={value}
        inputMode={inputType === SET_INPUTS.weight ? 'decimal' : 'numeric'}
        {...inputProps}
      />
      {showPing && <Ping />}
      {children}
    </div>
  );
});

SetInput.propTypes = {
  children: node,
  value: oneOfType([string, number]),
  error: bool.isRequired,
  inputType: string.isRequired,
  onBlur: func.isRequired,
  onChange: func.isRequired,
  placeholder: oneOfType([string, number]),
  setId: number.isRequired,
  setStatus: string.isRequired,
  showPing: bool.isRequired,
};

export default SetInput;
