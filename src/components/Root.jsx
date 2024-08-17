import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {useCurrentDayRoute} from '../utils/hooks.js';

export default function Root() {
  const navigate = useNavigate();
  const {data: currentDayRoute, isActuallyLoading} = useCurrentDayRoute();

  useEffect(() => {
    if (!isActuallyLoading) {
      if (currentDayRoute) {
        navigate(currentDayRoute);
      } else {
        navigate('/mesocycles/plan');
      }
    }
  }, [currentDayRoute, isActuallyLoading, navigate]);

  return null;
}
