import {useBootstrap, useUserProfile} from '../api.js';
import {APP_VERSION, DISPLAY_MODE} from '../constants.js';
import {UsersnapProvider} from '../UsersnapContext.jsx';
import history from '../utils/history.js';
import Router from './Router.jsx';
import Error from './ui/Error.jsx';
import Loading from './ui/Loading.jsx';

export default function AuthorizedApp() {
  const {data: user} = useUserProfile();
  const {isBootstrapped, error} = useBootstrap();

  if (error) {
    return <Error error={error} />;
  }

  if (!isBootstrapped) {
    return (
      <div className="absolute inset-1/2">
        <Loading />
      </div>
    );
  }

  return (
    <UsersnapProvider
      initParams={{
        user: {email: user.email},
        custom: {
          appVersion: APP_VERSION,
          displayMode: DISPLAY_MODE,
        },
      }}
    >
      <Router history={history} />
    </UsersnapProvider>
  );
}
