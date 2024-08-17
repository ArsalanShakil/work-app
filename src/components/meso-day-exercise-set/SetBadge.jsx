import {node} from 'prop-types';

export default function SetBadge({children}) {
  return (
    <div className="absolute -right-2.5 -top-2 rounded-full bg-gray-500/70 px-1.5 text-center text-xxs text-white dark:bg-gray-600">
      {children}
    </div>
  );
}

SetBadge.propTypes = {
  children: node.isRequired,
};
