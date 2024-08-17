import './App.css';

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import {MutationCache, QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'; // eslint-disable-line
import React, {useEffect, useMemo} from 'react';
import {BrowserRouter} from 'react-router-dom';

import * as log from '../../../lib/log.mjs';
import {retry} from './api.js';
import errorFace from './assets/error-face.png';
import Authentication from './components/Authentication.jsx';
import UIConfirmDialog from './components/ui/UIConfirmDialog.jsx';
import {ConfirmationProvider} from './ConfirmationContext.jsx';
import {APP_VERSION, DISPLAY_MODE} from './constants.js';
import {NetworkError} from './errors.js';
import {useNotifierContext} from './NotifierContext.jsx';
import getSanitizedPathname from './utils/getSanitizedPathname.js';
import logError from './utils/logError.js';
import signOut from './utils/signOut.js';
import useLocalStore from './utils/useLocalStore.js';

if (NODE_ENV !== 'production') {
  Object.assign(window, log);
}

Bugsnag.start({
  apiKey: 'a23f7de1ddb4617c70a15b3c92179b82',
  appVersion: APP_VERSION,
  enabledReleaseStages: ['production', 'development'],
  onError: function (event) {
    event.device.displayMode = DISPLAY_MODE;
    event.context = getSanitizedPathname();
  },
  releaseStage: RP_ENV || NODE_ENV,
  plugins: [new BugsnagPluginReact()],
});

const ErrorBoundary = Bugsnag.getPlugin('react')?.createErrorBoundary(React);

const ErrorView = () => {
  return (
    <div className="absolute flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center">
        <img width="200px" src={errorFace} />
        <p className="mb-8 text-lg">Something went wrong!</p>
        <button className="btn btn-primary" onClick={() => (window.location.href = '/')}>
          TAKE ME HOME!
        </button>
      </div>
    </div>
  );
};

const App = () => {
  // Set the theme, run once
  const theme = useLocalStore(st => st.theme);
  const setTheme = useLocalStore(st => st.setTheme);
  useEffect(() => setTheme(theme), []); // eslint-disable-line

  const {showNotification} = useNotifierContext();

  const queryCache = useMemo(
    () =>
      new QueryCache({
        // NOTE: this one runs before the onError specified on the useQuery
        onError: (error, query) => {
          if (error instanceof NetworkError) {
            if (error.statusCode === 401) {
              signOut();

              return;
            }

            logError(error, {context: [query.options.meta?.name]});
            showNotification({
              message: error?.message || 'Sorry, there was an error. Please try again.',
              type: 'error',
              autoClose: true,
            });
          }
        },
      }),
    [showNotification]
  );

  const mutationCache = useMemo(
    () =>
      new MutationCache({
        // NOTE: this one runs before the onError specified on the useQuery
        onError: (error, variables, context, mutation) => {
          if (error instanceof NetworkError) {
            if (error.statusCode === 401) {
              signOut();

              return;
            }

            // If this mutation has an onError defined, skip this
            // NOTE: there appears to be a bug where if you use an onError callback
            // to the .mutate(data, {onSuccess, onError, ...}) function, then
            // there's no way to detect its presence and it will ALSO fire.
            // The order will be this global error handler first, then that one, which
            // isn't ideal.
            if (!mutation.options.onError) {
              const context = [mutation.options.meta?.name];
              if (mutation.options.meta?.action) {
                context.unshift(mutation.options.meta.action);
              }

              logError(error, {
                extraData: variables,
                context,
              });
              showNotification({
                message: error?.message || 'Sorry, there was an error. Please try again.',
                type: 'error',
                autoClose: true,
              });
            }
          }
        },
      }),
    [showNotification]
  );

  const ReactQueryDevToolsProd = ENABLE_REACT_QUERY_DEV_TOOLS
    ? React.lazy(() =>
        import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(d => ({
          default: d.ReactQueryDevtools,
        }))
      )
    : null;

  const queryClient = useMemo(
    () =>
      new QueryClient({
        queryCache,
        mutationCache,
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry,
            staleTime: 1 * (60 * 1000), // 60 seconds
          },
        },
      }),
    [mutationCache, queryCache]
  );

  const children = (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfirmationProvider>
          <Authentication />
          {/* Global generic dialogs */}
          <UIConfirmDialog />
        </ConfirmationProvider>
      </BrowserRouter>
      {ReactQueryDevToolsProd ? (
        <React.Suspense fallback={null}>
          <ReactQueryDevToolsProd />
        </React.Suspense>
      ) : null}
    </QueryClientProvider>
  );

  return ErrorBoundary ? (
    <ErrorBoundary FallbackComponent={ErrorView}>{children}</ErrorBoundary>
  ) : (
    children
  );
};

export default App;
