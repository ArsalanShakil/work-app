import {motion} from 'framer-motion';
import {arrayOf, func, number, oneOfType, shape, string} from 'prop-types';

export default function SegmentedControl({options, onClick, selected}) {
  return (
    <div className="flex rounded-lg bg-base-200/60 p-1 font-medium dark:bg-base-300">
      {options.map(option => (
        <button
          onClick={() => onClick(option.value)}
          key={option.value}
          // TODO: Try css "isolate" to see if we can get these buttons to be white instead of black in light
          className={`relative my-2 w-full border-r border-r-base-300/0 text-center text-sm text-base-content transition ${
            option.value === selected
              ? ''
              : `hover:cursor-pointer ${
                  options.length - 1 === option.value || option.value + 1 === selected
                    ? ''
                    : 'border-r-base-300/20 dark:border-r-base-200/80'
                } `
          }`}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {option.value === selected && (
            <motion.span
              layoutId="bubble"
              className="absolute -inset-y-2 inset-x-0 z-10 rounded-md bg-white mix-blend-difference"
              transition={{type: 'spring', bounce: 0.2, duration: 0.6}}
            />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}

SegmentedControl.propTypes = {
  options: arrayOf(
    shape({
      label: oneOfType([number, string]).isRequired,
      value: number.isRequired,
    })
  ).isRequired,
  selected: number.isRequired,
  onClick: func.isRequired,
};
