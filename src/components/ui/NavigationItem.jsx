import {bool, func, node, string} from 'prop-types';
import {Link, useMatch} from 'react-router-dom';

const linkBase =
  'group flex items-center px-2 py-1.5 desktop:py-2 text-sm font-medium text-neutral-content cursor-pointer hover:bg-neutral';

export default function NavigationItem({
  disableActive,
  icon,
  label,
  to,
  onClick = () => {},
  ...restProps
}) {
  const match = useMatch(to || '');

  if (to) {
    return (
      <Link
        className={`${linkBase} ${match && !disableActive ? 'bg-neutral' : ''}`}
        to={to}
        onClick={onClick}
        {...restProps}
      >
        <span className="mr-3 flex">{icon}</span>
        {label}
      </Link>
    );
  }

  return (
    <div className={`${linkBase} hover:bg-neutral`} onClick={onClick} {...restProps}>
      <span className="mr-3 flex">{icon}</span>
      {label}
    </div>
  );
}

NavigationItem.propTypes = {
  disableActive: bool,
  icon: node,
  label: string,
  to: string,
  onClick: func,
};
