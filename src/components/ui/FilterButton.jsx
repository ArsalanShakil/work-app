import {bool, func, node} from 'prop-types';

export default function FilterButton({active, children, onClick}) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-sm h-9 w-full font-normal uppercase ${
        active ? 'btn-secondary' : 'btn-outline dark:btn-ghost dark:bg-base-100'
      }`}
    >
      {children}
    </button>
  );
}

FilterButton.propTypes = {
  active: bool.isRequired,
  children: node.isRequired,
  onClick: func.isRequired,
};
