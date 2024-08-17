import {Link} from 'react-router-dom';

import logoUrl from '../assets/logo.png';
import {SIDEBAR_WIDTH} from '../constants.js';
import {SidebarNavigation} from './SidebarNavigation.jsx';

export default function Sidebar() {
  return (
    <div className="flex h-full" style={{minWidth: SIDEBAR_WIDTH}}>
      <div className="flex min-h-0 flex-1 flex-col border-r border-base-100/90 bg-neutral-focus">
        <div className="flex flex-1 flex-col overflow-y-auto p-2">
          <div className="flex shrink-0 items-center px-2 py-3">
            <Link to="/">
              <img className="h-8 w-auto" src={logoUrl} alt="RP logo" />
            </Link>
          </div>
          <p className="px-2 pb-3 pt-1 text-primary-content">Hypertrophy Beta</p>

          <SidebarNavigation />
        </div>
      </div>
    </div>
  );
}
