import {Plus} from '@phosphor-icons/react';
import {useState} from 'react';
import {Link} from 'react-router-dom';

import {useMesocycles} from '../api.js';
import {useCurrentMeso} from '../utils/hooks.js';
import useLocalStore from '../utils/useLocalStore.js';
import MesoCycleMenu from './MesoCycleMenu.jsx';
import MesoNote from './MesoNote.jsx';
import CompleteBadge from './ui/CompleteBadge.jsx';
import EmptyState from './ui/EmptyState.jsx';
import Error from './ui/Error.jsx';
import ListItemBadge from './ui/ListItemBadge.jsx';
import Loading from './ui/Loading.jsx';

export default function MesoCycles() {
  const {data: mesocycles, isLoading: isLoadingMesocycles, error} = useMesocycles();
  const [createNoteMesoKey, setCreateNoteMesoKey] = useState(null);
  const {data: currentMeso} = useCurrentMeso();

  const isDesktop = useLocalStore(st => st.isDesktop);

  if (isLoadingMesocycles) {
    return (
      <div className="absolute inset-1/2">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col desktop:block desktop:px-4">
      <div className="flex shrink-0 items-center justify-between border-b p-4 dark:border-base-200 desktop:border-none desktop:px-0 desktop:py-8">
        <h1 className="text-2xl font-semibold text-base-content desktop:text-3xl desktop:font-bold">
          Mesocycles
        </h1>

        <Link to="plan" className="btn btn-xs flex items-center desktop:btn-accent desktop:btn-sm">
          <Plus size={isDesktop ? 19 : 17} />
          New
        </Link>
      </div>

      <ul
        role="list"
        className="min-h-0 grow divide-y divide-base-200 overflow-auto overscroll-contain bg-base-100 pl-4 pb-safe-offset-0 dark:divide-base-300/40 dark:bg-base-200/80 desktop:grow-0 desktop:overflow-visible"
      >
        {mesocycles.length === 0 && (
          <div className="my-4 mr-4 desktop:py-4">
            <EmptyState title="No mesocycles yet" description="Your mesocycles will appear here." />
          </div>
        )}

        {mesocycles?.map(meso => {
          return (
            <li key={meso.id} className="py-4">
              <div className="mr-4 flex min-w-0 justify-between">
                <Link
                  to={`/mesocycles/${meso.key}`}
                  className="flex w-full flex-col space-y-1 truncate"
                >
                  <div className="flex w-full justify-between gap-2">
                    <h3 className="truncate whitespace-break-spaces">
                      {meso.name || 'This meso is not named'}
                    </h3>

                    {currentMeso?.key === meso.key && (
                      <ListItemBadge
                        className="bg-info/50 text-info-content dark:bg-info/50"
                        label="current"
                      />
                    )}
                  </div>
                  {/* </div> */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-base-content/60">
                      <span className="font-mono">{meso.weeks}</span>{' '}
                      <span className="uppercase">weeks</span> -{' '}
                      <span className="font-mono">{meso.days}</span>{' '}
                      <span className="uppercase">days/week</span>
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-start gap-3 pl-2">
                  {meso.finishedAt && <CompleteBadge finishedAt={meso.finishedAt} />}

                  <MesoCycleMenu
                    meso={meso}
                    onClickAddMesoNote={() => setCreateNoteMesoKey(meso.key)}
                  />
                </div>
              </div>
              <div className={`mr-4 ${meso.notes.length ? 'mb-1 mt-2' : ''}`}>
                <ul className="divide-y dark:divide-base-200">
                  {meso.notes.map(mesoNote => (
                    <MesoNote
                      key={`meso-note-${mesoNote.id}`}
                      mesoKey={meso.key}
                      mesoNote={mesoNote}
                    />
                  ))}
                </ul>

                <MesoNote
                  mesoKey={meso.key}
                  isNewNoteOpen={createNoteMesoKey === meso.key}
                  onNewNoteClose={() => setCreateNoteMesoKey(null)}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {isDesktop && <div className="h-64" />}
    </div>
  );
}
