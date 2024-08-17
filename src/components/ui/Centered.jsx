import {node} from 'prop-types';

export default function Centered({children}) {
  return <div className="absolute inset-0 flex items-center justify-center">{children}</div>;
}

Centered.propTypes = {
  children: node.isRequired,
};
