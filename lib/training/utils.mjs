import {
  BODYWEIGHT_MAX,
  EXERCISE_TYPE,
  REC_BODYWEIGHT_LOADING_RANGES,
  REC_WEIGHT_RANGES,
  STATUSES,
  STATUSES_FINISHED,
  UNIT,
} from './constants.mjs';
import {MalformedRangeObjectError} from './errors.mjs';

export function getRangeMinMax(ranges) {
  let min = null;
  let max = null;

  for (const range of ranges) {
    if (!('start' in range) || !('end' in range) || !('increment' in range)) {
      throw new MalformedRangeObjectError({range, ranges});
    }

    const firstVal = range.start;
    const lastVal = range.end - range.increment;

    if (min === null || firstVal < min) {
      min = range.start;
    }
    if (max === null || lastVal > max) {
      max = lastVal;
    }
  }

  return {min, max};
}

export function getIncrements(ranges) {
  const increments = new Set();
  for (const range of ranges) {
    if (!('start' in range) || !('end' in range) || !('increment' in range)) {
      throw new MalformedRangeObjectError({range, ranges});
    }

    for (let i = range.start; i < range.end; i += range.increment) {
      increments.add(i);
    }
  }
  return Array.from(increments).sort((a, b) => a - b);
}

export function getRequiresBodyweight(exerciseType) {
  return [
    EXERCISE_TYPE.machineAssistance,
    EXERCISE_TYPE.bodyweightLoadable,
    EXERCISE_TYPE.bodyweightOnly,
  ].includes(exerciseType);
}

export function getMinMaxWeight(exerciseType, bodyweight, unit) {
  if (exerciseType === EXERCISE_TYPE.bodyweightOnly) {
    return {min: bodyweight, max: bodyweight};
  } else if (exerciseType === EXERCISE_TYPE.bodyweightLoadable) {
    const {min, max} = getMinMaxAddedLoad(unit);
    return {
      min: bodyweight + min,
      max: bodyweight + max,
    };
  } else if (exerciseType === EXERCISE_TYPE.machineAssistance) {
    const {min, max} = getMinMaxAssistance(bodyweight, unit);
    return {
      min: bodyweight - max,
      max: bodyweight - min,
    };
  } else {
    return getRangeMinMax(REC_WEIGHT_RANGES[unit][exerciseType]);
  }
}

export function getMinMaxAddedLoad(unit) {
  return getRangeMinMax(REC_BODYWEIGHT_LOADING_RANGES[unit]);
}

export function getMinMaxAssistance(bodyweight, unit) {
  const minIncrement = unit === UNIT.lb ? 0.5 : 0.25; // Don't allow 0 total load because that would be infinity RIR!
  const maxAssistanceForBodyweight = Math.min(bodyweight, BODYWEIGHT_MAX[unit]) - minIncrement;
  return {min: 0, max: maxAssistanceForBodyweight};
}

export function getCurrentMesoKey(mesocycles) {
  const unfinishedMesos = mesocycles?.filter(
    m => !m.finishedAt && !STATUSES_FINISHED.meso.includes(m.status)
  );

  let mesoKey = null;
  if (mesocycles?.length) {
    let lastFinishedAt = null;
    for (const meso of unfinishedMesos) {
      const mesoLastFinishedAt = [meso.lastFinishedAtDay, meso.lastFinishedAtSet]
        .filter(Boolean)
        .sort()
        .reverse()?.[0];
      if (mesoLastFinishedAt) {
        if (lastFinishedAt === null || mesoLastFinishedAt > lastFinishedAt) {
          mesoKey = meso.key;
          lastFinishedAt = mesoLastFinishedAt;
        }
      }
    }

    // If no mesos have anything finishedAt, use the earliest meso (meso is sorted DES by created_at)
    if (!mesoKey) {
      mesoKey = unfinishedMesos?.[unfinishedMesos.length - 1]?.key;
    }
  }

  return mesoKey;
}

export function getAppUrl(envString) {
  switch (envString) {
    case 'production':
      return 'https://training.rpstrength.com';
    case 'development':
      return 'https://training.dev.rpstrength.com';
    case 'local':
      return 'http://localhost:9090';
    default:
      return `https://training.${envString}.rpstrength.app`;
  }
}

export function isValidYoutubeId(inputString) {
  const regex = /^[A-Za-z0-9_-]{11}$/;
  return regex.test(inputString);
}

export function extractYoutubeId(inputString) {
  const regex = /(youtu\.be\/|watch\?v=|shorts\/)([A-Za-z0-9_-]{11})/g;
  const match = regex.exec(inputString);
  return match ? match[2] : null;
}

const STATUSES_EXERCISES_WORK_PERFORMED = [
  STATUSES.exercise.complete,
  STATUSES.exercise.partial,
  STATUSES.exercise.pendingFeedback,
  STATUSES.exercise.started,
];

export function someDayExercisesWorkPerformed(dayExercisesWithStatuses) {
  return dayExercisesWithStatuses.some(dex =>
    STATUSES_EXERCISES_WORK_PERFORMED.includes(dex.status)
  );
}

export function dayMuscleGroupExercisesDoneAndWorked(dmgExercisesWithStatuses) {
  const finishedEmptyOrPendingFeedbackStatuses = [
    ...STATUSES_FINISHED.exercise,
    STATUSES.exercise.empty,
    STATUSES.exercise.pendingFeedback,
  ];

  const exercisesComplete = dmgExercisesWithStatuses.every(dex =>
    finishedEmptyOrPendingFeedbackStatuses.includes(dex.status)
  );

  return someDayExercisesWorkPerformed(dmgExercisesWithStatuses) && exercisesComplete;
}

// We need jointpain when an exercise is pendingFeedback
function getDayMuscleGroupExerciseNeedsJointPain(dmgExercisesWithStatuses) {
  return dmgExercisesWithStatuses.find(dex => dex.status === STATUSES.exercise.pendingFeedback);
}

// We need soreness when a some work has been done for a dmg dex and soreness IS NULL
export function dayMuscleGroupNeedsSoreness(dmg, dmgExercisesWithStatuses) {
  return someDayExercisesWorkPerformed(dmgExercisesWithStatuses) && dmg.soreness === null;
}

// We need pump if all exercises are done and worked and pump IS NULL
export function dayMuscleGroupNeedsPump(dmg, dmgExercisesWithStatuses) {
  return dayMuscleGroupExercisesDoneAndWorked(dmgExercisesWithStatuses) && dmg.pump === null;
}

// We need workload if all exercises are done and worked and workload IS NULL
export function dayMuscleGroupNeedsWorkload(dmg, dmgExercisesWithStatuses) {
  return dayMuscleGroupExercisesDoneAndWorked(dmgExercisesWithStatuses) && dmg.workload === null;
}

// Given a mesoDay, look for a musclegroup that is pendingFeedback, and check which
// values it (and its related exercises) needs feedback on
// NOTE: muscle groups must already have a status
export function getFeedbackData(mesoDayWithStatuses) {
  let result;

  for (const muscleGroup of mesoDayWithStatuses.muscleGroups) {
    if (muscleGroup.status === STATUSES.muscleGroup.pendingFeedback) {
      const exercisesForGroup = mesoDayWithStatuses.exercises.filter(
        ex => ex.muscleGroupId === muscleGroup.muscleGroupId
      );

      const needsJointPainDex = getDayMuscleGroupExerciseNeedsJointPain(exercisesForGroup);

      const needsSoreness = dayMuscleGroupNeedsSoreness(muscleGroup, exercisesForGroup);
      const needsPump = dayMuscleGroupNeedsPump(muscleGroup, exercisesForGroup);
      const needsWorkload = dayMuscleGroupNeedsWorkload(muscleGroup, exercisesForGroup);

      result = {
        dayMuscleGroup: muscleGroup,
        needsJointPainDex,
        needsSoreness,
        needsPump,
        needsWorkload,
      };

      break;
    }
  }

  return result;
}

export function getLatestBodyweight(mesoWeeks) {
  const latestBodyweight = mesoWeeks
    .map(week =>
      week.days.map(day => ({
        bodyweight: day.bodyweight,
        bodyweightAt: day.bodyweightAt,
        unit: day.unit,
      }))
    )
    .flat()
    .sort((a, b) => b.bodyweightAt - a.bodyweightAt)?.[0];

  return latestBodyweight
    ? latestBodyweight
    : {
        bodyweight: null,
        bodyweightAt: null,
        unit: null,
      };
}

export function isBlockedDeloadWorkout(dayBlobject, mesoBlobject) {
  return (
    dayBlobject.week === mesoBlobject.weeks.length - 1 &&
    !mesoBlobject.weeks[dayBlobject.week - 1].days.every(d => d.finishedAt)
  );
}
