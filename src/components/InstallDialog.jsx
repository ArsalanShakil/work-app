import {X} from '@phosphor-icons/react';
import {useCallback, useState} from 'react';
import {useMatch} from 'react-router-dom';

import androidShareImg from '../assets/android-share.png';
import shareImg from '../assets/share-to-home-screen.png';
import {LS_KEY_APP_PWA_SEEN} from '../constants.js';
import {getMobileOperatingSystem} from '../utils/index.js';
import storage from '../utils/storage.js';
import Dialog from './ui/Dialog.jsx';

export default function InstallDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [seen, setSeen] = useState(storage.getItem(LS_KEY_APP_PWA_SEEN));

  // TODO: This needs to be changed to something that means "IS_BOARD"
  const isNewMesoRoute = useMatch('/mesocycles/new');
  const isPwa = window.matchMedia('(display-mode: standalone)').matches;
  const os = getMobileOperatingSystem();

  // TODO: Consider other operating systems
  const isDesktop = os !== 'iOS' && os !== 'Android';

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    storage.setItem(LS_KEY_APP_PWA_SEEN, true);
    setSeen(true);
  }, []);

  if (seen || isPwa || isDesktop || isNewMesoRoute) {
    return null;
  }

  return (
    <div className="bg-base-100 p-4 dark:bg-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleDismiss}>
            <X size={24} />
          </button>
          <img className="h-10 w-auto rounded" src="/icon-512x512.png" alt="RP logo" />
          <div className="text-base-content">
            <p>RP Hypertrophy</p>
            <p className="text-xs">Science is Stronger</p>
          </div>
        </div>

        <button className="text-accent dark:text-base-content" onClick={() => setIsOpen(true)}>
          Install
        </button>
      </div>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-4">
          <h1 className="card-title text-3xl leading-none">Welcome!</h1>
          <p>For a better experience, add RP Hypertrophy to your homescreen</p>
        </div>
        <div className="shadow-md">
          {os === 'iOS' && <img className="object-fill" src={shareImg} />}
          {os !== 'iOS' && <img className="object-fill" src={androidShareImg} />}
        </div>

        <div className="flex justify-end gap-3">
          <button className="btn btn-ghost" onClick={handleDismiss}>
            Don&apos;t show again
          </button>
          <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
            Ok
          </button>
        </div>
      </Dialog>
    </div>
  );
}
