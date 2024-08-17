import {CircleNotch, NotePencil, PushPin, PushPinSlash} from '@phosphor-icons/react';
import {bool, func, string} from 'prop-types';
import {useCallback} from 'react';

import {ANIMATION_DURATION} from '../../constants.js';
import {useNotifierContext} from '../../NotifierContext.jsx';
import IconButton from './IconButton.jsx';

export default function NoteDefault({noteText, isPinned, isSaving, isDeleting, onOpen, onPin}) {
  const {showNotification} = useNotifierContext();

  const handleClick = useCallback(() => {
    if (!(isSaving || isDeleting)) {
      onOpen();
    }
  }, [isDeleting, isSaving, onOpen]);

  const handlePin = useCallback(() => {
    const onSuccess = () =>
      showNotification({
        message: `Note ${isPinned ? 'un-pinned' : 'pinned'}`,
        type: 'success',
        autoClose: true,
      });
    onPin(onSuccess);
  }, [isPinned, onPin, showNotification]);

  return (
    <div
      className={`flex items-center justify-between p-1.5 ${
        isPinned ? 'bg-warning' : 'bg-base-200/30 dark:bg-base-content/10'
      }`}
    >
      <div
        onClick={handleClick}
        className="mr-1 flex w-full cursor-pointer items-center gap-2 overflow-hidden"
      >
        <div>
          <NotePencil
            size={18}
            className={`duration-${ANIMATION_DURATION} block transition-opacity group-focus-within/note:hidden`} // eslint-disable-line tailwindcss/no-custom-classname
          />
        </div>

        <p className="block truncate text-xs opacity-90">{isDeleting ? 'Deleting...' : noteText}</p>
      </div>

      {isSaving && <CircleNotch className="animate-spin" size={18} />}

      {onPin && !isSaving && !isDeleting && (
        <IconButton
          onClick={handlePin}
          icon={
            isPinned ? (
              <PushPin size={18} className="text-warning-content" />
            ) : (
              <PushPinSlash size={18} className="text-base-content/50" />
            )
          }
        />
      )}
    </div>
  );
}

NoteDefault.propTypes = {
  noteText: string.isRequired,
  isPinned: bool,
  isSaving: bool.isRequired,
  isDeleting: bool.isRequired,
  onOpen: func.isRequired,
  onPin: func,
};
