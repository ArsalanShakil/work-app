import {format} from 'date-fns';
import {useCallback, useMemo, useState} from 'react';

import {useMesocycle, useMesocycles} from '../api.js';
import {WEEKDAYS} from '../constants.js';
import getBoardDays from '../utils/getBoardDays.js';
import getMesoDayLabels from '../utils/getMesoDayLabels.js';
import useLocalStore from '../utils/useLocalStore.js';
import Dialog from './ui/Dialog.jsx';
import Loading from './ui/Loading.jsx';
import Select from './ui/Select.jsx';

export default function CopyMesoDialog() {
  const [mesoKey, setMesoKey] = useState('');

  const isOpen = useLocalStore(st => st.copyMesoOpen);
  const setCopyMesoOpen = useLocalStore(st => st.setCopyMesoOpen);
  const setBoardDays = useLocalStore(st => st.setBoardDays);
  const setBoardWeekDays = useLocalStore(st => st.setBoardWeekDays);
  const setProgressions = useLocalStore(st => st.setMuscleGroupProgressions);

  const {data: mesocycles, isActuallyLoading: mesosListLoading} = useMesocycles();
  const {data: mesocycle, isActuallyLoading: mesoLoading} = useMesocycle(mesoKey, {
    enabled: !!mesoKey,
  });

  const selectedMesoListItem = useMemo(
    () => mesocycles.find(meso => meso.key === mesoKey),
    [mesoKey, mesocycles]
  );

  const handleClick = useCallback(() => {
    const finalAccumWeek = mesocycle?.weeks[mesocycle?.weeks?.length - 2];

    const newDays = getBoardDays(finalAccumWeek);
    const newLabels = getMesoDayLabels(finalAccumWeek);

    const labels = newLabels.map(l => {
      const value = WEEKDAYS.indexOf(l);

      if (value === -1) {
        return null;
      }
      return value;
    });

    setBoardDays(newDays);
    setBoardWeekDays(labels);
    setProgressions(mesocycle.progressions);
    setCopyMesoOpen(false);
  }, [
    mesocycle?.progressions,
    mesocycle?.weeks,
    setBoardDays,
    setBoardWeekDays,
    setCopyMesoOpen,
    setProgressions,
  ]);

  return (
    <Dialog isOpen={isOpen} onClose={() => setCopyMesoOpen(false)} title="Copy previous meso">
      {mesosListLoading && <Loading />}

      <ul role="list" className="space-y-4">
        <Select value={mesoKey} onChange={e => setMesoKey(e.target.value)} label="Mesocycles">
          <option value="" disabled>
            Choose meso
          </option>
          {mesocycles.map(meso => (
            <option key={meso.key} value={meso.key}>
              {meso.name}
            </option>
          ))}
        </Select>
      </ul>

      {selectedMesoListItem && (
        <div className="card bg-base-200 dark:bg-base-100">
          <div className="card-body p-3 text-sm font-medium text-base-content sm:px-4 sm:py-2.5">
            <p className="">
              <span className="font-mono">{selectedMesoListItem.weeks}</span>{' '}
              <span className="uppercase">weeks</span> -{' '}
              <span className="font-mono">{selectedMesoListItem.days}</span>{' '}
              <span className="uppercase">days/week</span>
            </p>
            {selectedMesoListItem?.finishedAt ? (
              <p>{`Finished on ${format(
                new Date(selectedMesoListItem.finishedAt),
                'LLL d, yyyy'
              )}`}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button className="btn btn-ghost" onClick={() => setCopyMesoOpen(false)}>
          Cancel
        </button>
        <button className="btn btn-accent" disabled={!mesoKey || mesoLoading} onClick={handleClick}>
          {mesoLoading && <span className="loading"></span>}
          Copy
        </button>
      </div>
    </Dialog>
  );
}
