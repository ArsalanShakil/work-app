import {bool, func} from 'prop-types';

import SheetNav from '../sheet/SheetNav.jsx';
import SheetPage from '../sheet/SheetPage.jsx';
import SheetTitle from '../sheet/SheetTitle.jsx';
import SheetDialog from '../ui/SheetDialog.jsx';
import WeekdayChooser from './WeekdayChooser.jsx';

export default function UpdateStartDayDialog({isOpen, onClose}) {
  return (
    <SheetDialog isOpen={isOpen} onClose={onClose}>
      <div>
        <SheetTitle title="Update start day" currentPage={1} pageNumber={1} variant="xl" />
      </div>

      <SheetNav handleClose={onClose} />

      <div className="relative h-full desktop:min-h-[400px]">
        <SheetPage currentPage={1} pageNumber={1}>
          <WeekdayChooser onApply={onClose} onCancel={onClose} />
        </SheetPage>
      </div>
    </SheetDialog>
  );
}

UpdateStartDayDialog.propTypes = {
  isOpen: bool.isRequired,
  onClose: func.isRequired,
};
