import {CreditCard, SignOut} from '@phosphor-icons/react';

import {useUserProfile} from '../../api.js';
import {AUTH_URL} from '../../constants.js';
import signOut from '../../utils/signOut.js';

export default function ProfileMenu() {
  const {data: user} = useUserProfile();

  return (
    <div className="dropdown dropdown-top">
      <label
        tabIndex={0}
        className="btn btn-sm mt-2 w-full border-none bg-gray-200 lowercase leading-8 text-gray-500 hover:bg-gray-200 focus:bg-gray-200 dark:bg-base-100 dark:text-gray-200"
      >
        <p className="truncate">{user?.email}</p>
      </label>
      <ul tabIndex={0} className="menu dropdown-content w-full bg-base-100 shadow dark:bg-base-100">
        <li>
          <a href={`${AUTH_URL}/manage`}>
            <CreditCard />
            Manage my plans
          </a>
        </li>
        <li>
          <span onClick={signOut}>
            <SignOut />
            Sign out
          </span>
        </li>
      </ul>
    </div>
  );
}
