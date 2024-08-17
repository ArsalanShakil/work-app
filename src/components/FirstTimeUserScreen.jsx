import {bool, func} from 'prop-types';

import logoUrl from '../assets/logo.png';
import Dialog from './ui/Dialog.jsx';

export default function FirstTimeUserScreen({isOpen, onClose}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="max" fullScreen>
      <div className="flex h-full w-full justify-center">
        <div className="flex h-full w-full max-w-md flex-col items-center justify-center p-4 text-center">
          <div>
            <img className="h-16 w-auto" src={logoUrl} alt="RP logo" />
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-widest text-primary">
              Hypertrophy
            </h2>
          </div>

          <div className="prose mt-6 w-full text-left text-sm sm:mt-10 md:text-base standalone:text-base">
            <p>
              We&apos;ve designed this app so you have the easiest time creating and using
              muscle-building training programs that really work.
            </p>
            <p>
              If you get lost at any point, head to the help center where you can read FAQs, ask
              questions, and provide feedback.
            </p>
            <p>Enjoy your new gains, and treat your new powers responsibly!</p>
            <p className="text-right">- Dr. Mike Israetel</p>

            <button className="btn btn-accent btn-block mt-4" onClick={onClose} tabIndex={-1}>
              Let&apos;s get started
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

FirstTimeUserScreen.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
