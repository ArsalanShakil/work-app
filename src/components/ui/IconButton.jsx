import {autoPlacement, offset, shift, useFloating} from '@floating-ui/react';
import {Menu, Popover} from '@headlessui/react';
import {bool, func, node, string} from 'prop-types';
import {cloneElement} from 'react';
import {twMerge} from 'tailwind-merge';

import {useMutationCallback} from '../../utils/hooks.js';
import IconButtonMenuLabel from './IconButtonMenuLabel.jsx';
import TransitionOpacity from './TransitionOpacity.jsx';

export default function IconButton({
  disabled,
  icon,
  onClick = () => {},
  title,
  tooltip,
  children,
  anchorX = 'right',
  anchorY = 'top',
  size = 'lg',
  buttonClasses = '',
}) {
  // FIXME: Volpe we need ned to test the disabled state of the icon button so it looks disabled in both themes
  const iconClone = cloneElement(icon, {
    size: icon.props.size || 25,
    className: twMerge(
      `text-base-content cursor-pointer ${disabled ? 'text-base-300' : ''}`,
      icon.props.className
    ),
  });

  const config = {
    transform: false,
    middleware: [
      shift({crossAxis: true}),
      offset({mainAxis: 8}),
      autoPlacement({
        allowedPlacements:
          anchorX === 'left' ? ['bottom-start', 'top-start'] : ['bottom-end', 'top-end'],
      }),
    ],
  };

  const {refs, floatingStyles} = useFloating(config);

  const handleClick = useMutationCallback(onClick);

  return (
    <>
      {!tooltip && !children && (
        <button
          disabled={disabled}
          className={twMerge(`outline-none ${disabled ? 'cursor-default' : ''}`, buttonClasses)}
          onClick={onClick}
          title={title}
        >
          {iconClone}
        </button>
      )}

      {tooltip && !children && (
        <Popover className="relative flex">
          <Popover.Button className="outline-none">{iconClone}</Popover.Button>
          <TransitionOpacity>
            <Popover.Panel
              role="tooltip"
              className={`absolute ${anchorX === 'left' ? 'left-0' : 'right-0'} ${
                anchorY === 'bottom'
                  ? size === 'sm'
                    ? 'bottom-5'
                    : 'bottom-10'
                  : size === 'sm'
                  ? 'top-5'
                  : 'top-10'
              } z-10 border border-gray-200 bg-base-100 text-sm text-base-content shadow-md duration-200`}
            >
              <div className="flex w-[200px] grow p-2">{tooltip}</div>
            </Popover.Panel>
          </TransitionOpacity>
        </Popover>
      )}

      {!tooltip && children && (
        <Menu className="relative flex" as="div">
          <Menu.Button
            ref={refs.setReference}
            className={twMerge('', buttonClasses)}
            onClick={handleClick}
          >
            {iconClone}
          </Menu.Button>
          <TransitionOpacity>
            <Menu.Items
              ref={refs.setFloating}
              style={floatingStyles}
              className={`z-30 w-max divide-y divide-base-200 bg-base-100 shadow-lg ring-1 ring-black/5 focus:outline-none`}
            >
              {title && <IconButtonMenuLabel label={title} />}
              {children}
            </Menu.Items>
          </TransitionOpacity>
        </Menu>
      )}
    </>
  );
}

IconButton.propTypes = {
  buttonClasses: string,
  disabled: bool,
  icon: node.isRequired,
  onClick: func,
  title: string,
  tooltip: node,
  children: node,
  anchorX: string,
  anchorY: string,
  size: string,
};
