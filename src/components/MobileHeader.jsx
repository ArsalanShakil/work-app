import {ArrowsClockwise, List} from '@phosphor-icons/react';
import {useCallback, useEffect, useState} from 'react';

import logoUrl from '../assets/logo.png';
import {MOBILE_HEADER_PORTAL_NODE} from '../constants.js';
import {useIsUpgradeAvailable} from '../utils/hooks.js';
import {forceReload} from '../utils/misc.js';
import InstallDialog from './InstallDialog.jsx';
import MobileSidebar from './MobileSidebar.jsx';

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [spin, setSpin] = useState(false);

  const {isUpgradeAvailable, latestVersion} = useIsUpgradeAvailable();

  const handleReload = useCallback(() => {
    forceReload(latestVersion);
  }, [latestVersion]);

  useEffect(() => {
    if (isUpgradeAvailable) {
      const interval = setInterval(() => {
        setSpin(true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [spin, isUpgradeAvailable]);

  useEffect(() => {
    if (spin && isUpgradeAvailable) {
      const timeout = setTimeout(() => setSpin(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [spin, isUpgradeAvailable]);

  return (
    <div className="sticky top-0 z-30 mx-auto w-full divide-y divide-base-200 dark:divide-base-300/40">
      <InstallDialog />

      {isUpgradeAvailable && (
        <div
          onClick={handleReload}
          className="flex items-center bg-base-100 px-4 py-2.5 text-base-content dark:bg-base-200 dark:text-neutral-content"
        >
          <div className="flex w-full justify-between space-x-2 text-sm leading-6">
            <div className="flex gap-x-3">
              <ArrowsClockwise size={24} className={`${spin ? 'animate-spin' : ''}`} />
              <span className="font-semibold">App update available</span>
            </div>
            <span>Refresh</span>
          </div>
        </div>
      )}

      <div className="w-full bg-base-100 p-4 shadow-sm dark:bg-base-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-end gap-4">
            <img className="h-5 w-auto" src={logoUrl} alt="RP logo" />
            <h1 className="text-base leading-none text-base-content">Hypertrophy Beta</h1>
          </div>

          <div className="flex gap-4">
            <List size={25} onClick={() => setIsOpen(true)} />

            <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      </div>

      <div id={MOBILE_HEADER_PORTAL_NODE} />
    </div>
  );
}
