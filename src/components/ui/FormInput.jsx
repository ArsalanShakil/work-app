import {bool, func, node, number, oneOfType, string} from 'prop-types';
import {twMerge} from 'tailwind-merge';

import NumberInput from './NumberInput.jsx';

export default function FormInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  type = 'text',
  id,
  trailingAddOn,
  className,
  hasError,
  classNameLabel,
  ...props
}) {
  const inputFieldProps = {
    id,
    type,
    name,
    value,
    className: twMerge(
      'input input-bordered w-full pl-3 font-normal min-h-0 h-10',
      'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent-focus rounded-sm',
      `${trailingAddOn ? 'pr-10' : ''} ${className}`
    ),
    placeholder,
    onChange: ({target}) => onChange(target.value),
    ...props,
  };

  return (
    <div>
      <label
        htmlFor={name}
        className={twMerge(
          `mb-2 block text-sm font-medium text-base-content${
            hasError ? ' ' + 'text-error-content' : ''
          }`,
          classNameLabel
        )}
      >
        {label}
      </label>
      <div className="relative">
        {type === 'number' ? <NumberInput {...inputFieldProps} /> : <input {...inputFieldProps} />}
        {!!trailingAddOn && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailingAddOn}</div>
        )}
      </div>
    </div>
  );
}

FormInput.propTypes = {
  className: string,
  id: string,
  label: node,
  type: string,
  name: string,
  placeholder: string,
  value: oneOfType([string, number]),
  onChange: func,
  trailingAddOn: node,
  hasError: bool,
  classNameLabel: string,
};
