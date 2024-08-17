import {node} from 'prop-types';

import Dialog from './Dialog.jsx';

export default function BlockingDialog({children}) {
  return (
    <div className="absolute inset-0 bg-base-100">
      <Dialog isOpen={true} size="max" fullScreen noSideBar>
        {children}
      </Dialog>
    </div>
  );
}

BlockingDialog.propTypes = {
  children: node.isRequired,
};
