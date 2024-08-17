import {Transition} from '@headlessui/react';
import {node} from 'prop-types';
import {Fragment} from 'react';

import {ANIMATION_DURATION} from '../../constants.js';

export default function TransitionOpacity({children, ...rest}) {
  return (
    <Transition
      {...rest}
      as={Fragment}
      enter={`transition duration-${ANIMATION_DURATION} ease-out`}
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave={`transition duration-${ANIMATION_DURATION} ease-out`}
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
    >
      {children}
    </Transition>
  );
}

TransitionOpacity.propTypes = {
  children: node.isRequired,
};
