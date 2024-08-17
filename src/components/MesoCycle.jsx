import {useEffect} from 'react';
import {Outlet, useNavigate, useOutlet, useParams} from 'react-router-dom';

import {useMesocycle} from '../api.js';
import {getCurrentDayRoute} from '../utils/index.js';
import Error from './ui/Error.jsx';
import Loading from './ui/Loading.jsx';

export default function MesoCycle() {
  const {mesoKey, week, day} = useParams();
  const {data: meso, isActuallyLoading, error} = useMesocycle(mesoKey);
  const outlet = useOutlet();
  const navigate = useNavigate();
  const currentDayRoute = getCurrentDayRoute(meso);

  useEffect(() => {
    if (meso && (!week || !day)) {
      navigate(currentDayRoute, {replace: true});
    }
  }, [meso, currentDayRoute, navigate, week, day]);

  if (isActuallyLoading) {
    return (
      <div className="absolute inset-1/2">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <Error error={error} />;
  }

  return outlet ? <Outlet /> : null;
}
