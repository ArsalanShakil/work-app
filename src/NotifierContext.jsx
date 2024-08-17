import {node} from 'prop-types';
import {createContext, useCallback, useContext, useState} from 'react';

const NotifierContext = createContext();

export const NotifierProvider = ({children}) => {
  const [notification, setNotification] = useState();

  const showNotification = useCallback(
    config => {
      if (!('message' in config) || !('type' in config) || !('autoClose' in config)) {
        console.error('Developer error, please fix'); // eslint-disable-line no-console

        return;
      }

      setNotification(config);
    },
    [setNotification]
  );

  const context = {notification, showNotification, setNotification};

  return <NotifierContext.Provider value={context}>{children}</NotifierContext.Provider>;
};

NotifierProvider.propTypes = {
  children: node,
};

export function useNotifierContext() {
  return useContext(NotifierContext);
}
