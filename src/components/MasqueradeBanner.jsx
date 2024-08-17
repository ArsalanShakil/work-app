import {useState} from 'react';

import {useUserProfile} from '../api.js';
import {LS_KEY_MASQUERADE} from '../constants.js';
import signOut from '../utils/signOut.js';
import storage from '../utils/storage.js';

export default function MasqueradeBanner() {
  const isMasquerading = storage.getItem(LS_KEY_MASQUERADE);

  const [isAnimating, setIsAnimating] = useState(false);
  const {data: user} = useUserProfile();

  if (isMasquerading) {
    return (
      <div
        className={`${
          isAnimating ? 'bg-covfefe' : 'bg-pink-500'
        } top-0 flex w-full items-center justify-between gap-2 p-2 text-white`}
      >
        <button onClick={() => setIsAnimating(!isAnimating)} className="btn btn-primary btn-xs">
          {isAnimating ? 'Stop covfefe' : 'Start covfefe'}
        </button>
        <p className="flex-1 text-center font-semibold">You are masquerading as {user.email}</p>
        <button className="btn btn-primary btn-xs" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return null;
}
