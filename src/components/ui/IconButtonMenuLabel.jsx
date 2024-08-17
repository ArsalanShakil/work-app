import {string} from 'prop-types';

export default function IconButtonMenuLabel({label}) {
  return (
    <div className="bg-base-200/50 px-10 py-2 text-xs font-semibold uppercase text-base-content/70">
      <label>{label}</label>
    </div>
  );
}

IconButtonMenuLabel.propTypes = {
  label: string.isRequired,
};
