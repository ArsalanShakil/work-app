import {node, number, string} from 'prop-types';
import {useMemo} from 'react';
import {twJoin, twMerge} from 'tailwind-merge';

import {ANIMATION_DURATION} from '../../constants.js';

const base = `px-4 transition duration-${ANIMATION_DURATION} ease-in-out w-full`;
const inView = 'translate-x-0';
const slideUp = '-translate-y-8 scale-90 opacity-0';
const slideRight = 'translate-x-full';
export default function SheetTitle({title, className, pageNumber, currentPage, children, variant}) {
  const sectionClasses = useMemo(() => {
    const defaultClasses = twJoin(base, pageNumber === 1 ? 'mt-10' : '-mt-10');

    if (currentPage === pageNumber) {
      return twMerge(defaultClasses, className, inView);
    } else if (currentPage > pageNumber) {
      return twMerge(defaultClasses, className, slideUp);
    } else {
      return twMerge(defaultClasses, className, slideRight);
    }
  }, [className, currentPage, pageNumber]);

  return (
    <div className={sectionClasses}>
      <div className="flex min-h-[40px] min-w-full items-center justify-between">
        <h2
          className={`line-clamp-1 w-full ${
            variant === 'xl' ? 'text-2xl' : variant === 'sm' ? 'text-sm' : 'text-lg'
          } font-semibold`}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

SheetTitle.propTypes = {
  title: string,
  className: string,
  pageNumber: number.isRequired,
  currentPage: number.isRequired,
  children: node,
  variant: string,
};
