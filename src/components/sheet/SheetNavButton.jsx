import {CaretLeft} from '@phosphor-icons/react';
import {func, node, number, string} from 'prop-types';
import {useMemo} from 'react';
import {twMerge} from 'tailwind-merge';

export default function SheetNavButton({label, currentPage, pageNumber, onClick, className, icon}) {
  // TODO: There's a small bug here where the buttons don't have height, as evidenced by not seeing the bg-ping-100
  const base =
    'absolute bg-pink-100 inset-0 flex items-center text-sm text-base-content outline-none transition duration-200 ease-in-out';
  const center = 'opacity-100 z-10';
  const left = '-translate-x-24 opacity-0 z-0';
  const right = 'opacity-0 z-0';

  const classes = useMemo(() => {
    if (currentPage === pageNumber) {
      return twMerge(base, center, className);
    } else if (currentPage > pageNumber) {
      return twMerge(base, left, className);
    } else {
      return twMerge(base, right, className);
    }
  }, [className, currentPage, pageNumber]);

  return (
    <button onClick={onClick} className={classes}>
      {icon !== false && (icon ? icon : <CaretLeft size={20} />)}
      {label}
    </button>
  );
}

SheetNavButton.propTypes = {
  label: node,
  icon: node,
  currentPage: number.isRequired,
  pageNumber: number.isRequired,
  onClick: func.isRequired,
  className: string,
};
