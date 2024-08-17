import {AUTO_APPLY_WEIGHTS} from '../../../../lib/training/constants.mjs';
import {useUserProfile} from '../api.js';
import FeatureFlag from './FeatureFlag.jsx';
import Page from './ui/Page.jsx';

export default function UserProfile() {
  const {data: user} = useUserProfile();

  if (user) {
    return (
      <Page>
        <h1 className="mb-4 flex-1 text-2xl font-bold text-base-content desktop:text-3xl">
          Profile
        </h1>
        <div className="bg-base-100 p-4 shadow-sm">
          <div className="space-y-6">
            <div>
              <label htmlFor="profile-name" className="block text-sm text-base-content">
                Name
              </label>
              <div className="font-semibold">{user.displayName}</div>
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm text-base-content">
                Email
              </label>
              <div className="font-semibold">{user.email}</div>
            </div>
            <div>
              <label htmlFor="profile-created" className="block text-sm text-base-content">
                Created
              </label>
              <div className="font-semibold">{new Date(user.createdAt).toDateString()}</div>
            </div>
          </div>
        </div>

        <h1 className="mb-4 mt-8 flex-1 text-2xl font-bold text-base-content desktop:text-3xl">
          Settings
        </h1>
        <div className="bg-base-100 p-4 shadow-sm">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm uppercase">Exercise sets</h3>

              <FeatureFlag
                attr={AUTO_APPLY_WEIGHTS}
                // TODO: It might be nice to use the db value for the attr description
                description="When you change a weight value for a set, the app will automatically apply that value to all subsequent sets that match the original weight."
                title="Auto match weight updates"
              />
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
