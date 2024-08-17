import {node, string} from 'prop-types';

export default function EmptyState({title, description, children}) {
  return (
    <div className="bg-base-200 p-4 text-base-content dark:bg-base-200">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>
      {children && <div className="mt-4 flex justify-end">{children}</div>}
    </div>
  );
}

EmptyState.propTypes = {title: string.isRequired, description: string.isRequired, children: node};
