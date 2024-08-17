import {Switch} from '@headlessui/react';
import {string} from 'prop-types';
import {twMerge} from 'tailwind-merge';

import {useFeatureFlagMutation, useUserProfile} from '../api.js';
import {useMutationCallback} from '../utils/hooks.js';

export default function FeatureFlag({attr, description, title}) {
  const {data: user} = useUserProfile();

  const flagMutation = useFeatureFlagMutation();

  const handleFlag = useMutationCallback(
    value => {
      flagMutation.mutate({[attr]: value});
    },
    [attr, flagMutation]
  );

  return (
    <div className="flex items-center justify-between gap-8">
      <div className="space-y-3">
        <div className="flex justify-between gap-4">
          <h3 className="font-medium">{title}</h3>

          <Switch
            checked={user.attributes[attr] || false}
            onChange={handleFlag}
            className={twMerge(
              user.attributes[attr] ? 'bg-accent' : 'bg-base-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100'
            )}
          >
            <span
              aria-hidden="true"
              className={twMerge(
                user.attributes[attr] ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              )}
            />
          </Switch>
        </div>

        <p className="text-sm text-base-300 dark:text-base-content">{description}</p>
      </div>
    </div>
  );
}

FeatureFlag.propTypes = {
  attr: string.isRequired,
  description: string,
  title: string.isRequired,
};
