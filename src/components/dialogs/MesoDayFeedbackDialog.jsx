import {func} from 'prop-types';
import {memo, useState} from 'react';

import useLocalStore from '../../utils/useLocalStore.js';
import MesoDayFeedbackForm from '../MesoDayFeedbackForm.jsx';
import Dialog from '../ui/Dialog.jsx';

const MesoDayFeedbackDialog = memo(function MesoDayFeedbackDialog({onClose, ...restProps}) {
  const isFeedbackOpen = useLocalStore(st => st.isFeedbackOpen);
  const [helpType, setHelpType] = useState(null);

  return (
    <Dialog
      isOpen={isFeedbackOpen}
      onClose={() => onClose(true)}
      size="lg"
      title={helpType ? '' : 'Feedback'}
    >
      <MesoDayFeedbackForm
        helpType={helpType}
        onClose={onClose}
        setHelpType={setHelpType}
        {...restProps}
      />
    </Dialog>
  );
});

export default MesoDayFeedbackDialog;

MesoDayFeedbackDialog.propTypes = {
  onClose: func.isRequired,
};
