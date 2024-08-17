import {GridFour} from '@phosphor-icons/react';
import {object} from 'prop-types';
import {useMemo, useState} from 'react';

import {MG_PROGRESSION_TYPES} from '../../../../lib/training/constants.mjs';
import ProgressionInfo from './ui/ProgressionInfo.jsx';
import PullUpButton from './ui/PullUpButton.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';
import SlotPreviewRow from './ui/SlotPreviewRow.jsx';

export default function MesoPreview({meso}) {
  const [dayIndex, setDayIndex] = useState(0);

  const mesoData = useMemo(() => {
    if (meso) {
      const lastAccumWeek = meso.weeks[meso.weeks.length - 2];
      const days = lastAccumWeek.days;

      return {
        key: meso.key,
        name: meso.name,
        days,
        progressions: meso.progressions,
      };
    }
  }, [meso]);

  const options = useMemo(() => {
    return (
      mesoData?.days.map(d => ({
        label: d.position + 1,
        value: d.position,
      })) || []
    );
  }, [mesoData?.days]);

  const containsSecondary = useMemo(() => {
    return mesoData
      ? Object.values(mesoData.progressions).some(
          p => p.mgProgressionType === MG_PROGRESSION_TYPES.slow
        )
      : false;
  }, [mesoData]);

  return (
    <div className="flex h-full min-h-full flex-col justify-between desktop:min-h-[700px] desktop:px-4 desktop:pb-4">
      <div className="shrink-0 space-y-2 desktop:px-0 ">
        <div className="mt-2 border-t px-4 pt-4 dark:border-base-300/60 desktop:px-0">
          <SegmentedControl options={options} selected={dayIndex} onClick={setDayIndex} />
        </div>

        <p className="mt-2 border-b pb-2 text-center text-xs text-base-content/60 dark:border-base-300/60 dark:text-base-content">
          Workouts
        </p>
      </div>

      <div className="min-h-0 grow overflow-auto">
        <ul className="divide-y overflow-auto pl-4 dark:divide-base-300/40 desktop:pl-0">
          {mesoData?.days[dayIndex]?.exercises.map(dex => (
            <SlotPreviewRow
              key={dex.id}
              slot={{
                muscleGroupId: dex.muscleGroupId,
                exerciseId: dex.exerciseId,
              }}
              progression={meso.progressions[dex.muscleGroupId]}
            />
          ))}
        </ul>

        {containsSecondary && <ProgressionInfo className="px-4 desktop:px-0" />}
      </div>

      <div className="shrink-0 border-t p-4 dark:border-t-base-300 standalone:pb-safe-offset-4 desktop:px-0 desktop:pb-0 desktop:pt-4">
        <PullUpButton
          actions={[
            {
              label: 'Plan new mesocycle',
              to: `/mesocycles/new?sourceMesoKey=${mesoData?.key}`,
            },
            {
              label: 'Create new template',
              to: `/templates/new?sourceMesoKey=${mesoData?.key}`,
              icon: <GridFour />,
            },
          ]}
        />
      </div>
    </div>
  );
}

MesoPreview.propTypes = {
  meso: object,
};
