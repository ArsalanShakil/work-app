import {arrayOf, bool, node, string} from 'prop-types';
import {twMerge} from 'tailwind-merge';

export default function Select({
  label,
  children,
  disabled,
  name,
  classNameWrapper,
  classNameSelect,
  classNameLabel,
  ...props
}) {
  return (
    <div className={twMerge('w-full', classNameWrapper)} style={{minWidth: 120}}>
      {label && (
        <label
          htmlFor={name}
          className={twMerge('mb-2 block text-sm font-medium text-base-content', classNameLabel)}
        >
          {label}
        </label>
      )}
      <select
        {...props}
        name={name}
        disabled={disabled}
        className={twMerge(
          'select select-bordered w-full pl-3 text-sm font-normal min-h-0 dark:bg-base-300/70',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
          classNameSelect
        )}
      >
        {children}
      </select>
    </div>
  );
}

Select.propTypes = {
  name: string,
  label: string,
  classNameWrapper: string,
  classNameSelect: string,
  classNameLabel: string,
  children: arrayOf(node).isRequired,
  disabled: bool,
};
