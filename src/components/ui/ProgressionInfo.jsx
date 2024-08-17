import {string} from 'prop-types';
import {twMerge} from 'tailwind-merge';

export default function ProgressionInfo({className}) {
  return (
    <div className={twMerge('my-8 space-y-4 text-sm', className)}>
      <h4 className="block text-xl font-medium">About progression rates</h4>
      <p>
        Primary muscle groups will be progressed based on your feedback to optimize muscle growth,
        potentially adding many sets if you&apos;re responding well. This will enhance growth
        opportunities but also require more time and effort in your training sessions.
      </p>
      <p>
        Secondary muscle groups will be progressed to maintain or slightly increase size and greatly
        enhance strength, without targeting maximum growth. This strategy suits muscles you wish to
        keep the same size or allow modest growth, preventing interference with primary muscles and
        reducing overall fatigue and training duration.
      </p>
    </div>
  );
}

ProgressionInfo.propTypes = {
  className: string,
};
