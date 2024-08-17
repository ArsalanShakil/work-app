import {GenderFemale, GenderMale} from '@phosphor-icons/react';
import {bool, func} from 'prop-types';
import {useCallback} from 'react';

import {useTemplateEmphases} from '../../api.js';
import useLocalStore from '../../utils/useLocalStore.js';
import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import FilterButton from '../ui/FilterButton.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';

export default function TemplateFiltersDialog({inDialog, isOpen, onClose}) {
  const {data: templateEmphases} = useTemplateEmphases();

  const setTemplateFilterSex = useLocalStore(st => st.setTemplateFilterSex);
  const localTemplateFilterSex = useLocalStore(st => st.localTemplateFilterSex);
  const setLocalTemplateFilterSex = useLocalStore(st => st.setLocalTemplateFilterSex);

  const setTemplateFilterEmphasis = useLocalStore(st => st.setTemplateFilterEmphasis);
  const localTemplateFilterEmphasis = useLocalStore(st => st.localTemplateFilterEmphasis);
  const setLocalTemplateFilterEmphasis = useLocalStore(st => st.setLocalTemplateFilterEmphasis);

  const setNumberOfDays = useLocalStore(st => st.setTemplateFilterNumberOfDays);
  const localNumberOfDays = useLocalStore(st => st.localTemplateFilterNumberOfDays);
  const setLocalNumberOfDays = useLocalStore(st => st.setLocalTemplateFilterNumberOfDays);

  const handleApply = useCallback(() => {
    setTemplateFilterSex(localTemplateFilterSex);
    setTemplateFilterEmphasis(localTemplateFilterEmphasis);
    setNumberOfDays(localNumberOfDays);
    onClose();
  }, [
    localNumberOfDays,
    localTemplateFilterEmphasis,
    localTemplateFilterSex,
    onClose,
    setNumberOfDays,
    setTemplateFilterEmphasis,
    setTemplateFilterSex,
  ]);

  return (
    <SheetDialog isOpen={isOpen} onClose={onClose} inDialog={inDialog}>
      <div>
        <SheetTitle title="Template Filters" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={onClose} />

      <div className="relative h-full desktop:min-h-[700px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <div className="min-h-0 grow overflow-auto">
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <h4 className="font-medium">Emphasis</h4>

                <div className=" grid grid-cols-2 gap-4 desktop:p-0">
                  {templateEmphases?.map(te => (
                    <FilterButton
                      key={te.key}
                      onClick={() =>
                        setLocalTemplateFilterEmphasis(
                          localTemplateFilterEmphasis === te.key ? null : te.key
                        )
                      }
                      active={te.key === localTemplateFilterEmphasis}
                    >
                      {te.key}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pb-6">
                <h4 className="font-medium">Sex</h4>

                <div className="grid grid-cols-2 gap-4 desktop:p-0">
                  <FilterButton
                    onClick={() =>
                      setLocalTemplateFilterSex(localTemplateFilterSex === 'male' ? null : 'male')
                    }
                    active={localTemplateFilterSex === 'male'}
                  >
                    <GenderMale size={20} />
                    Male
                  </FilterButton>

                  <FilterButton
                    onClick={() =>
                      setLocalTemplateFilterSex(
                        localTemplateFilterSex === 'female' ? null : 'female'
                      )
                    }
                    active={localTemplateFilterSex === 'female'}
                  >
                    <GenderFemale size={20} />
                    Female
                  </FilterButton>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Workouts per week</h4>

                <div className="grid grid-cols-5 gap-4 desktop:p-0">
                  {Array(5)
                    .fill()
                    .map((x, i) => (
                      <FilterButton
                        key={i + 2}
                        onClick={() =>
                          setLocalNumberOfDays(localNumberOfDays === i + 2 ? null : i + 2)
                        }
                        active={i + 2 === localNumberOfDays}
                      >
                        {i + 2}
                      </FilterButton>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-4 border-t p-4 pb-safe-offset-4 dark:border-base-300/60">
            <button onClick={onClose} className="btn btn-ghost">
              cancel
            </button>
            <button onClick={handleApply} className="btn btn-accent">
              apply
            </button>
          </div>
        </SheetPage>
      </div>
    </SheetDialog>
  );
}

TemplateFiltersDialog.propTypes = {
  inDialog: bool,
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
