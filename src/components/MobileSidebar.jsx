import {Dialog as HeadlessDialog, Transition} from '@headlessui/react';
import {X} from '@phosphor-icons/react';
import {bool, func} from 'prop-types';
import {Fragment, useEffect} from 'react';

import logoUrl from '../assets/logo.png';
import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../utils/index.js';
import useLocalStore from '../utils/useLocalStore.js';
import {SidebarNavigation} from './SidebarNavigation.jsx';
import IconButton from './ui/IconButton.jsx';

export default function MobileSidebar({isOpen, onClose = () => {}}) {
  const theme = useLocalStore(st => st.theme);

  useEffect(() => {
    setTheDomStatusBarColor(theme, isOpen ? STATUS_BAR_COLOR_TYPES.sideBarOpen : false);
  }, [isOpen, theme]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter={`ease-out duration-100`}
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave={`ease-in duration-100`}
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity dark:bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <Transition.Child
            enter="transition ease-in-out duration-200 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
            as={Fragment}
          >
            <HeadlessDialog.Panel className="h-full w-full overflow-hidden bg-neutral-focus p-4 text-left align-middle shadow-xl transition-all dark:bg-base-200 sm:max-w-sm">
              <div className="flex items-center justify-between pl-2">
                <img className="h-5 w-auto" src={logoUrl} alt="RP logo" />
                <IconButton
                  onClick={onClose}
                  icon={<X size={24} className="text-base-100 dark:text-base-content" />}
                />
              </div>

              <SidebarNavigation onClose={onClose} />
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

MobileSidebar.propTypes = {
  isOpen: bool.isRequired,
  onClose: func,
};
