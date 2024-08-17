import {func, string} from 'prop-types';
import {forwardRef, useCallback} from 'react';

import isValidDecimalTextInput from '../../utils/isValidDecimalTextInput.js';

const NumberInput = forwardRef(function NumberInput({value, onChange, ...restProps}, ref) {
  const handleChange = useCallback(
    e => {
      const textVal = e.target.value;
      if (!isValidDecimalTextInput(textVal)) {
        // Don't allow updating the text input with strings impossible for a number input
        return;
      }

      onChange(e);
    },
    [onChange]
  );

  return <input ref={ref} value={value} onChange={handleChange} {...restProps} type="text" />;
});

NumberInput.propTypes = {
  value: string.isRequired,
  onChange: func.isRequired,
};

export default NumberInput;
