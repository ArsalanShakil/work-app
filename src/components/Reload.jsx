import {ArrowsClockwise} from '@phosphor-icons/react';
import {Fragment, useCallback, useEffect, useState} from 'react';

import {useIsUpgradeAvailable} from '../utils/hooks.js';
import {forceReload} from '../utils/misc.js';

export default function Reload() {
  const [spin, setSpin] = useState(false);

  const {isUpgradeAvailable, latestVersion} = useIsUpgradeAvailable();

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

  const handleReload = useCallback(() => {
    forceReload(latestVersion);
  }, [latestVersion]);

  if (!isUpgradeAvailable) {
    return null;
  }

  return (
    <Fragment>
      <div
        className="mb-3 cursor-pointer bg-gray-100 px-3 py-2 text-black shadow-md"
        onClick={handleReload}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium ">Update available.</p>
            <p className="text-xs">Click to refresh.</p>
          </div>
          <ArrowsClockwise size={32} className={`${spin ? 'animate-spin' : ''}`} />
        </div>
      </div>
    </Fragment>
  );
}
