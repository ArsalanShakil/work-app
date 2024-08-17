import {CheckCircle} from '@phosphor-icons/react';
import {format} from 'date-fns';
import {bool, string} from 'prop-types';

import useLocalStore from '../../utils/useLocalStore.js';

export default function CompleteBadge({finishedAt, displayDate}) {
  const isDesktop = useLocalStore(st => st.isDesktop);

  return (
    <button
      className={displayDate || isDesktop ? '' : 'tooltip tooltip-left'}
      data-tip={`${format(new Date(finishedAt), 'LLL d, yyyy')}`}
      onClick={e => e.stopPropagation()}
    >
      {!isDesktop && !displayDate && (
        <CheckCircle weight="fill" size={22} className="text-emerald-600 dark:text-emerald-500" />
      )}

      {(isDesktop || displayDate) && (
        <div className="flex gap-1 bg-emerald-100 px-1.5 py-1 text-xs uppercase tracking-wide text-emerald-700 dark:bg-emerald-700 dark:text-emerald-500">
          {format(new Date(finishedAt), 'LLL d, yyyy')}
          <CheckCircle weight="fill" size={16} className="text-emerald-600 dark:text-emerald-500" />
        </div>
      )}
    </button>
  );
}

CompleteBadge.propTypes = {
  displayDate: bool,
  finishedAt: string.isRequired,
};
