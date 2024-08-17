import {bool, node} from 'prop-types';

export default function Page({children, disablePadding}) {
  return (
    <div
      className={`mx-auto max-w-3xl desktop:mt-4 desktop:px-4 ${
        disablePadding ? '' : 'px-4 pb-64 pt-4 sm:px-0 '
      }`}
    >
      {children}
    </div>
  );
}

Page.propTypes = {
  children: node,
  disablePadding: bool,
};
