import logoUrl from '../assets/logo.png';
import {AUTH_URL} from '../constants.js';
import BlockingDialog from './ui/BlockingDialog.jsx';

export default function SignIn() {
  return (
    <BlockingDialog noSideBar>
      <div className="flex h-full w-full justify-center">
        <div className="flex h-full w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
          <div>
            <img className="h-16 w-auto" src={logoUrl} alt="RP logo" />
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-widest text-primary">
              Hypertrophy
            </h2>
          </div>

          <div className="prose mt-10 w-full">
            <div>
              <p className="text-xl font-semibold">Welcome!</p>
              {/* <p>
                <Balancer>Carolyn will fill in more words here for you!</Balancer>
              </p> */}
            </div>

            <div className="flex w-full flex-col space-y-4">
              <a
                className="btn btn-primary btn-block"
                href={`${AUTH_URL}/login?redirect=${window.location.origin}`}
                tabIndex={-1}
              >
                Sign in
              </a>
              <div>
                <a href="https://rp.app/hypertrophy" tabIndex={-1}>
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlockingDialog>
  );
}
