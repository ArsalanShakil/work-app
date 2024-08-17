import {Menu} from '@headlessui/react';
import {useIsMutating} from '@tanstack/react-query';
import {bool, func, node, string} from 'prop-types';
import {NavLink} from 'react-router-dom';
import {twMerge} from 'tailwind-merge';

import {useMutationCallback} from '../../utils/hooks.js';

const defaultStyles =
  'block px-4 py-3 text-sm text-base-content hover:bg-base-200 flex items-center w-full cursor-pointer';

export function styles(isActive, divider) {
  return `${defaultStyles} ${isActive && 'bg-gray-100 text-base-content'} ${
    divider && 'border-b border-base-200'
  }`;
}

export function MenuButton({onClick, icon, label, divider, className, disabled}) {
  const handleClick = useMutationCallback(onClick);
  const isMutating = useIsMutating();

  return (
    <Menu.Item disabled={disabled || isMutating}>
      <button
        onClick={handleClick}
        disabled={disabled || isMutating}
        className={`${twMerge(
          styles(false, divider),
          `${disabled || isMutating ? 'bg-base-200/20 text-base-300/50' : ''}`,
          `${!disabled ? className : ''}`
        )}`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </button>
    </Menu.Item>
  );
}

MenuButton.propTypes = {
  onClick: func,
  icon: node,
  label: node,
  divider: bool,
  className: string,
  disabled: bool,
};

export function MenuLink({to, icon, label}) {
  return (
    <Menu.Item>
      <NavLink to={to} className={defaultStyles}>
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </NavLink>
    </Menu.Item>
  );
}

MenuLink.propTypes = {
  to: string.isRequired,
  icon: node,
  label: string,
};
