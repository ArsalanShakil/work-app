import {func, object} from 'prop-types';

import {useCurrentMeso} from '../../utils/hooks.js';
import ListItem from './ListItem.jsx';
import ListItemBadge from './ListItemBadge.jsx';

export default function MesocycleListItem({mesoRow, onSelect}) {
  const {data: currentMeso} = useCurrentMeso();

  const badges = [
    <ListItemBadge
      key={`list-item-badge-${mesoRow.id}-1`}
      label={
        <span>
          <span className="font-mono text-[13px]">{mesoRow.days}/</span>
          week
        </span>
      }
    />,
  ];

  if (mesoRow.finishedAt) {
    badges.push(
      <ListItemBadge
        key={`list-item-badge-${mesoRow.id}-2`}
        label="completed"
        className="bg-success/50 text-success-content dark:bg-success/50"
      />
    );
  }

  if (currentMeso?.key === mesoRow.key) {
    badges.push(
      <ListItemBadge
        className="bg-info/50 text-info-content dark:bg-info/50"
        key={`list-item-badge-${mesoRow.id}-3`}
        label="Current"
      />
    );
  }

  return (
    <ListItem
      itemData={{
        id: mesoRow.id,
        name: mesoRow.name,
        header: `${mesoRow.weeks} weeks - created ${new Date(
          mesoRow.createdAt
        ).toLocaleDateString()}`,
        badges,
        onSelect,
      }}
    />
  );
}

MesocycleListItem.propTypes = {
  mesoRow: object.isRequired,
  onSelect: func.isRequired,
};
