import {create} from 'zustand';

import tailwindConfig from '../../tailwind.config.js';
import {BREAKPOINTS, LS_KEY_THEME, THEMES} from '../constants.js';
import {getPreferredTheme, setTheDomStatusBarColor, STATUS_BAR_COLOR_TYPES} from './index.js';
import storage from './storage.js';

const availableThemes = tailwindConfig.daisyui.themes.map(theme =>
  typeof theme === 'string' ? theme : Object.keys(theme)[0]
);

const useLocalStore = create(set => ({
  theme: getPreferredTheme(availableThemes),
  themes: availableThemes,
  setTheme: theme => {
    if (availableThemes.includes(theme)) {
      storage.setItem(LS_KEY_THEME, theme);

      // TODO: Find a better way to refer to the dark themes
      if (theme === THEMES.dark) {
        document.documentElement.classList.add(THEMES.dark);
      } else {
        document.documentElement.classList.remove(THEMES.dark);
      }

      set({theme});
      document.documentElement.setAttribute('data-theme', theme);
      setTheDomStatusBarColor(theme);
    }
  },

  // Meso meta data
  firstExerciseCompletedAt: null,
  setFirstExerciseCompletedAt: timeStamp => set({firstExerciseCompletedAt: timeStamp}),
  firstMicroCompletedAt: null,
  setFirstMicroCompletedAt: timeStamp => set({firstMicroCompletedAt: timeStamp}),
  firstSetCompletedAt: null,
  setFirstSetCompletedAt: timeStamp => set({firstSetCompletedAt: timeStamp}),

  isDesktop: window.matchMedia(`(min-width: ${BREAKPOINTS.desktop})`).matches,
  setIsDesktop: isDesktop => set({isDesktop}),

  muscleGroupPickerOpen: false,
  setMuscleGroupPickerOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {muscleGroupPickerOpen: isOpen};
    }),

  dayExerciseIdToDelete: null,
  setDayExerciseIdToDelete: id => set({dayExerciseIdToDelete: id}),

  // Template Muscle Group Progression
  templateProgressionsOpen: false,
  setTemplateProgressionsOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {templateProgressionsOpen: isOpen};
    }),

  muscleGroupProgressions: {},
  setMuscleGroupProgressions: (newProgressions, options) =>
    set(st => ({
      muscleGroupProgressions: {
        ...(options?.replace !== true && st.muscleGroupProgressions),
        ...newProgressions,
      },
    })),

  removeMuscleGroupProgression: muscleGroupId =>
    set(st => {
      const newProgressions = {...st.muscleGroupProgressions};

      delete newProgressions[muscleGroupId];
      return {muscleGroupProgressions: newProgressions};
    }),

  // Template Chooser
  templateChooserOpen: false,
  setTemplateChooserOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {templateChooserOpen: isOpen};
    }),

  // Template Filters
  templateFilterNumberOfDays: null,
  setTemplateFilterNumberOfDays: num => set({templateFilterNumberOfDays: num}),
  localTemplateFilterNumberOfDays: null,
  setLocalTemplateFilterNumberOfDays: num => set({localTemplateFilterNumberOfDays: num}),

  templateFilterSex: null,
  setTemplateFilterSex: sex => set({templateFilterSex: sex}),
  localTemplateFilterSex: null,
  setLocalTemplateFilterSex: sex => set({localTemplateFilterSex: sex}),

  templateFilterEmphasis: null,
  setTemplateFilterEmphasis: emph => set({templateFilterEmphasis: emph}),
  localTemplateFilterEmphasis: null,
  setLocalTemplateFilterEmphasis: emph => set({localTemplateFilterEmphasis: emph}),

  isSaveTemplateOpen: false,
  setSaveTemplateOpen: isOpen => set({isSaveTemplateOpen: isOpen}),

  // Board
  boardName: '',
  setBoardName: boardName => set({boardName}),
  boardDays: [[], []],
  setBoardDays: days => set({boardDays: days}),
  boardWeekDays: [null, null],
  setBoardWeekDays: weekDays => set({boardWeekDays: weekDays}),
  cardSlotIndex: null,
  setSlotIndex: idx => set({cardSlotIndex: idx}),
  cardDayIndex: null,
  setDayIndex: idx => set({cardDayIndex: idx}),

  boardSourceTemplateId: null,
  setBoardSourceTemplateId: sourceTemplateId => set({boardSourceTemplateId: sourceTemplateId}),
  boardSourceMesoId: null,
  setBoardSourceMesoId: sourceMesoId => set({boardSourceMesoId: sourceMesoId}),
  boardGeneratedFrom: '',
  setBoardGeneratedFrom: generatedFrom => set({boardGeneratedFrom: generatedFrom}),

  resetBoard: () =>
    set({
      boardName: '',
      boardDays: [[], []],
      boardWeekDays: [null, null],
      cardSlotIndex: null,
      cardDayIndex: null,
      boardSourceTemplateId: null,
      boardSourceMesoId: null,
      boardGeneratedFrom: '',
      muscleGroupProgressions: {},
    }),

  createMesoModalOpen: false,
  setCreateMesoModalOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {createMesoModalOpen: isOpen};
    }),

  copyMesoOpen: false,
  setCopyMesoOpen: isOpen => set({copyMesoOpen: isOpen}),

  userReviewOpen: false,
  setUserReviewOpen: isOpen => set({userReviewOpen: isOpen}),

  readynessDialogOpen: false,
  setReadynessDialogOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {readynessDialogOpen: isOpen};
    }),

  isFinishWorkoutDialogOpen: false,
  setIsFinishWorkoutDialogOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isFinishWorkoutDialogOpen: isOpen};
    }),

  isFinishMesoDialogOpen: false,
  setIsFinishMesoDialogOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isFinishMesoDialogOpen: isOpen};
    }),

  isRepsInfoOpen: false,
  setRepsInfoOpen: isOpen => set({isRepsInfoOpen: isOpen}),

  isFeedbackOpen: false,
  setIsFeedbackOpen: isOpen => set({isFeedbackOpen: isOpen}),

  endMesoOpen: false,
  setEndMesoOpen: isOpen => set({endMesoOpen: isOpen}),

  isMesoSummaryOpen: false,
  setIsMesoSummaryOpen: isMesoSummaryOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isMesoSummaryOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isMesoSummaryOpen};
    }),

  isWarmupOpen: false,
  setIsWarmupOpen: isWarmupOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isWarmupOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isWarmupOpen};
    }),

  isRestDialogOpen: false,
  setIsRestDialogOpen: isRestDialogOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isRestDialogOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isRestDialogOpen};
    }),

  isSetTypeDialogOpen: false,
  setIsSetTypeDialogOpen: isSetTypeDialogOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isSetTypeDialogOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isSetTypeDialogOpen};
    }),

  isMesoChooserDialogOpen: false,
  setIsMesoChooserDialogOpen: isOpen =>
    set(st => {
      setTheDomStatusBarColor(st.theme, isOpen && STATUS_BAR_COLOR_TYPES.modalOpen);
      return {isMesoChooserDialogOpen: isOpen};
    }),

  // Sets
  focusedSetId: null,
  setFocusedSetId: focusedSetId => set({focusedSetId}),

  focusedSetInputType: null,
  setFocusedSetInputType: focusedSetInputType => set({focusedSetInputType}),
}));

export default useLocalStore;
