import {Balancer} from 'react-wrap-balancer';

import {useUserReferrals} from '../api.js';
import logoUrl from '../assets/logo.png';
import {getSubscribeUrl} from '../utils/index.js';
import BlockingDialog from './ui/BlockingDialog.jsx';
import ProfileMenu from './ui/ProfileMenu.jsx';

export default function Resubscribe() {
  const {data: userReferrals} = useUserReferrals();
  return (
    <BlockingDialog noSideBar>
      <div className="flex h-full w-full justify-center">
        <div className="flex h-full w-full max-w-md flex-col p-4">
          <div className="flex h-full w-full flex-col items-center justify-center px-4 py-12 text-center">
            <div>
              <img className="h-16 w-auto" src={logoUrl} alt="RP logo" />
              <h2 className="mt-3 text-3xl font-bold uppercase tracking-widest text-primary">
                Hypertrophy
              </h2>
            </div>

            <div className="mt-10 w-full">
              <div>
                <Balancer>Your subscription has expired.</Balancer>
              </div>
              <div className="flex w-full flex-col space-y-4">
                <a href={getSubscribeUrl(userReferrals)} className="btn btn-accent btn-block mt-5">
                  Renew subscription
                </a>
              </div>
            </div>
          </div>
          <ProfileMenu />
        </div>
      </div>
    </BlockingDialog>
  );
}
