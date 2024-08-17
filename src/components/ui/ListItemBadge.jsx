import {node, oneOfType, string} from 'prop-types';
import {twMerge} from 'tailwind-merge';

export default function ListItemBadge({label, className}) {
  return (
    <div
      className={twMerge(
        'badge badge-ghost badge-lg border-none px-1.5 py-2 text-xs leading-4 tracking-wide uppercase dark:bg-base-100',
        className
      )}
    >
      {label}
    </div>
  );
}

ListItemBadge.propTypes = {
  label: oneOfType([string, node]).isRequired,
  className: string,
};
