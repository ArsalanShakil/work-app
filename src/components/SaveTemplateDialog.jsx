import {object} from 'prop-types';
import {useEffect, useState} from 'react';
import {useMatch, useNavigate, useParams} from 'react-router-dom';

import common from '../../../../config/common.json5';
import events from '../../../../lib/events/index.mjs';
import {useCreateTemplate, useTemplateEmphases, useUpdateTemplate} from '../api.js';
import {LS_KEY_EDIT_TEMPLATE_CREATION} from '../constants.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import {runAfterAnimations} from '../utils/misc.js';
import storage from '../utils/storage.js';
import useLocalStore from '../utils/useLocalStore.js';
import Dialog from './ui/Dialog.jsx';
import FormInput from './ui/FormInput.jsx';
import Select from './ui/Select.jsx';

export default function SaveTemplateDialog({template}) {
  const days = useLocalStore(st => st.boardDays);
  const setBoardDays = useLocalStore(st => st.setBoardDays);
  const boardSourceTemplateId = useLocalStore(st => st.boardSourceTemplateId);
  const boardSourceMesoId = useLocalStore(st => st.boardSourceMesoId);
  const resetBoard = useLocalStore(st => st.resetBoard);
  const progressions = useLocalStore(st => st.muscleGroupProgressions);
  const setProgressions = useLocalStore(st => st.setMuscleGroupProgressions);
  const isSaveTemplateOpen = useLocalStore(st => st.isSaveTemplateOpen);
  const setSaveTemplateOpen = useLocalStore(st => st.setSaveTemplateOpen);

  const boardName = useLocalStore(st => st.boardName);
  const setBoardName = useLocalStore(st => st.setBoardName);

  const [sex, setSex] = useState('');
  const [name, setName] = useState(boardName);
  const [emphasis, setEmphasis] = useState('');
  const [createAnother, setCreateAnother] = useState(false);

  const isNewTemplate = useMatch('/templates/new');
  const isNewMeso = useMatch('/mesocycles/new');
  const navigate = useNavigate();
  const {showNotification} = useNotifierContext();
  const createTemplate = useCreateTemplate();

  const {data: templateEmphases} = useTemplateEmphases();

  const {templateKey} = useParams();
  const updateTemplate = useUpdateTemplate(templateKey);

  useEffect(() => {
    if (template) {
      setSex(template.sex);
      setName(template.name);
      setEmphasis(template.emphasis);
    }
  }, [template]);

  const handleClose = useMutationCallback(() => {
    setSaveTemplateOpen(false);
  }, [setSaveTemplateOpen]);

  const handleSuccess = useMutationCallback(
    newTemplate => {
      setSaveTemplateOpen(false);

      runAfterAnimations(() => {
        // if editing existing template, stay on the template and update the baord name
        if (!isNewTemplate) {
          setBoardName(name);

          // reset the board days with the new template data
          setBoardDays(
            newTemplate.days.map(td =>
              td.slots.map(slot => ({
                id: slot.id,
                exerciseId: slot.exerciseId,
                muscleGroupId: slot.muscleGroupId,
              }))
            )
          );

          setProgressions(newTemplate.progressions, {replace: true});
        } else {
          if (!createAnother) {
            navigate('/templates#saved');
          }

          // TODO: This is hilarious. If we don't wait, we don't navigate
          runAfterAnimations(() => {
            // NOTE: we reset the board for both when creating another template or not.
            // This is for both the direct UX of a template creator wanting to have the board
            // reset when creating another template (from scratch being the primary use case for
            // using "create another") and to ensure that we don't have stale board state lying around
            // (esp. the sourceTemplateId, sourceMesoId, and generatedFrom data)
            resetBoard();
            setProgressions({}, {replace: true});
            storage.removeItem(LS_KEY_EDIT_TEMPLATE_CREATION);
          });
        }

        showNotification({
          message: 'Template saved!',
          type: 'success',
          autoClose: true,
        });
      });
    },
    [
      createAnother,
      isNewTemplate,
      name,
      navigate,
      resetBoard,
      setBoardDays,
      setBoardName,
      setProgressions,
      setSaveTemplateOpen,
      showNotification,
    ]
  );

  const handleSave = useMutationCallback(() => {
    const body = {
      name,
      sex,
      days,
      emphasis,
      progressions,
      sourceTemplateId: boardSourceTemplateId,
      sourceMesoId: boardSourceMesoId,
    };

    if (templateKey) {
      updateTemplate.mutate(body, {onSuccess: handleSuccess});
    } else {
      createTemplate.mutate(body, {
        onSuccess: newTemplate => {
          events.track({type: common.eventTypes.templateCreated, templateId: newTemplate.id});
          handleSuccess(newTemplate);
        },
      });
    }
  }, [
    boardSourceMesoId,
    boardSourceTemplateId,
    createTemplate,
    days,
    emphasis,
    handleSuccess,
    name,
    progressions,
    sex,
    templateKey,
    updateTemplate,
  ]);

  return (
    <Dialog
      isOpen={isSaveTemplateOpen}
      onClose={handleClose}
      title={isNewMeso ? 'Save as template' : templateKey ? 'Save template' : 'Create template'}
    >
      <div className="space-y-6">
        <FormInput
          placeholder="Enter a name for this Template"
          label="Template name"
          value={name ?? ''}
          onChange={setName}
          autoFocus
        />

        <div>
          <p className="text-sm font-medium text-base-content">For which sex is this template?</p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSex('male')}
              className={`btn btn-accent -ml-px grow items-center gap-1 ${
                sex === 'male' ? '!border-accent !bg-accent' : 'btn-group-custom'
              }`}
            >
              <span className="">Male</span>
            </button>
            <button
              onClick={() => setSex('female')}
              className={`btn btn-accent grow items-center gap-1 ${
                sex === 'female' ? '!border-accent !bg-accent' : 'btn-group-custom'
              }`}
            >
              <span className="">Female</span>
            </button>
          </div>
        </div>

        <Select onChange={e => setEmphasis(e.target.value)} value={emphasis} label="Emphasis">
          <option value="" disabled>
            Choose Template Emphasis
          </option>
          {templateEmphases &&
            templateEmphases.map(({key}) => {
              return (
                <option key={`exercise-type-${key}`} value={key}>
                  {key}
                </option>
              );
            })}
        </Select>

        {isNewTemplate && (
          <div className="form-control">
            <label className="label flex cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={e => setCreateAnother(!!e.target.checked)}
                className="checkbox outline-none" // TODO: make this accent if it's checked
              />
              <span className="label-text">Create another template</span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <button className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button
            disabled={!sex || !emphasis || !name}
            className="btn btn-accent"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
}

SaveTemplateDialog.propTypes = {
  template: object,
};
