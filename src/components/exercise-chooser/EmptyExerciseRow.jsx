import {func} from 'prop-types';

export default function EmptyExerciseRow({onClick}) {
  return (
    <div className="w-full text-center">
      <p className="space-x-2 text-center text-sm">
        <span className="hidden desktop:inline">Can&apos;t find what you&apos;re looking for?</span>
        <span className="cursor-pointer text-accent" onClick={onClick}>
          Create a custom exercise
        </span>
      </p>
    </div>
  );
}

EmptyExerciseRow.propTypes = {
  onClick: func.isRequired,
};
