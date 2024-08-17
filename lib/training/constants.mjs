export const UNIT = {
  lb: 'lb',
  kg: 'kg',
};

export const BODYWEIGHT_MIN = {
  [UNIT.lb]: 50,
  [UNIT.kg]: 22.5,
};
export const BODYWEIGHT_MAX = {
  [UNIT.lb]: 400,
  [UNIT.kg]: 181.5,
};

export const SKIPPED_SET_REPS = -1;

export const RIR_TARGET_REPS_DELOAD = -8;
export const RIR_TARGET_REPS_BY_MESO_WEEKS = {
  4: [-2, -1, 0, RIR_TARGET_REPS_DELOAD],
  5: [-3, -2, -1, 0, RIR_TARGET_REPS_DELOAD],
  6: [-3, -2, -2, -1, 0, RIR_TARGET_REPS_DELOAD],
};

// via tr_exercise_type db table
export const EXERCISE_TYPE = {
  machine: 'machine',
  barbell: 'barbell',
  smithMachine: 'smith-machine',
  dumbbell: 'dumbbell',
  cable: 'cable',
  freemotion: 'freemotion',

  // these require bodyweight. use `getRequiresBodyweight()` function
  bodyweightOnly: 'bodyweight-only',
  bodyweightLoadable: 'bodyweight-loadable',
  machineAssistance: 'machine-assistance',
};

export const MG_PROGRESSION_TYPES = {
  regular: 'regular',
  slow: 'slow',
};

export const REC_WEIGHT_RANGES = {
  [UNIT.lb]: {
    [EXERCISE_TYPE.machine]: [
      {start: 2.5, end: 200, increment: 2.5},
      {start: 200, end: 1000, increment: 5},
    ],
    [EXERCISE_TYPE.barbell]: [{start: 15, end: 1000, increment: 5}],
    [EXERCISE_TYPE.smithMachine]: [{start: 30, end: 1000, increment: 5}],
    [EXERCISE_TYPE.dumbbell]: [
      {start: 1, end: 8, increment: 1},
      {start: 7.5, end: 30, increment: 2.5},
      {start: 30, end: 205, increment: 5},
    ],
    [EXERCISE_TYPE.cable]: [
      {start: 2.5, end: 200, increment: 2.5},
      {start: 200, end: 1000, increment: 5},
    ],
    [EXERCISE_TYPE.freemotion]: [
      {start: 2.5, end: 200, increment: 2.5},
      {start: 200, end: 1000, increment: 5},
    ],

    // Exercise types that requires bodyweight don't use this constant
    //   EXERCISE_TYPE.bodyweight
    //   EXERCISE_TYPE.bodyweightLoadable
    //   EXERCISE_TYPE.machineAssistance
  },
  [UNIT.kg]: {
    [EXERCISE_TYPE.machine]: [{start: 0.25, end: 600, increment: 0.25}],
    [EXERCISE_TYPE.barbell]: [{start: 10, end: 400, increment: 0.25}],
    [EXERCISE_TYPE.smithMachine]: [{start: 10, end: 400, increment: 0.25}],
    [EXERCISE_TYPE.dumbbell]: [{start: 0.5, end: 150, increment: 0.25}],
    [EXERCISE_TYPE.cable]: [{start: 0.5, end: 300, increment: 0.25}],
    [EXERCISE_TYPE.freemotion]: [{start: 0.5, end: 300, increment: 0.25}],

    // Exercise types that requires bodyweight don't use this constant
    //   EXERCISE_TYPE.bodyweight
    //   EXERCISE_TYPE.bodyweightLoadable
    //   EXERCISE_TYPE.machineAssistance
  },
};

export const REC_BODYWEIGHT_LOADING_RANGES = {
  [UNIT.lb]: [{start: 0, end: 302.5, increment: 2.5}],
  [UNIT.kg]: [{start: 0, end: 150.25, increment: 0.25}],
};

export const REC_BODYWEIGHT_ASSISTANCE_RANGES = {
  [UNIT.lb]: [{start: 0, end: BODYWEIGHT_MAX[UNIT.lb] + 2.5, increment: 2.5}],
  [UNIT.kg]: [{start: 0, end: BODYWEIGHT_MAX[UNIT.kg] + 0.25, increment: 0.25}],
};

export const SET_TYPE = {
  regular: 'regular',
  myorep: 'myorep',
  ['myorep-match']: 'myorep-match',
};

// via tr_set_types table
export const SET_TYPE_KEY = {
  [SET_TYPE.regular]: 'regular',
  [SET_TYPE.myorep]: 'myorep',
  [SET_TYPE['myorep-match']]: 'myorep-match',
};

export const SET_TYPE_NAME = {
  [SET_TYPE.regular]: 'Regular',
  [SET_TYPE.myorep]: 'Myorep',
  [SET_TYPE['myorep-match']]: 'Myorep match',
};

export const SET_TYPE_ABBREVIATION = {
  [SET_TYPE.regular]: 'R',
  [SET_TYPE.myorep]: 'MR',
  [SET_TYPE['myorep-match']]: 'MM',
};

export const STATUSES = {
  set: {
    pendingWeight: 'pendingWeight', // missing weight
    pendingReps: 'pendingReps', // has weight but not reps
    ready: 'ready', // has all required data to be saved

    // data complete
    complete: 'complete', // finishedAt with weight and reps 0+
    skipped: 'skipped', // finishedAt with weight and reps = -1
  },
  // If a set has -1 reps, it's considered skipped.
  // If a set has 0 reps, it's considered failed, but done.
  exercise: {
    empty: 'empty', // no sets
    ready: 'ready', // has sets, none are complete
    started: 'started', // has sets, some but not all are complete
    pendingFeedback: 'pendingFeedback', // all sets are complete but the exercise needs jointpain

    // data complete
    skipped: 'skipped', // all sets are skipped
    partial: 'partial', // all sets are skipped or complete
    complete: 'complete', // all sets are complete
  },

  muscleGroup: {
    unprogrammed: 'unprogrammed', // dmg doesn't have .recommendedSets yet

    // data incomplete
    programmed: 'programmed', // dmg has .recommendedSets
    started: 'started', // some work has been done in this muscle group and there is more to be done

    pendingFeedback: 'pendingFeedback', // all sets are 'done' but we don't have all feedback yet

    // data complete
    noProgramming: 'noProgramming', // dmg.recommendedSets === 0
    skipped: 'skipped', // if all exercises are skipped
    partial: 'partial', // if all are done and any exercise is A: complete, B: skipped
    complete: 'complete', // if all exercises are complete
  },
  day: {
    pending: 'pending', // not all muscle groups are programmed

    // data incomplete
    ready: 'ready', // all musclegroups are programmed or noProgramming
    started: 'started', // if all muscle groups are programmed and ANY musclegroup is started

    pendingFeedback: 'pendingFeedback', // at least one muscle group is still pending feedback

    pendingConfirmation: 'pendingConfirmation', // all data is complete but user has not confirmed FINISHING the workout yet

    // data complete
    noProgramming: 'noProgramming', // no programming
    skipped: 'skipped', // all muscleGroups are skipped or not programmed
    partial: 'partial', // all muscleGroups are complete, partial or skipped but not all the same
    complete: 'complete', // all muscleGroups are complete
  },
  meso: {
    ready: 'ready', // default state
    pendingConfirmation: 'pendingConfirmation', // all days are complete but the meso is not marked finished
    complete: 'complete', // all days are complete and the meso is marked finished
  },
};

export const STATUSES_FINISHED = {
  set: [STATUSES.set.skipped, STATUSES.set.complete],
  exercise: [STATUSES.exercise.skipped, STATUSES.exercise.partial, STATUSES.exercise.complete],
  muscleGroup: [
    STATUSES.muscleGroup.noProgramming,
    STATUSES.muscleGroup.skipped,
    STATUSES.muscleGroup.partial,
    STATUSES.muscleGroup.complete,
  ],
  day: [
    STATUSES.day.noProgramming,
    STATUSES.day.skipped,
    STATUSES.day.partial,
    STATUSES.day.complete,
  ],
  meso: [STATUSES.meso.complete],
};

export const STATUSES_IN_PROGRESS = {
  exercise: [STATUSES.exercise.started, STATUSES.exercise.pendingFeedback],
  muscleGroup: [STATUSES.muscleGroup.started, STATUSES.muscleGroup.pendingFeedback],
  day: [STATUSES.day.started, STATUSES.day.pendingFeedback, STATUSES.day.pendingConfirmation],
};

export const TRAINING_EVENTS = {
  TRAINING_MESO_CREATED_AT: 'TRAINING_MESO_CREATED_AT',
  TRAINING_MESO_FINISHED_AT: 'TRAINING_MESO_FINISHED_AT',

  TRAINING_TEMPLATE_CREATED_AT: 'TRAINING_TEMPLATE_CREATED_AT',

  TRAINING_DAY_FINISHED_AT: 'TRAINING_DAY_FINISHED_AT',
};

export const TRAINING_USER_ATTRIBUTES = {
  TRAINING_MESO_FIRST_CREATED_AT: 'TRAINING_MESO_FIRST_CREATED_AT',
  TRAINING_MESO_LAST_CREATED_AT: 'TRAINING_MESO_LAST_CREATED_AT',
  TRAINING_MESO_FIRST_FINISHED_AT: 'TRAINING_MESO_FIRST_FINISHED_AT',
  TRAINING_MESO_LAST_FINISHED_AT: 'TRAINING_MESO_LAST_FINISHED_AT',

  TRAINING_DAY_FIRST_FINISHED_AT: 'TRAINING_DAY_FIRST_FINISHED_AT',
  TRAINING_DAY_LAST_FINISHED_AT: 'TRAINING_DAY_LAST_FINISHED_AT',

  TRAINING_ACC_FIRST_FINISHED_AT: 'TRAINING_ACC_FIRST_FINISHED_AT',
  TRAINING_ACC_LAST_FINISHED_AT: 'TRAINING_ACC_LAST_FINISHED_AT',
};

// Attributes editable by user
export const TRAINING_FEATURE_PREFIX = 'TRAINING_FEATURE';
export const AUTO_APPLY_WEIGHTS = `${TRAINING_FEATURE_PREFIX}_AUTO_APPLY_WEIGHTS`;

export const TEMPLATE_ADMINS = [
  'andrew@rpstrength.com',
  'andrew@andrewzey.com',
  'easterday@rpstrength.com',
];
