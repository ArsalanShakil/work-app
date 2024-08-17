import {bool, node, number} from 'prop-types';
import {useLayoutEffect, useRef, useState} from 'react';

import {isNum} from '../../../../../lib/math.mjs';

export default function Expander({children, isOpen, specificHeight = null}) {
  const ref = useRef(null);
  const [elementHeight, setElementHeight] = useState(specificHeight);

  useLayoutEffect(() => {
    if (!specificHeight) {
      const {height} = ref.current.getBoundingClientRect();
      setElementHeight(height);
    }
  }, [specificHeight]);

  return (
    <div
      style={{height: isOpen && isNum(elementHeight) && elementHeight > 0 ? elementHeight : 0}}
      className="overflow-hidden transition-height duration-300 ease-in-out"
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

Expander.propTypes = {
  children: node,
  isOpen: bool.isRequired,
  specificHeight: number,
};
