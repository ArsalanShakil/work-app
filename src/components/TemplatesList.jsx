import {Plus} from '@phosphor-icons/react';
import {bool, func, oneOfType, string} from 'prop-types';
import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {FixedSizeList as List} from 'react-window';

import {getSortedBy} from '../../../../lib/sort.mjs';
import {useTemplates, useUserProfile} from '../api.js';
import logoUrl from '../assets/logo-simple.png';
import {LIST_ITEM_HEIGHT} from '../constants.js';
import {useDebounce, useTemplateFilterResetCallback} from '../utils/hooks.js';
import {setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from '../utils/index.js';
import useLocalStore from '../utils/useLocalStore.js';
import TemplateFiltersDialog from './template-chooser/TemplateFiltersDialog.jsx';
import TemplateFiltersHeader from './template-chooser/TemplateFiltersHeader.jsx';
import EmptyState from './ui/EmptyState.jsx';
import ListItem from './ui/ListItem.jsx';
import ListItemBadge from './ui/ListItemBadge.jsx';
import ListWrapper from './ui/ListWrapper.jsx';
import Loading from './ui/Loading.jsx';

export default function TemplatesList({onClick = () => {}, inDialog = false}) {
  const {data: templateRows, isActuallyLoading} = useTemplates();
  const {data: user} = useUserProfile();
  const {hash} = useLocation();

  const theme = useLocalStore(st => st.theme);
  const isDesktop = useLocalStore(st => st.isDesktop);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const templateFilterSex = useLocalStore(st => st.templateFilterSex);
  const setTemplateFilterSex = useLocalStore(st => st.setTemplateFilterSex);
  const setLocalTemplateFilterSex = useLocalStore(st => st.setLocalTemplateFilterSex);
  const templateFilterEmphasis = useLocalStore(st => st.templateFilterEmphasis);
  const templateFilterNumberOfDays = useLocalStore(st => st.templateFilterNumberOfDays);

  useEffect(() => {
    setTemplateFilterSex(user.attributes.SEX || 'male');
    setLocalTemplateFilterSex(user.attributes.SEX || 'male');
  }, [setLocalTemplateFilterSex, setTemplateFilterSex, user.attributes.SEX]);

  const noSavedTemplates =
    !isActuallyLoading && templateRows.length > 0 && templateRows.every(t => t.userId === null);

  const handleTemplateFilterReset = useTemplateFilterResetCallback();

  const handleFiltersOpen = useCallback(() => {
    setFiltersOpen(true);
    if (!inDialog) {
      setTheDomStatusBarColor(theme, STATUS_BAR_COLOR_TYPES.modalOpen);
    }
  }, [inDialog, theme]);

  const handleFiltersClose = useCallback(() => {
    setFiltersOpen(false);
    if (!inDialog) {
      setTheDomStatusBarColor(theme, false);
    }
  }, [inDialog, theme]);

  const listRef = useRef();
  const [listHeight, setListHeight] = useState(0);

  const templatesList = useMemo(() => {
    const list = [];

    if (templateRows?.length > 0) {
      for (const temp of templateRows) {
        const sex = templateFilterSex ? temp.sex === templateFilterSex : true;
        const emphasis = templateFilterEmphasis ? temp.emphasis === templateFilterEmphasis : true;
        const tab = hash === '#saved' ? temp.userId === user.id : temp.userId === null;
        const frequency = templateFilterNumberOfDays
          ? temp.frequency === templateFilterNumberOfDays
          : true;

        if (sex && emphasis && frequency && tab) {
          list.push({
            key: temp.key,
            createdAt: temp.createdAt,
            name: temp.name,
            header: temp.emphasis,
            titleImgUrl: temp.userId === null ? logoUrl : null,
            badges: [
              <ListItemBadge
                key="list-item-badge-1"
                label={
                  <span>
                    <span className="font-mono text-[13px]">{temp.frequency}/</span>week
                  </span>
                }
              />,
              <ListItemBadge key="list-item-badge-2" label={temp.sex} className="uppercase" />,
            ],
            onSelect: () => onClick(temp.key, temp.name),
          });
        }
      }
    }

    return getSortedBy(list, t => t.createdAt, {descending: true});
  }, [
    hash,
    onClick,
    templateFilterEmphasis,
    templateFilterNumberOfDays,
    templateFilterSex,
    templateRows,
    user.id,
  ]);

  const debouncedOnResize = useDebounce(() => setListHeight(0));

  useEffect(() => {
    window.addEventListener('resize', debouncedOnResize);

    return () => window.removeEventListener('resize', debouncedOnResize);
  }, [debouncedOnResize]);

  useEffect(() => {
    if (listHeight === 0 && listRef.current && templatesList.length) {
      setListHeight(listRef.current.clientHeight);
    }
  }, [listHeight, templatesList.length]);

  if (isActuallyLoading) {
    return <Loading />;
  }

  return (
    <Fragment>
      <div>
        <TemplateFiltersHeader onOpen={handleFiltersOpen} />
      </div>

      <div className="shrink-0 bg-base-100 p-2 dark:bg-base-200/80 desktop:p-4">
        <div className="flex rounded-md border bg-base-200 p-1 dark:border-base-100 dark:bg-base-100">
          <Link
            to=""
            className={`w-full rounded-sm py-1 text-center text-sm ${
              hash === '' ? 'bg-base-100 shadow dark:bg-base-200' : 'bg-none text-base-content/70'
            }`}
          >
            RP Templates
          </Link>
          <Link
            to="#saved"
            className={`w-full rounded-sm py-1 text-center text-sm ${
              hash === '#saved'
                ? 'bg-base-100 shadow dark:bg-base-200'
                : 'bg-none text-base-content/70'
            }`}
          >
            Saved templates
          </Link>
        </div>
      </div>

      {templatesList.length > 0 && (
        <div ref={listRef} className="flex grow flex-col bg-base-100 pl-4 dark:bg-base-200/80">
          <List
            height={listHeight}
            itemCount={templatesList.length}
            itemSize={LIST_ITEM_HEIGHT}
            itemData={{
              list: templatesList,
              pageNumber: 1,
            }}
            innerElementType={ListWrapper}
            overscanCount={2}
            className="overscroll-contain"
          >
            {props => <ListItem {...props} />}
          </List>
        </div>
      )}

      {hash === '#saved' && noSavedTemplates && (
        <div className="bg-base-100 px-2 pb-2 dark:bg-base-200/80 desktop:px-4 desktop:pb-4">
          <EmptyState
            title="No saved templates"
            description="Your saved templates will appear here. You can then use them to create new mesocycles and templates."
          >
            <Link to="/templates/new" className="btn btn-xs mt-2 uppercase">
              <Plus size={isDesktop ? 19 : 17} />
              New template
            </Link>
          </EmptyState>
        </div>
      )}

      {templatesList.length === 0 && !noSavedTemplates && (
        <div className="flex flex-col items-center justify-center gap-4 bg-base-100 p-8 text-center">
          <h4 className="block text-xl font-medium">No results found</h4>
          <p className="">We weren&apos;t able to find any templates with your selected filters.</p>
          <p> Your could try clearing your filters.</p>
          <button onClick={handleTemplateFilterReset} className="btn btn-sm mb-4">
            Clear filters
          </button>
          <p>You may also create your own template</p>
          <Link to="new" className="btn btn-sm">
            Create a template from scratch
          </Link>
        </div>
      )}

      <TemplateFiltersDialog
        isOpen={filtersOpen}
        onClose={handleFiltersClose}
        inDialog={inDialog}
      />
    </Fragment>
  );
}

TemplatesList.propTypes = {
  inDialog: bool,
  isLoadingTemplateKey: oneOfType([string, bool]),
  onClick: func.isRequired,
};
