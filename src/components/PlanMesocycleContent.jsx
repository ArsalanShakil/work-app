import {Plus} from '@phosphor-icons/react';
import {func} from 'prop-types';
import {Fragment, useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {getSortedBy} from '../../../../lib/sort.mjs';
import {useMesocycles, useTemplates} from '../api.js';
import useLocalStore from '../utils/useLocalStore.js';
import EmptyState from './ui/EmptyState.jsx';
import Loading from './ui/Loading.jsx';
import MesocycleListItem from './ui/MesocycleListItem.jsx';
import TemplateListItem from './ui/TemplateListItem.jsx';

const mensPicks = ['whole-body-daily-male-4x', 'whole-body-daily-male-5x', 'upper-body-male-5x'];
const womensPicks = ['lower-body-female-3x', 'lower-body-female-4x', 'glutes-abs-female-5x'];

export default function PlanMesocycleContent({onMesoClick, onTemplateClick}) {
  const {data: mesocycles} = useMesocycles();
  const {data: templates, isActuallyLoading: templatesLoading} = useTemplates();
  const navigate = useNavigate();

  const setTemplateChooserOpen = useLocalStore(st => st.setTemplateChooserOpen);
  const setIsMesoChooserDialogOpen = useLocalStore(st => st.setIsMesoChooserDialogOpen);
  const isDesktop = useLocalStore(st => st.isDesktop);

  const maleFavorites = useMemo(() => {
    return templates?.filter(t => mensPicks.includes(t.key));
  }, [templates]);

  const femaleFavorites = useMemo(() => {
    return templates?.filter(t => womensPicks.includes(t.key));
  }, [templates]);

  const userTemplates = useMemo(() => {
    return templates?.filter(t => !!t.userId) || [];
  }, [templates]);

  const [element, setElement] = useState(false);

  useEffect(() => {
    if (element) {
      element.scrollTo(0, 0);
    }
  }, [element]);

  return (
    <Fragment>
      <div className="min-h-0 grow overflow-auto overscroll-contain bg-base-100 dark:bg-base-200/80 desktop:mb-8">
        <div className="pb-6">
          <div className="mb-2 mt-4 px-4">
            <h3 className="text-lg font-medium desktop:text-xl">RP&apos;s picks</h3>
            <p className="text-xs text-base-300 dark:text-base-content">Our favorite templates</p>
          </div>

          {templatesLoading && <Loading />}

          {isDesktop && !templatesLoading && (
            <div className="flex w-full gap-x-4 px-4">
              <ul className="w-full divide-y divide-base-200 dark:divide-base-300/40">
                {maleFavorites?.map(temp => (
                  <TemplateListItem
                    key={temp.key}
                    templateRow={temp}
                    onSelect={() => onTemplateClick(temp.key, temp.name)}
                  />
                ))}
              </ul>

              <ul className="w-full divide-y divide-base-200 dark:divide-base-300/40">
                {femaleFavorites?.map(temp => (
                  <TemplateListItem
                    key={temp.key}
                    templateRow={temp}
                    onSelect={() => onTemplateClick(temp.key, temp.name)}
                  />
                ))}
              </ul>
            </div>
          )}

          {!isDesktop && !templatesLoading && (
            <div
              ref={setElement}
              className="flex snap-x snap-mandatory overflow-y-hidden scrollbar-hide"
            >
              <ul className="w-11/12 shrink-0 snap-start divide-y divide-base-200 pl-4 dark:divide-base-300/40">
                {maleFavorites?.map(temp => (
                  <TemplateListItem
                    key={temp.key}
                    templateRow={temp}
                    onSelect={() => onTemplateClick(temp.key, temp.name)}
                  />
                ))}
              </ul>
              <ul className="w-full shrink-0 snap-start divide-y divide-base-200 pl-4 dark:divide-base-300/40">
                {femaleFavorites?.map(temp => (
                  <TemplateListItem
                    key={temp.key}
                    templateRow={temp}
                    onSelect={() => onTemplateClick(temp.key, temp.name)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-t-base-200 pb-6 dark:border-t-base-300">
          <div className="mb-2 mt-4 flex justify-between px-4">
            <h3 className="text-lg font-medium desktop:text-xl">Saved templates</h3>

            {userTemplates?.length > 3 && (
              <button
                onClick={() => {
                  navigate('#saved', {replace: true});
                  setTemplateChooserOpen(true);
                }}
                className="btn btn-ghost btn-sm font-normal capitalize text-accent"
              >
                See all
              </button>
            )}
          </div>

          {templatesLoading && <Loading />}

          {!!userTemplates.length && (
            <ul className="divide-y divide-base-200 pl-4 dark:divide-base-300/40 desktop:pr-4">
              {getSortedBy(userTemplates, t => t.createdAt, {descending: true})
                .slice(0, 3)
                .map(temp => (
                  <TemplateListItem
                    key={temp.key}
                    templateRow={temp}
                    onSelect={() => onTemplateClick(temp.key, temp.name)}
                  />
                ))}
            </ul>
          )}

          {userTemplates?.length === 0 && !templatesLoading && (
            <div className="m-4">
              <EmptyState
                title="No saved templates"
                description="Your saved templates will appear here. You can then use them to create new mesocycles and templates."
              >
                <Link to="/templates/new" className="btn btn-xs uppercase">
                  <Plus size={isDesktop ? 19 : 17} />
                  New template
                </Link>
              </EmptyState>
            </div>
          )}
        </div>

        <div className="border-t border-t-base-200 pb-6 dark:border-t-base-300 standalone:pb-safe-offset-8">
          <div className="mb-2 mt-4 flex justify-between px-4">
            <h3 className=" text-lg font-medium desktop:text-xl">Past mesocycles</h3>

            {mesocycles.length > 3 && (
              <button
                onClick={() => setIsMesoChooserDialogOpen(true)}
                className="btn btn-ghost btn-sm font-normal capitalize text-accent"
              >
                See all
              </button>
            )}
          </div>

          {!!mesocycles.length && (
            <ul className="divide-y divide-base-200 pl-4 dark:divide-base-300/40 desktop:pr-4">
              {mesocycles.slice(0, 3).map(meso => (
                <MesocycleListItem
                  key={meso.key}
                  mesoRow={meso}
                  onSelect={() => onMesoClick(meso.key, meso.name)}
                />
              ))}
            </ul>
          )}

          {mesocycles.length === 0 && (
            <div className="m-4">
              <EmptyState
                title="No saved mesocycles"
                description="Your mesocycles will appear here. You can then use them to create new mesocycles and templates."
              />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

PlanMesocycleContent.propTypes = {
  onMesoClick: func.isRequired,
  onTemplateClick: func.isRequired,
};
