import {node, object} from 'prop-types';
import {createContext, useContext, useEffect, useState} from 'react';

import {useScript} from './utils/hooks.js';

const UsersnapContext = createContext(null);

export const UsersnapProvider = ({initParams = {}, children}) => {
  const [usersnapApi, setUsersnapApi] = useState(null);
  useScript(
    'https://widget.usersnap.com/global/load/16489348-8424-47ae-b529-90eeae66c390?onload=onUsersnapCXLoad'
  );

  useEffect(() => {
    let usersnapApi = null;
    window.onUsersnapCXLoad = function (api) {
      api.init(initParams);
      usersnapApi = api;
      setUsersnapApi(api);
    };

    return () => {
      delete window.onUsersnapCXLoad;
      const userSnapIframe = document.querySelector(`iframe[name="us-entrypoint-globalSetup"]`);
      userSnapIframe?.remove();
      usersnapApi?.destroy();
      setUsersnapApi(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <UsersnapContext.Provider value={usersnapApi}>{children}</UsersnapContext.Provider>;
};

UsersnapProvider.propTypes = {
  initParams: object,
  children: node,
};

export function useUsersnapApi() {
  return useContext(UsersnapContext);
}
