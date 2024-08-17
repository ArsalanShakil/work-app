import {bool, func, string} from 'prop-types';

export default function Checkbox({checked, label, onChange}) {
  return (
    <div className="form-control">
      <label className="label flex cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          value="foo"
          checked={checked}
          onChange={onChange}
          className="checkbox outline-none"
        />
        <span className="label-text">{label}</span>
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  checked: bool.isRequired,
  label: string,
  onChange: func.isRequired,
};
