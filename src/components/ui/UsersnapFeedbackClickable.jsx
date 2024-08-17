import {node, string} from 'prop-types';
import {useNavigate} from 'react-router-dom';

import {RetriesExceededError, waitForIt} from '../../../../../lib/wait.mjs';
import {useUsersnapApi} from '../../UsersnapContext.jsx';
import logError from '../../utils/logError.js';

export default function UsersnapFeedbackClickable({className = '', children}) {
  const usersnapApi = useUsersnapApi();
  const navigate = useNavigate();

  const handleAppFeedbackOpen = async () => {
    try {
      const userSnapApi = await waitForIt(() => usersnapApi, 4, 250);
      userSnapApi.logEvent('rp_open');
    } catch (err) {
      if (err instanceof RetriesExceededError) {
        logError(err);
        navigate('/help');
      }
    }
  };

  return (
    <div onClick={handleAppFeedbackOpen} className={className}>
      {children}
    </div>
  );
}

UsersnapFeedbackClickable.propTypes = {
  className: string,
  children: node.isRequired,
};
