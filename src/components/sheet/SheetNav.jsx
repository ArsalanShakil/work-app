import {X} from '@phosphor-icons/react';
import {func, node} from 'prop-types';

import IconButton from '../ui/IconButton.jsx';

export default function SheetNav({handleClose, children}) {
  return (
    <div className="fixed flex w-full items-center justify-between px-4 pt-4">
      <div className="relative w-full">{children}</div>

      <div className={`flex ${handleClose ? 'opacity-100' : 'opacity-0'}`}>
        <IconButton
          onClick={handleClose ? handleClose : () => {}}
          icon={<X size={20} className={`transition duration-200 ease-in-out `} />}
        />
      </div>
    </div>
  );
}

SheetNav.propTypes = {
  handleClose: func.isRequired,
  children: node,
};
