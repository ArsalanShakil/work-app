import {X} from '@phosphor-icons/react';
import {bool, func, node, string} from 'prop-types';
import {Fragment} from 'react';

export default function BottomSheet({isOpen, onClose, children, title}) {
  const classes = `absolute inset-0 top-12 bg-base-100 ${
    isOpen ? 'translate-y-0' : 'translate-y-full'
  } duration-300 rounded-t-xl transition ease-in-out dark:bg-base-200`;

  return (
    <Fragment>
      <div
        onClick={onClose}
        className={`absolute inset-0 transition duration-100 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } `}
      >
        <div
          className={`absolute inset-0 bg-base-300/50 transition duration-500 dark:bg-base-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className={classes} style={{boxShadow: isOpen ? '0px 0px 4px 0px #999' : ''}}>
        <div className="flex h-full w-full flex-col pb-4 standalone:pb-safe-offset-4">
          <div className="flex shrink-0 justify-end px-4 pt-4">
            <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pb-4 dark:border-base-300/60">
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>

          <div className="min-h-0 grow overflow-auto">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

BottomSheet.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
  children: node.isRequired,
  title: string.isRequired,
};
