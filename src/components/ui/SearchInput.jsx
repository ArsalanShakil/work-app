import {X} from '@phosphor-icons/react';
import {func, string} from 'prop-types';

import FormInput from './FormInput.jsx';
import IconButton from './IconButton.jsx';

export default function SearchInput({onChange, onClear, value}) {
  return (
    <FormInput
      value={value}
      onChange={onChange}
      placeholder="Search"
      className="rounded-sm border-base-200 bg-base-200/50 focus:border-base-200 focus:ring-0 dark:bg-base-100 dark:focus:ring-base-300"
      trailingAddOn={
        value && (
          <IconButton
            onClick={onClear}
            icon={<X size={17} className="hover:text-base-content" />}
          />
        )
      }
    />
  );
}

SearchInput.propTypes = {
  onChange: func.isRequired,
  onClear: func.isRequired,
  value: string,
};
