import {bool, func, node, string} from 'prop-types';
import {Fragment, useState} from 'react';

import FormInput from './FormInput.jsx';
import Message from './Message.jsx';

export default function ConfirmContent({
  confirmText,
  confirmButtonText = 'Confirm',
  children,
  description,
  disabled,
  isLoading,
  message,
  onClose,
  onConfirm,
  variant = 'warning',
}) {
  const [userConfirmText, setUserConfirmText] = useState('');

  return (
    <Fragment>
      {message && <Message variant={variant}>{message}</Message>}

      {description && <p>{description}</p>}

      {children}

      {confirmText && (
        <div>
          <span>
            Please type <span className="mx-2 font-bold">{confirmText}</span> to confirm:
          </span>

          <FormInput
            placeholder={confirmText}
            label={null} // Not this time!!
            value={userConfirmText}
            onChange={setUserConfirmText}
          />
        </div>
      )}

      <div className="mt-8 flex justify-end space-x-3 pt-2">
        <div className="flex items-center space-x-3">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            disabled={
              disabled ||
              isLoading ||
              (confirmText && userConfirmText.toLowerCase().trim() !== confirmText)
            }
            className={`btn ${variant === 'error' ? 'btn-primary' : 'btn-accent'}`}
            onClick={onConfirm}
          >
            {isLoading && <span className="loading"></span>}
            {confirmButtonText}
          </button>
        </div>
      </div>
    </Fragment>
  );
}

ConfirmContent.propTypes = {
  confirmText: string,
  confirmButtonText: string,
  description: string,
  disabled: bool,
  isLoading: bool,
  message: string,
  onClose: func.isRequired,
  onConfirm: func,
  children: node,
  variant: string,
};
