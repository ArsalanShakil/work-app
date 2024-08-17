import {ArrowArcRight, CheckCircle, CircleDashed} from '@phosphor-icons/react';
import {array, bool, func, number, object, string} from 'prop-types';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  SKIPPED_SET_REPS,
  STATUSES,
  STATUSES_FINISHED,
} from '../../../../lib/training/constants.mjs';
import {UNIT_DISPLAY} from '../constants.js';
import {useExercisesById, useMesoDay, useMuscleGroupsById} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import BarChart from './Barchart.jsx';
import SheetNav from './sheet/SheetNav.jsx';
import SheetNavButton from './sheet/SheetNavButton.jsx';
import SheetPage from './sheet/SheetPage.jsx';
import SheetTitle from './sheet/SheetTitle.jsx';
import CompleteBadge from './ui/CompleteBadge.jsx';
import EmptyState from './ui/EmptyState.jsx';
import ListItem from './ui/ListItem.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';
import Select from './ui/Select.jsx';

/*
  Takes a meso and combines adjacent dexes (eg in case of downsets)

  INPUT dexes for a dayIdx:
        wk 1    wk 2    wk 3
      1 A       A       E
      2 B       A       A
      3 C       B       A
      4 A       C       B
      5         D       B
      6         A       C
      7         A       A

  OUTPUT dexGroups:
        wk 1    wk2     wk 3
      1 A       AA      E
      2 B       B       AA
      3 C       C       BB
      4 A       D       C
      5 AA      A
*/
function getDexGroups(meso) {
  const res = [];

  for (const [weekIdx, week] of meso.weeks.entries()) {
    if (!res[weekIdx]) {
      res[weekIdx] = [];
    }
    for (const [dayIdx, day] of week.days.entries()) {
      if (!res[weekIdx][dayIdx]) {
        res[weekIdx][dayIdx] = [];
      }
      let dexGroupIdx = 0;

      for (const [dexIdx, dex] of day.exercises.entries()) {
        const prevDex = day.exercises[dexIdx - 1];

        if (dexIdx !== 0 && prevDex.exerciseId !== dex.exerciseId) {
          ++dexGroupIdx;
        }

        if (!res[weekIdx][dayIdx][dexGroupIdx]) {
          res[weekIdx][dayIdx][dexGroupIdx] = {exerciseId: dex.exerciseId, dexes: []};
        }
        res[weekIdx][dayIdx][dexGroupIdx].dexes.push(dex);
      }
    }
  }

  return res;
}

/*
  INPUT dexGroups:
        wk 1	  wk 2	  wk 3
      1 A       AA      E
      2 B       B       AA
      3 C       C       BB
      4 A       D       C
      5 AA      A

  OUTPUT dexGroupsList
      1 A
      1 E
      2 B
      2 A
      3 C
      3 B
      4 A
      4 D
      4 C
      5 A
*/
function getDexGroupsListByDay(dexGroups) {
  const res = [];

  const weekCount = dexGroups.length;
  const dayCount = dexGroups[0].length;

  const dexGroupCountByDayIdx = {};
  for (const week of dexGroups) {
    for (const [dayIdx, day] of week.entries()) {
      if (!dexGroupCountByDayIdx[dayIdx]) {
        dexGroupCountByDayIdx[dayIdx] = 0;
      }

      const dexGroupCount = day.length;
      if (dexGroupCount > dexGroupCountByDayIdx[dayIdx]) {
        dexGroupCountByDayIdx[dayIdx] = dexGroupCount;
      }
    }
  }

  for (let dayIdx = 0; dayIdx < dayCount; ++dayIdx) {
    if (!res[dayIdx]) {
      res[dayIdx] = new Set();
    }
    for (let dexGroupIdx = 0; dexGroupIdx < dexGroupCountByDayIdx[dayIdx]; ++dexGroupIdx) {
      for (let weekIdx = 0; weekIdx < weekCount; ++weekIdx) {
        const dexGroup = dexGroups[weekIdx][dayIdx]?.[dexGroupIdx];

        if (dexGroup) {
          res[dayIdx].add(`${dexGroupIdx}-${dexGroup.exerciseId}`);
        }
      }
    }
  }

  return res;
}

function getMuscleGroupSets(meso, muscleGroupsById) {
  const muscleGroupSets = {};

  // TODO: It would be nice to not show a 0 when a user hasn't yet had the opportunity to do sets
  // this is slightly awkward in the summary when after your first workout of a meso, you see a sea of zeros

  for (const [weekIdx, week] of Object.entries(meso.weeks)) {
    for (const day of week.days) {
      for (const mgId of Object.keys(muscleGroupsById)) {
        if (!muscleGroupSets[mgId]) {
          muscleGroupSets[mgId] = {};
        }

        if (!muscleGroupSets[mgId][weekIdx]) {
          muscleGroupSets[mgId][weekIdx] = 0;
        }

        const dexercisesForMuscleGroup =
          day.finishedAt && day.exercises.filter(dex => dex.muscleGroupId === Number(mgId));

        let setCount = 0;

        if (dexercisesForMuscleGroup) {
          for (const dex of dexercisesForMuscleGroup) {
            setCount += dex.sets.filter(s => s.status !== STATUSES.set.skipped).length;
          }

          muscleGroupSets[mgId][weekIdx] += setCount;
        }
      }
    }
  }

  return muscleGroupSets;
}

function MuscleGroupSummaryRow({meso, mgId, muscleGroupSets, minVal, maxVal}) {
  const muscleGroupsById = useMuscleGroupsById();

  const averageSets = useMemo(() => {
    let totalSets = 0;
    let workedWeeks = 0;

    for (const index of Object.keys(muscleGroupSets[mgId])) {
      if (muscleGroupSets[mgId][index] > 0 && Number(index) !== meso.weeks.length - 1) {
        totalSets += muscleGroupSets[mgId][index];
        workedWeeks += 1;
      }
    }

    return workedWeeks > 0 ? Math.round(totalSets / workedWeeks) : 0;
  }, [meso.weeks.length, mgId, muscleGroupSets]);

  if (!averageSets) {
    return null;
  }

  return (
    <li className="flex pb-2 pr-4 pt-3">
      <div className="flex w-1/3 flex-col justify-end">
        <h3 className="text-lg">{muscleGroupsById[mgId].name}</h3>
        <p className="text-lg">
          {averageSets}{' '}
          <span className="text-xs text-base-300 dark:text-base-content">avg sets</span>
        </p>
      </div>

      <div className="w-2/3 ">
        <BarChart
          height={66}
          values={Object.values(muscleGroupSets[mgId])}
          min={minVal}
          max={maxVal}
        />
      </div>
    </li>
  );
}

MuscleGroupSummaryRow.propTypes = {
  meso: object.isRequired,
  mgId: number.isRequired,
  muscleGroupSets: object.isRequired,
  minVal: number.isRequired,
  maxVal: number.isRequired,
};

function SetsRow({disabled, label, weight = null, repsText = null, unit = null}) {
  return (
    <div className="flex items-center justify-between pt-1">
      <div>
        {repsText && (
          <span
            className={`${
              disabled
                ? 'text-sm text-base-300/60 dark:text-base-content/50'
                : 'font-mono text-lg tracking-tighter text-base-content'
            }`}
          >
            {repsText}{' '}
          </span>
        )}
        <span
          className={`text-sm ${
            disabled ? 'text-base-300/60 dark:text-base-content/50' : 'text-base-content/70'
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`${
          disabled ? 'text-base-300/60 dark:text-base-content/50' : 'text-base-content'
        } font-mono text-lg tracking-tighter`}
      >
        {weight}{' '}
        <span
          className={`-ml-1 font-sans text-sm tracking-normal ${
            disabled ? 'text-base-300/60 dark:text-base-content/50' : 'text-base-content/70'
          } `}
        >
          {unit ? UNIT_DISPLAY.plural[unit] : '–'}
        </span>
      </div>
    </div>
  );
}

SetsRow.propTypes = {
  disabled: bool,
  label: string.isRequired,
  weight: number,
  repsText: string,
  unit: string,
};

function DexRow({dex, disabled, empty}) {
  const unit = dex?.sets?.[0]?.unit;

  let repsText = null;
  let setsTextByWeight = new Map();
  if (disabled) {
    return <SetsRow disabled label="Not performed" />;
  } else if (empty) {
    return <SetsRow label="-" />;
  } else if (dex?.status === STATUSES.exercise.skipped) {
    return <SetsRow label="Skipped" />;
  } else if (dex.sets.length && dex.sets.every(set => STATUSES_FINISHED.set.includes(set.status))) {
    const setsByWeight = new Map();

    for (const set of dex.sets) {
      if (!setsByWeight.has(set.weight)) {
        setsByWeight.set(set.weight, []);
      }

      setsByWeight.get(set.weight).push(set);
    }

    for (const [weight, sets] of setsByWeight.entries()) {
      repsText = `${sets.map(set => (set.reps !== SKIPPED_SET_REPS ? set.reps : '-')).join(', ')}`;

      setsTextByWeight.set(weight, repsText);
    }

    return Array.from(setsTextByWeight.entries()).map(([weight, repsText]) => (
      <SetsRow key={weight} weight={weight} repsText={repsText} label="reps" unit={unit} />
    ));
  } else {
    const label = dex?.status === STATUSES.exercise.empty ? 'No sets programmed' : 'Not finished';
    return <SetsRow disabled label={label} />;
  }
}

DexRow.propTypes = {
  dex: object,
  disabled: bool,
  empty: bool,
};

function ExerciseSummaryRow({dexGroupPosExId, dexGroups, dayIdx, weekIdx}) {
  const [dexGroupPos, exId] = dexGroupPosExId.split('-');
  const exerciseId = Number(exId);

  const exercisesById = useExercisesById();
  const muscleGroupsById = useMuscleGroupsById();

  const exercise = exercisesById[exId];
  const muscleGroup = muscleGroupsById[exercise.muscleGroupId];

  const dexGroup = dexGroups[weekIdx][dayIdx][dexGroupPos];
  const hasDexGroupForDay = dexGroup?.exerciseId === exerciseId ?? false;

  const maxLengthForDexGroup = useMemo(() => {
    const numWeeks = dexGroups.length;

    let maxDexesInGroup = 0;
    for (let i = 0; i < numWeeks; i++) {
      const dexGroupForWeek = dexGroups[i][dayIdx][dexGroupPos];
      if (dexGroupForWeek?.exerciseId === exerciseId) {
        maxDexesInGroup = Math.max(dexGroupForWeek.dexes.length, maxDexesInGroup);
      }
    }

    return maxDexesInGroup;
  }, [dayIdx, dexGroupPos, dexGroups, exerciseId]);

  let dexRows = null;
  let disabled = !hasDexGroupForDay;

  if (hasDexGroupForDay) {
    disabled = false;

    dexRows = [];

    for (let i = 0; i < maxLengthForDexGroup; i++) {
      const dex = dexGroup.dexes[i];
      if (dex) {
        dexRows.push(<DexRow key={i} dex={dex} />);
      } else {
        dexRows.push(<DexRow key={i} empty />);
      }
    }
  } else {
    disabled = true;
    dexRows = <DexRow disabled />;
  }

  return (
    <li className="group flex w-full cursor-pointer items-center justify-between py-3 pr-4">
      <div className="w-full items-center truncate">
        <div className="flex items-end">
          <p
            className={`w-5 text-left ${
              disabled ? 'text-base-300/40 dark:text-base-content/50' : 'text-base-content/30'
            }`}
          >
            {Number(dexGroupPos) + 1}
          </p>
          <div className="w-full truncate">
            <p
              className={`text-xs uppercase  ${
                disabled ? 'text-base-300/40 dark:text-base-content/50' : 'text-base-content/60'
              }`}
            >
              {muscleGroup.name}
            </p>
            <h4
              className={`truncate ${
                disabled ? 'text-base-300/60 dark:text-base-content/50' : 'text-base-content'
              }`}
            >
              {exercise.name}
            </h4>
          </div>
        </div>
        <div className="w-full truncate pl-5">{dexRows}</div>
      </div>
    </li>
  );
}

ExerciseSummaryRow.propTypes = {
  dexGroupPosExId: string.isRequired,
  dexGroups: array.isRequired,
  dayIdx: number.isRequired,
  weekIdx: number.isRequired,
};

export default function MesoSummary({onClose}) {
  const {meso} = useMesoDay();

  const weekOptions = meso.weeks.map((week, weekIdx) => {
    const label =
      meso.weeks.length - 1 === weekIdx
        ? meso.weeks.length > 4
          ? 'DL'
          : 'Deload'
        : meso.weeks.length > 4
        ? `wk ${weekIdx + 1}`
        : `Week ${weekIdx + 1}`;

    return {
      label,
      value: weekIdx,
    };
  });
  const days = meso.weeks[0].days;
  const {week, day} = useParams();

  const [weekIdx, setWeekIdx] = useState(Number(week) - 1);
  const [dayIdx, setDayIdx] = useState(Number(day) - 1);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const {completed, incomplete, skipped} = useMemo(() => {
    const flatDays = meso.weeks.flatMap(wk => wk.days);

    const results = {
      completed: 0,
      skipped: 0,
      incomplete: 0,
    };

    for (const day of flatDays) {
      if (day.finishedAt) {
        if (day.status === STATUSES.day.skipped) {
          results.skipped += 1;
        } else {
          results.completed += 1;
        }
      } else {
        results.incomplete += 1;
      }
    }

    return results;
  }, [meso.weeks]);

  const muscleGroupsById = useMuscleGroupsById();

  const dexGroups = useMemo(() => getDexGroups(meso), [meso]);
  const dexGroupsListByDay = useMemo(() => getDexGroupsListByDay(dexGroups), [dexGroups]);

  const muscleGroupSets = useMemo(() => {
    return getMuscleGroupSets(meso, muscleGroupsById);
  }, [meso, muscleGroupsById]);

  const handleMuscleGroupStats = useCallback(() => {
    setDetail('muscleGroups');
    setPage(2);
  }, []);

  const handleExerciseStats = useCallback(() => {
    setDetail('exercises');
    setPage(2);
  }, []);

  const handleBack = useCallback(() => {
    setPage(1);
    runAfterAnimations(() => {
      setDetail(null);
    });
  }, []);

  useEffect(() => {
    setWeekIdx(Number(week) - 1);
    setDayIdx(Number(day) - 1);
  }, [day, week]);

  const {minVal, maxVal} = useMemo(() => {
    const setCounts = new Set();
    for (const setsByWeek of Object.values(muscleGroupSets)) {
      for (const setCount of Object.values(setsByWeek)) {
        setCounts.add(setCount);
      }
    }
    setCounts.delete(0);
    const setCountsArray = Array.from(setCounts);
    const minVal = Math.min(...setCountsArray);
    const maxVal = Math.max(...setCountsArray);

    return {minVal, maxVal};
  }, [muscleGroupSets]);

  const emptyMgStats = useMemo(() => {
    return Object.values(muscleGroupSets).every(mg => Object.values(mg).every(wk => wk === 0));
  }, [muscleGroupSets]);

  return (
    <Fragment>
      <div>
        <SheetTitle title="Mesocycle summary" currentPage={page} pageNumber={1} variant="xl" />
        <SheetTitle
          title={detail === 'muscleGroups' ? 'Muscle group stats' : 'Exercise stats'}
          currentPage={page}
          pageNumber={2}
          variant="xl"
        />
      </div>

      <SheetNav handleClose={onClose}>
        <SheetNavButton
          label="Mesocycle summary"
          currentPage={page}
          pageNumber={2}
          onClick={handleBack}
        />
      </SheetNav>

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={page} pageNumber={1}>
          <Fragment>
            <div className="grow">
              <div className="space-y-3">
                <h2 className="px-4 text-sm uppercase">{meso.name}</h2>

                {meso.finishedAt && (
                  <div className="flex px-4 pt-2">
                    <CompleteBadge finishedAt={meso.finishedAt} displayDate />
                  </div>
                )}

                <div className="">
                  <h2 className="px-4 font-medium">Workouts</h2>

                  <ul className="divide-y pl-4 dark:divide-base-300/40">
                    <li className="flex items-center justify-between py-3 capitalize">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} />
                        Completed
                      </div>
                      <div className="pr-6 text-lg">{completed}</div>
                    </li>
                    <li className="flex items-center justify-between py-3 capitalize">
                      <div className="flex items-center gap-3">
                        <ArrowArcRight size={20} />
                        Skipped
                      </div>
                      <div className="pr-6 text-lg">{skipped}</div>
                    </li>
                    <li className="flex items-center justify-between py-3 capitalize">
                      <div className="flex items-center gap-3">
                        <CircleDashed size={20} />
                        Incomplete
                      </div>
                      <div className="pr-6 text-lg">{incomplete}</div>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="mt-2 border-t px-4 pt-4 font-medium dark:border-base-300/60">
                  Stats
                </h2>
                <ul className="min-h-0 grow divide-y pl-4 dark:divide-base-300/40">
                  <ListItem
                    itemData={{
                      name: 'Muscle groups',
                      onSelect: handleMuscleGroupStats,
                      onFocus: handleMuscleGroupStats,
                    }}
                  />
                  <ListItem
                    itemData={{
                      name: 'Exercises',
                      onSelect: handleExerciseStats,
                      onFocus: handleExerciseStats,
                    }}
                  />
                </ul>
              </div>
            </div>

            <div className="shrink-0 p-4 standalone:pb-safe-offset-4">
              <div className="flex justify-end">
                <button className="btn btn-ghost" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </Fragment>
        </SheetPage>

        <SheetPage currentPage={page} pageNumber={2}>
          {detail === 'exercises' && (
            <Fragment>
              <Select
                value={dayIdx}
                onChange={event => setDayIdx(event.target.value)}
                classNameWrapper="w-full p-4"
                classNameSelect="select-sm"
              >
                {days.map((day, index) => (
                  <option key={index} value={index}>
                    Workout {index + 1}
                  </option>
                ))}
              </Select>

              <div className="px-4 pb-4">
                <SegmentedControl options={weekOptions} selected={weekIdx} onClick={setWeekIdx} />
              </div>

              <ul className="min-h-0 grow divide-y overflow-y-auto pl-4 pb-safe-offset-8 dark:divide-base-300/40">
                {Array.from(dexGroupsListByDay[dayIdx]).map(dexGroupPosExId => (
                  <ExerciseSummaryRow
                    key={dexGroupPosExId}
                    dexGroupPosExId={dexGroupPosExId}
                    dexGroups={dexGroups}
                    weekIdx={weekIdx}
                    dayIdx={Number(dayIdx)}
                  />
                ))}
              </ul>
            </Fragment>
          )}

          {detail === 'muscleGroups' && (
            <Fragment>
              <ul className="min-h-0 grow divide-y overflow-y-auto pl-4 pt-4 pb-safe-offset-8 dark:divide-base-300/40">
                <li className="flex pb-2 pr-4 pt-4">
                  <div className="w-1/3 text-xs"></div>

                  <div className="flex w-2/3 justify-between text-xs">
                    {' '}
                    {meso.weeks.map((wk, index) => (
                      <div key={`week-${index}`} className="w-full text-center">
                        {index + 1 === meso.weeks.length ? 'DL' : `wk ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </li>

                {Object.keys(muscleGroupSets).map(mgId => (
                  <MuscleGroupSummaryRow
                    key={mgId}
                    meso={meso}
                    mgId={Number(mgId)}
                    muscleGroupSets={muscleGroupSets}
                    minVal={minVal}
                    maxVal={maxVal}
                  />
                ))}

                {emptyMgStats && (
                  <div className="pr-4 pt-4">
                    <EmptyState
                      title="No workouts finished"
                      description="When you finish a workout, muscle group stats will appear here"
                    />
                  </div>
                )}
              </ul>
            </Fragment>
          )}
        </SheetPage>
      </div>
    </Fragment>
  );
}

MesoSummary.propTypes = {
  onClose: func.isRequired,
};
