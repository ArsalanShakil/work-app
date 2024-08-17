import {Dialog, Transition} from '@headlessui/react';
import {bool, func, node, string} from 'prop-types';
import {Fragment} from 'react';
import {twMerge} from 'tailwind-merge';

import {ANIMATION_DURATION} from '../../constants.js';
// import DragHandleTop from './DragHandleTop.jsx';

// https://developer.apple.com/design/human-interface-guidelines/sheets#iOS-iPadOS
export default function Sheet({children, inDialog, isOpen, onClose, sheetClasses}) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {!inDialog && (
          <Transition.Child
            as={Fragment}
            enter={`ease-out duration-${ANIMATION_DURATION}`}
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave={`ease-in duration-${ANIMATION_DURATION}`}
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 transition-opacity dark:bg-black/60" />
          </Transition.Child>
        )}

        <div className="fixed inset-0">
          <Transition.Child
            enter="transition-transform ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition-transform ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
            className={twMerge('fixed bottom-0 inset-x-0 h-full pt-14', sheetClasses)}
          >
            <Dialog.Panel className="relative flex h-full w-full flex-col overflow-hidden rounded-t-xl bg-base-100 text-left align-middle shadow-[0_0_4px_0_rgba(153,153,153,0.5)] transition dark:bg-base-200">
              {/* <DragHandleTop /> */}
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

Sheet.propTypes = {
  children: node.isRequired,
  inDialog: bool,
  isOpen: bool.isRequired,
  onClose: func.isRequired,
  sheetClasses: string,
};
