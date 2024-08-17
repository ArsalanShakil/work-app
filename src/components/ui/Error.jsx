import {object, oneOfType, string} from 'prop-types';
import {Balancer} from 'react-wrap-balancer';

import logoUrl from '../../assets/logo.png';

export default function Error({error}) {
  return (
    <div className="mt-[58px] flex h-full items-center justify-center desktop:mt-4">
      <div className="flex h-full w-full flex-col bg-base-100 p-12">
        <div className="mx-auto">
          <img className="h-5 w-auto desktop:h-8" src={logoUrl} alt="RP logo" />
        </div>
        <div className="mt-8 text-center">
          <p className="text-2xl">Whoops!</p>
          <p className="mt-2 text-lg">{error.message}</p>
          <p className="mt-6">
            <Balancer>Please refresh the page or force quit and re-open your app.</Balancer>
          </p>
          <p className="mt-6">
            <Balancer>
              Our engineers have been notified and are working hard to resolve the issue as quickly
              as possible.
            </Balancer>
          </p>
        </div>
      </div>
    </div>
  );
}

Error.propTypes = {
  error: oneOfType([object, string]).isRequired,
};
