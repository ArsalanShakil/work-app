import {useEffect, useMemo, useState} from 'react';
import {useMatch, useNavigate, useParams, useSearchParams} from 'react-router-dom';

import {TEMPLATE_ADMINS} from '../../../../../lib/training/constants.mjs';
import {useMesocycle, useTemplate, useUserProfile} from '../../api.js';
import {
  LS_KEY_EDIT_MESO_CREATION,
  LS_KEY_EDIT_TEMPLATE_CREATION,
  UNTITLED_MESO,
  UNTITLED_TEMPLATE,
} from '../../constants.js';
import {getWorkoutDayIndexesForTemplate} from '../../utils/index.js';
import storage from '../../utils/storage.js';
import useLocalStore from '../../utils/useLocalStore.js';
import Error from '../ui/Error.jsx';
import Loading from '../ui/Loading.jsx';
import Board from './Board.jsx';

export default function BoardLoader() {
  const [initialized, setInitialized] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const {templateKey} = useParams();
  const {data: user} = useUserProfile();
  const navigate = useNavigate();

  const [sourceMesoKey] = useState(searchParams.get('sourceMesoKey'));
  const [sourceTemplateKey] = useState(searchParams.get('sourceTemplateKey'));

  const boardName = useLocalStore(st => st.boardName);
  const setBoardName = useLocalStore(st => st.setBoardName);
  const boardDays = useLocalStore(st => st.boardDays);
  const setBoardDays = useLocalStore(st => st.setBoardDays);
  const boardWeekDays = useLocalStore(st => st.boardWeekDays);
  const setBoardWeekDays = useLocalStore(st => st.setBoardWeekDays);
  const muscleGroupProgressions = useLocalStore(st => st.muscleGroupProgressions);
  const setMuscleGroupProgressions = useLocalStore(st => st.setMuscleGroupProgressions);

  const boardSourceTemplateId = useLocalStore(st => st.boardSourceTemplateId);
  const setBoardSourceTemplateId = useLocalStore(st => st.setBoardSourceTemplateId);
  const boardSourceMesoId = useLocalStore(st => st.boardSourceMesoId);
  const setBoardSourceMesoId = useLocalStore(st => st.setBoardSourceMesoId);
  const boardGeneratedFrom = useLocalStore(st => st.boardGeneratedFrom);
  const setBoardGeneratedFrom = useLocalStore(st => st.setBoardGeneratedFrom);

  const isNewMeso = !!useMatch('/mesocycles/new');
  const isNewTemplate = !!useMatch('/templates/new');

  const localStorageKey = isNewMeso ? LS_KEY_EDIT_MESO_CREATION : LS_KEY_EDIT_TEMPLATE_CREATION;

  // existing template
  const {
    data: template,
    isError: isTemplateError,
    isActuallyLoading: isTemplateLoading,
  } = useTemplate(templateKey, {enabled: !!templateKey});

  // used just for initial hand-off when loading board from copying previous template
  const {
    data: sourceTemplate,
    isError: isSourceTemplateError,
    isActuallyLoading: isSourceTemplateLoading,
  } = useTemplate(sourceTemplateKey, {enabled: !!sourceTemplateKey});

  // used just for initial hand-off when loading board from copying previous meso
  const {
    data: sourceMeso,
    isError: isSourceMesoError,
    isActuallyLoading: isSourceMesoLoading,
  } = useMesocycle(sourceMesoKey, {enabled: !!sourceMesoKey});

  const sourceMesoData = useMemo(() => {
    if (sourceMeso) {
      const lastAccumWeek = sourceMeso.weeks[sourceMeso.weeks.length - 2];
      const days = lastAccumWeek.days;

      const progressions = {};

      for (const day of days) {
        for (const dex of day.exercises) {
          progressions[dex.muscleGroupId] = {
            muscleGroupId: dex.muscleGroupId,
            mgProgressionType: sourceMeso.progressions[dex.muscleGroupId].mgProgressionType,
          };
        }
      }

      return {
        days,
        key: sourceMeso.key,
        name: sourceMeso.name,
        progressions,
        sex: sourceMeso.sex,
      };
    }
  }, [sourceMeso]);

  // Initialize board
  useEffect(() => {
    if (!initialized) {
      if (template) {
        // If user is attempting to edit a template

        // Only admin can edit templates with no user id
        if (template.userId === null && !TEMPLATE_ADMINS.includes(user.email)) {
          navigate('/templates');
        }
        // Only authors can edit their own templates
        else if (template.userId !== null && template.userId !== user.id) {
          navigate('/templates');
        } else {
          // TODO: Do we want to save changes to edits?
          // AZ TODO: discuss with Easterday...
          // This would be the place to load template edit changes
        }

        setBoardDays(
          template.days.map(td =>
            td.slots.map(slot => ({
              id: slot.id,
              exerciseId: slot.exerciseId,
              muscleGroupId: slot.muscleGroupId,
            }))
          )
        );

        setBoardName(template.name);
        setBoardWeekDays(getWorkoutDayIndexesForTemplate(template.days.length, 0));
        setMuscleGroupProgressions(template.progressions, {replace: true});

        setBoardSourceTemplateId(template.sourceTemplateId);
        setBoardSourceMesoId(template.sourceMesoId);
        setBoardGeneratedFrom(template.generatedFrom);

        setInitialized(true);
      } else if (sourceTemplate) {
        // if user is making a new template/meso copied from a template

        setBoardDays(
          sourceTemplate.days.map(td =>
            td.slots.map(slot => ({
              exerciseId: slot.exerciseId,
              muscleGroupId: slot.muscleGroupId,
            }))
          )
        );
        setBoardName(isNewMeso ? UNTITLED_MESO : UNTITLED_TEMPLATE);
        setBoardWeekDays(getWorkoutDayIndexesForTemplate(sourceTemplate.days.length, 0));
        setMuscleGroupProgressions(sourceTemplate.progressions, {replace: true});

        setBoardSourceTemplateId(sourceTemplate.id);
        setBoardSourceMesoId(null);
        setBoardGeneratedFrom(sourceTemplate.name);

        setInitialized(true);
      } else if (sourceMeso) {
        // if user is making a new template/meso copied from a meso

        setBoardDays(
          sourceMesoData.days.map(d =>
            d.exercises.map(dex => ({
              muscleGroupId: dex.muscleGroupId,
              exerciseId: dex.exerciseId,
            }))
          )
        );
        setBoardName(isNewMeso ? UNTITLED_MESO : UNTITLED_TEMPLATE);
        setBoardWeekDays(getWorkoutDayIndexesForTemplate(sourceMesoData.days.length, 0));
        setMuscleGroupProgressions(sourceMesoData.progressions, {replace: true});

        setBoardSourceTemplateId(null);
        setBoardSourceMesoId(sourceMeso.id);
        setBoardGeneratedFrom(sourceMeso.name);

        setInitialized(true);
      } else if (!isTemplateLoading && !isSourceTemplateLoading && !isSourceMesoLoading) {
        // load from local storage OR initial state

        const storedData = storage.getItem(localStorageKey) || {
          days: [[], []],
          name: isNewTemplate ? UNTITLED_TEMPLATE : UNTITLED_MESO,
          weekDays: [null, null],
          muscleGroupProgressions: {},

          sourceTemplateId: null,
          sourceMesoId: null,
          generatedFrom: '',
        };

        setBoardDays(storedData.days);
        setBoardName(storedData.name);
        setBoardWeekDays(storedData.weekDays);
        setMuscleGroupProgressions(storedData.muscleGroupProgressions, {replace: true});

        setBoardSourceTemplateId(storedData.sourceTemplateId);
        setBoardSourceMesoId(storedData.sourceMesoId);
        setBoardGeneratedFrom(storedData.generatedFrom);

        setInitialized(true);
      }
    }
  }, [
    initialized,
    isNewMeso,
    isNewTemplate,
    isSourceMesoLoading,
    isSourceTemplateLoading,
    isTemplateLoading,
    localStorageKey,
    navigate,
    setBoardDays,
    setBoardGeneratedFrom,
    setBoardName,
    setBoardSourceMesoId,
    setBoardSourceTemplateId,
    setBoardWeekDays,
    setMuscleGroupProgressions,
    sourceMeso,
    sourceMesoData,
    sourceTemplate,
    template,
    user.email,
    user.id,
  ]);

  // Clean up search params used for hand-off
  useEffect(() => {
    if (initialized && !templateKey) {
      searchParams.delete('sourceTemplateKey');
      searchParams.delete('sourceMesoKey');

      setSearchParams(searchParams, {replace: true});
    }
  }, [initialized, searchParams, setSearchParams, templateKey]);

  // Save changes to local storage
  useEffect(() => {
    if (initialized && !templateKey) {
      if (boardDays.length === 2 && boardDays[0]?.length === 0 && boardDays[1]?.length === 0) {
        storage.removeItem(localStorageKey);
      } else {
        storage.setItem(localStorageKey, {
          days: boardDays,
          name: boardName,
          weekDays: boardWeekDays,
          muscleGroupProgressions,

          sourceTemplateId: boardSourceTemplateId,
          sourceMesoId: boardSourceMesoId,
          generatedFrom: boardGeneratedFrom,
        });
      }
    }
  }, [
    boardDays,
    boardGeneratedFrom,
    boardName,
    boardSourceMesoId,
    boardSourceTemplateId,
    boardWeekDays,
    initialized,
    localStorageKey,
    muscleGroupProgressions,
    templateKey,
  ]);

  if (isTemplateLoading || isSourceTemplateLoading || isSourceMesoLoading || !initialized) {
    return <Loading />;
  }

  if (isTemplateError || isSourceTemplateError || isSourceMesoError) {
    return <Error error={{message: 'There was an error retrieving data.'}} />;
  }

  return <Board template={template} />;
}
