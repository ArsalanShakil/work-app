import {object} from 'prop-types';
import {forwardRef} from 'react';

const ListWrapper = forwardRef(({style, ...rest}, ref) => {
  return (
    <ul
      ref={ref}
      style={style}
      {...rest}
      className="divide-y divide-base-200 overscroll-contain dark:divide-base-300/40"
    />
  );
});

ListWrapper.propTypes = {
  style: object,
};

ListWrapper.displayName = 'ListWrapper';

export default ListWrapper;
