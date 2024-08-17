import {bool, func, object} from 'prop-types';

import logoUrl from '../../assets/logo-simple.png';
import ListItem from './ListItem.jsx';
import ListItemBadge from './ListItemBadge.jsx';

export default function TemplateListItem({templateRow, isLoading, onSelect}) {
  return (
    <ListItem
      itemData={{
        name: templateRow.name,
        header: templateRow.emphasis,
        titleImgUrl: templateRow.userId === null ? logoUrl : null,
        isLoading,
        badges: [
          <ListItemBadge
            key={`list-item-badge-${templateRow.id}-1`}
            label={
              <span>
                <span className="font-mono text-[13px]">{templateRow.frequency}/</span>
                week
              </span>
            }
          />,
          <ListItemBadge key={`list-item-badge-${templateRow.id}-2`} label={templateRow.sex} />,
        ],
        onSelect,
      }}
    />
  );
}

TemplateListItem.propTypes = {
  templateRow: object.isRequired,
  isLoading: bool,
  onSelect: func.isRequired,
};
