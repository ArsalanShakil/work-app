import {Dialog as HeadlessDialog, Transition} from '@headlessui/react';
import {bool, func, node, string} from 'prop-types';
import {Fragment, useEffect} from 'react';

import {ANIMATION_DURATION, SIDEBAR_WIDTH} from '../../constants.js';
import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../../utils/index.js';
import useLocalStore from '../../utils/useLocalStore.js';

function StatusBarWrapper({children, isOpen, fullScreen}) {
  const theme = useLocalStore(st => st.theme);

  useEffect(() => {
    setTheDomStatusBarColor(
      theme,
      isOpen && !fullScreen ? STATUS_BAR_COLOR_TYPES.modalOpen : false
    );
  }, [fullScreen, isOpen, theme]);

  return children;
}

function getMaxWidth(size) {
  let maxWidthClass = '';
  switch (size) {
    case 'sm':
      maxWidthClass = 'max-w-sm';
      break;
    default:
    case 'md':
      maxWidthClass = 'max-w-md';
      break;
    case 'lg':
      maxWidthClass = 'max-w-lg';
      break;
    case 'xl':
      maxWidthClass = 'max-w-xl';
      break;
    case '2xl':
      maxWidthClass = 'max-w-2xl';
      break;
    case '3xl':
      maxWidthClass = 'max-w-3xl';
      break;
    case '4xl':
      maxWidthClass = 'max-w-4xl';
      break;
  }

  return maxWidthClass;
}

export default function Dialog({
  isOpen,
  onClose = () => {},
  children,
  size = 'md',
  title = '',
  noSideBar = false,
  fullScreen,
  disablePadding,
  supportSheets,
}) {
  const isDesktop = useLocalStore(st => st.isDesktop);
  const hasSidebar = isDesktop && !noSideBar;
  const maxWidth = getMaxWidth(size);

  return (
    <Transition show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-40" onClose={onClose}>
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

        <div className="fixed inset-0 overflow-y-auto">
          <div
            className={`${
              fullScreen && !isDesktop
                ? 'fixed inset-0'
                : 'flex min-h-full items-center justify-center p-4 '
            } text-center`}
          >
            <Transition.Child
              as={Fragment}
              enter={`ease-out duration-${ANIMATION_DURATION}`}
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave={`ease-in duration-${ANIMATION_DURATION}`}
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={`relative flex h-full w-full flex-col overflow-hidden bg-white text-left align-middle shadow-xl transition dark:bg-base-200 ${
                  fullScreen && !isDesktop ? 'fixed inset-0' : maxWidth
                } ${disablePadding ? '' : 'p-6'}`}
                style={{marginLeft: hasSidebar ? SIDEBAR_WIDTH : 0}}
              >
                {!supportSheets && (
                  <div className="h-full space-y-6">
                    {title && (
                      <HeadlessDialog.Title as="h3" className="dialog-heading">
                        {title}
                      </HeadlessDialog.Title>
                    )}
                    <StatusBarWrapper isOpen={isOpen} fullScreen={fullScreen}>
                      {children}
                    </StatusBarWrapper>
                  </div>
                )}

                {supportSheets && (
                  <StatusBarWrapper isOpen={isOpen} fullScreen={fullScreen}>
                    {children}
                  </StatusBarWrapper>
                )}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

Dialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func,
  children: node,
  size: string,
  title: string,
  noSideBar: bool,
  fullScreen: bool,
  disablePadding: bool,
  supportSheets: bool,
};
