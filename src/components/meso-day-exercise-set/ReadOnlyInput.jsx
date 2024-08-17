import {node} from 'prop-types';

import {setInputStyleCompleted} from './styles.js';

export default function ReadOnlyInput({children}) {
  return (
    <div
      className={`relative flex h-[32px] w-4/5 items-center justify-center ${setInputStyleCompleted} desktop:w-2/3`}
    >
      {children}
    </div>
  );
}

ReadOnlyInput.propTypes = {
  children: node.isRequired,
};
