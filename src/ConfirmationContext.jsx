import {node} from 'prop-types';
import {createContext, useCallback, useContext, useRef, useState} from 'react';

import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from './utils/index.js';
import useLocalStore from './utils/useLocalStore.js';

const ConfirmationContext = createContext({});

export const ConfirmationProvider = ({children}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState(null);

  const theme = useLocalStore(st => st.theme);

  const confirmResolver = useRef();

  const confirmation = useCallback(
    confirmDialogConfig => {
      setIsConfirmDialogOpen(true);
      setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
      setConfirmDialogConfig(confirmDialogConfig);

      return new Promise(resolve => {
        confirmResolver.current = resolve;
      });
    },
    [theme]
  );

  const handleAcceptConfirmDialog = useCallback(() => {
    confirmResolver.current?.(true);
    setIsConfirmDialogOpen(false);
    setTheDomStatusBarColor(theme, false);
  }, [theme]);

  const handleCancelConfirmDialog = useCallback(() => {
    confirmResolver.current?.(false);
    setIsConfirmDialogOpen(false);
    setTheDomStatusBarColor(theme, false);
  }, [theme]);

  const context = {
    confirmation,
    isConfirmDialogOpen,
    confirmDialogConfig,
    handleAcceptConfirmDialog,
    handleCancelConfirmDialog,
  };

  return <ConfirmationContext.Provider value={context}>{children}</ConfirmationContext.Provider>;
};

ConfirmationProvider.propTypes = {
  children: node,
};

export function useConfirmation() {
  return useContext(ConfirmationContext);
}
