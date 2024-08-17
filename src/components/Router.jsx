import {Navigate, Route, Routes} from 'react-router-dom';

import BoardLoader from './board/BoardLoader.jsx';
import Exercises from './Exercises.jsx';
import Layout from './Layout.jsx';
import MesoCycle from './MesoCycle.jsx';
import MesoCycles from './MesoCycles.jsx';
import MesoDay from './MesoDay.jsx';
import PlanMesocycle from './PlanMesocycle.jsx';
import Root from './Root.jsx';
import Templates from './Templates.jsx';
import UserProfile from './UserProfile.jsx';

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/log" element={<h1 className="text-xl">Log</h1>} />
        <Route path="/exercises" element={<Exercises />} />

        <Route path="/templates" element={<Templates />} />
        <Route path="/templates/new" element={<BoardLoader />} />
        <Route path="/templates/:templateKey" element={<BoardLoader />} />

        <Route path="/mesocycles">
          <Route index element={<MesoCycles />} />
          <Route path="plan" element={<PlanMesocycle />} />
          <Route path="new" element={<BoardLoader />} />
          <Route path=":mesoKey" element={<MesoCycle />}>
            <Route path="weeks/:week/days/:day" element={<MesoDay />} />
          </Route>
          <Route path="*" element={<Navigate to="/mesocycles" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
