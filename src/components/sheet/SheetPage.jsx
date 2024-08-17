import {node, number, string} from 'prop-types';
import {useMemo} from 'react';
import {twMerge} from 'tailwind-merge';

import {ANIMATION_DURATION} from '../../constants.js';

const center = `absolute inset-0 flex h-full translate-x-0 flex-col bg-base-100 dark:bg-base-200 transition duration-${ANIMATION_DURATION} ease-in-out `;
const left = `absolute inset-0 flex h-full -translate-x-16 flex-col bg-base-100 dark:bg-base-200 transition duration-${ANIMATION_DURATION} ease-in-out `;
const right = `absolute inset-0 flex h-full translate-x-full flex-col bg-base-100 dark:bg-base-200 transition duration-${ANIMATION_DURATION} ease-in-out `;

export default function SheetPage({children, className, currentPage, pageNumber}) {
  const classes = useMemo(() => {
    if (currentPage === pageNumber) {
      return twMerge(center, className);
    } else if (currentPage < pageNumber) {
      return twMerge(right, className);
    } else {
      return twMerge(left, className);
    }
  }, [className, currentPage, pageNumber]);

  return <div className={classes}>{children}</div>;
}

SheetPage.propTypes = {
  children: node,
  className: string,
  currentPage: number.isRequired,
  pageNumber: number.isRequired,
};
