import resolveConfig from 'tailwindcss/resolveConfig';

import {EXERCISE_TYPE, UNIT} from '../../../lib/training/constants.mjs';
import packageJson from '../package.json';
import tailwindConfig from '../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);
export const BREAKPOINTS = fullConfig?.theme?.screens;

export const APP_VERSION = packageJson.version;

export let ENV = RP_ENV || NODE_ENV;

export let API_URL = '/api';
if (RP_API_BASE_URL) {
  API_URL = RP_API_BASE_URL;
}

export const EVENTS_URL = `${API_URL}/events`;

export let AUTH_URL = 'https://apps.rpstrength.com';
if (RP_AUTH_URL) {
  AUTH_URL = RP_AUTH_URL;
} else {
  switch (ENV) {
    case 'production':
      AUTH_URL = 'https://apps.rpstrength.com';
      break;
    case 'development':
      AUTH_URL = 'https://apps.dev.rpstrength.com';
      break;
    case 'local':
      AUTH_URL = 'http://localhost:3000';
      break;
    default:
      AUTH_URL = `https://apps.${ENV}.rpstrength.app`;
      break;
  }
}

export const ACCESS_ITEM = {
  training: 'training',
  diet: 'diet',
};

export const COOKIE_KEY = 'rp_token';

export const ROOT_DOMAIN = location.hostname.split('.').slice(1).join('.');

export const IS_HOST_LOCAL = location.hostname === 'localhost';

export const MAX_EXERCISES_PER_DAY = 8;

const muscleGroupNamesById = {
  1: 'chest',
  2: 'back',
  3: 'triceps',
  4: 'biceps',
  5: 'shoulders',
  6: 'quads',
  7: 'glutes',
  8: 'hamstrings',
  9: 'calves',
  10: 'traps',
  11: 'forearms',
  12: 'abs',
};

const pronounByMuscleGroupId = {
  1: 'it',
  2: 'it',
  3: 'them',
  4: 'them',
  5: 'them',
  6: 'them',
  7: 'them',
  8: 'them',
  9: 'them',
  10: 'them',
  11: 'them',
  12: 'them',
};

export const exerciseJointPainFeedbackText = exerciseName => {
  return {
    prompt: `How did your joints feel during ${exerciseName}?`,
    short: {
      0: 'None',
      1: 'Low pain',
      2: 'Moderate pain',
      3: 'A lot of pain',
    },
    long: {
      0: 'My joints felt great, no problems.',
      1: 'My joints felt ok, but I can definitely feel them being loaded.',
      2: "My joints are taking a bit of a beating. They definitely don't love this exercise right now.",
      3: 'My joints hurt BAD, something is up.',
    },
  };
};

export const muscleGroupFeedbackText = muscleGroupId => {
  const muscleGroupName = muscleGroupNamesById[muscleGroupId];
  const pronoun = pronounByMuscleGroupId[muscleGroupId];

  return {
    soreness: {
      prompt: `How sore did you get in your ${muscleGroupName} AFTER training ${pronoun} LAST TIME?`,
      short: {
        0: 'Never got sore',
        1: 'Healed a while ago',
        2: 'Healed just on time',
        3: "I'm still sore!",
      },
      long: {
        0: `I never got sore at all in my ${muscleGroupName} last time I trained ${pronoun}, and I could have trained ${pronoun} hard the next day! I'm ready to smash!`,
        1: `I got a tiny bit sore in my ${muscleGroupName} last time, but healed way before this session. I feel strong!`,
        2: 'I recovered just on time for this session and my target muscles feel good.',
        3: `I'm still sore, fatigued, or weak in my ${muscleGroupName} from the last time it trained it`,
      },
    },
    pump: {
      prompt: `How much of a pump did you get today in your ${muscleGroupName}?`,
      short: {
        0: 'Low pump',
        1: 'Moderate pump',
        2: 'Amazing pump',
      },
      long: {
        0: 'My pump was hardly noticeable or nonexistent.',
        1: 'My pump was ok. Definitely pumped, but nothing crazy.',
        2: 'My pump was amazing!',
      },
    },
    workload: {
      prompt: `How would you rate the difficulty of the work you did for your ${muscleGroupName}?`,
      short: {
        0: 'Easy',
        1: 'Pretty good',
        2: 'Pushed my limits',
        3: 'Too much',
      },
      long: {
        0: 'It felt like barely any work. I can do more and I have the time to do more.',
        1: 'It was a bit on the easy side, but it did hit the spot. I have the time to do more if needed, but only if that will get me better gains.',
        2: "It was quite a bit of work, and though I can do more, I'd prefer no more sets next time unless absolutely necessary.",
        3: "It was a ton of work, and I don't think I can do any more sets than this next time.",
      },
    },
  };
};

export const exerciseTypeNamesById = {
  [EXERCISE_TYPE.machine]: 'machine',
  [EXERCISE_TYPE.machineAssistance]: 'machine assistance',
  [EXERCISE_TYPE.barbell]: 'barbell',
  [EXERCISE_TYPE.dumbbell]: 'dumbbell',
  [EXERCISE_TYPE.cable]: 'cable',
  [EXERCISE_TYPE.freemotion]: 'freemotion',
  [EXERCISE_TYPE.smithMachine]: 'smith machine',
  [EXERCISE_TYPE.bodyweightOnly]: 'bodyweight',
  [EXERCISE_TYPE.bodyweightLoadable]: 'bodyweight loadable',
};

export const EXERCISE_SET_FOCUS = {
  reps: 'reps',
  weight: 'weight',
};

export const UNIT_DISPLAY = {
  singular: {
    [UNIT.lb]: 'lb',
    [UNIT.kg]: 'kg',
  },
  plural: {
    [UNIT.lb]: 'lbs',
    [UNIT.kg]: 'kg',
  },
};

// Available tailwind durations
const ANIMATION_DURATIONS = [0, 75, 100, 150, 200, 300, 500, 700, 1000];
export const ANIMATION_DURATION = ANIMATION_DURATIONS[4];

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const templateDayRecommendations = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
};

export const feedbackTypes = {
  jointPain: 'jointPain',
  soreness: 'soreness',
  pump: 'pump',
  workload: 'workload',
};

export const feedbackTypeNames = {
  jointPain: 'joint pain',
  soreness: 'soreness',
  pump: 'pump',
  workload: 'workload',
};

export const LS_KEY_APP_VERSIONS = 'trainingWebVersionsSeen';
export const LS_KEY_APP_WELCOME_SEEN = 'trainingWebWelcomeSeen';
export const LS_KEY_APP_PWA_SEEN = 'trainingWebPWASeen';
export const LS_KEY_USER_SUBS = 'trainingUserSubs';
export const LS_KEY_EDIT_MESO_CREATION = 'trainingEditMesoCreate';
export const LS_KEY_EDIT_TEMPLATE_CREATION = 'trainingEditTemplateCreate';
export const LS_KEY_HAS_SEEN_CALENDAR = 'trainingHasSeenCalendar';
export const LS_KEY_AUTO_WEIGHT_MESO_KEYS = 'trainingAutoWeightMesoKeys';
export const LS_KEY_THEME = 'trainingTheme';
export const LS_KEY_MASQUERADE = 'trainingWebMasquerade';
export const LS_KEY_WORKOUT_TUTORIAL_SEEN = 'trainingWebWorkoutTutorialSeen';
export const LS_KEY_WARMUP_INFO_SEEN = 'trainingWarmupInfoSeen';
export const LS_KEY_REST_INFO_SEEN = 'trainingRestInfoSeen';
export const LS_DEVICE_ID_KEY = 'trainingDeviceId';
export const LS_KEY_DOWNTIME_WARNING_LAST_SEEN = 'trainingDowntimeWarningLastSeen';

export const DISPLAY_MODE_PWA = 'PWA';
export const DISPLAY_MODE_IN_BROWSER = 'in-browser';

export const MOBILE_HEADER_PORTAL_NODE = 'mobile-header-portal-node';

export const DISPLAY_MODE = window.matchMedia('(display-mode: standalone)').matches
  ? DISPLAY_MODE_PWA
  : DISPLAY_MODE_IN_BROWSER;

export const DIALOG_CONFIGS = {
  deleteTemplate: {
    confirmButtonText: 'delete template',
    confirmText: 'delete my template',
    description: 'Are you sure you want to delete this template?',
    message: 'this cannot be undone',
    title: 'Delete Template',
    variant: 'error',
  },
  endExercise: {
    title: 'End exercise?',
    confirmButtonText: 'End exercise',
    message: 'This cannot be undone',
    variant: 'error',
    confirmText: 'end exercise',
    description: 'Ending this exercise will mark all unfinished sets as skipped.',
  },
  endWorkout: {
    title: 'End workout?',
    confirmButtonText: 'End workout',
    message: 'This cannot be undone',
    variant: 'error',
    confirmText: 'end workout',
    description: 'Ending this workout will skip all unfinished sets.',
  },
  setsWillResetWarning: {
    description:
      'This exercise has sets that have already been performed. When you replace it with another exercise, all existing sets will be marked as incomplete and their weight and reps will be reset.',
  },
  dayCompleteWarning: {
    description:
      "This workout has already been completed. You can make this change but it won't update any recommendations that have already been made for future workouts.",
  },
  resetBoard: {
    title: 'Reset board?',
    variant: 'error',
    message: 'This cannot be undone',
    description:
      'This will remove all muscle groups and reset your board to the initial blank state.',
    confirmButtonText: 'Reset board',
  },
  autoMatchWeightConfirm: {
    title: 'Auto match weight',
    variant: 'info',
    message:
      'Tip! If you mostly do straight sets, you may want to try enabling the auto match weight feature.',
    description:
      'Subsequent weight values that match will be updated. You can enable it here, but you can always toggle this feature on or off from your profile page as well.',
    confirmButtonText: 'Enable',
    cancelButtonText: 'Ignore',
    minHeight: 300,
  },
  autoMatchWeightDisableConfirm: {
    title: 'Auto match weight',
    message: '',
    description:
      '☝️ Reminder! You have the auto match weight update feature enabled. You can update your preference here but you can always toggle this feature on or off from your profile page as well.',
    confirmButtonText: 'Ok',
    cancelButtonText: 'Disable',
    minHeight: 300,
  },
  resetDay: {
    title: 'Reset day',
    description: 'This will reset all of the sets in this workout.',
  },
};

export const MANIFEST_HREF_NORMAL = '/app.webmanifest';

export const SIDEBAR_WIDTH = 280; // pixels

export const THEMES = {
  light: 'light',
  dark: 'dark',
};

// As calculated by the rendered style of a list item not controlled by a <List /> component
export const LIST_ITEM_HEIGHT = 92;

export const BUTTON_TYPE = {
  done: 'done',
  skipped: 'skipped',
  active: 'active',
  inactive: 'inactive',
  working: 'working',
};

export const SET_INPUTS = {
  reps: 'reps',
  weight: 'weight',
};

export const REPS_MAX = 100;

export const UNTITLED_MESO = 'Untitled mesocycle';
export const UNTITLED_TEMPLATE = 'Untitled template';
