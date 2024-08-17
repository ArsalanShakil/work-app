import {CaretRight} from '@phosphor-icons/react';
import {number, object} from 'prop-types';
import {Fragment, useCallback} from 'react';

import {LIST_ITEM_HEIGHT} from '../../constants.js';

export default function ListItem({data, index, style, itemData}) {
  const item = itemData || data.list[index];
  const emptyRow = data?.emptyRow;

  const handleFocus = useCallback(
    event => {
      event.stopPropagation();
      item?.onFocus(item?.id);
    },
    [item]
  );

  const handleClick = useCallback(() => {
    if (item.selected) {
      if (item.onRemove) {
        item.onRemove();
      }
    } else {
      item.onSelect(item?.id);
    }
  }, [item]);

  return (
    <li
      style={style}
      className="group flex w-full cursor-pointer items-center justify-between py-3 pr-4"
    >
      {item && (
        <Fragment>
          <label
            className="flex w-full cursor-pointer items-center gap-4 truncate"
            htmlFor={`list-${item.id}`}
            onClick={handleClick}
          >
            {(item.selected === true || item.selected === false) && (
              <input
                id={`list-${item.id}`}
                type="radio"
                checked={item.selected}
                className="radio no-animation"
                readOnly
              />
            )}
            <div className="w-full truncate">
              <p
                className={`text-xs uppercase  ${
                  item.disabled ? 'text-base-300/40' : 'text-base-content/60'
                }`}
              >
                {item.header}
              </p>
              <div className="flex items-center gap-2 truncate">
                {item?.titleImgUrl && <img className="h-3 w-auto" src={item.titleImgUrl} />}
                <h4
                  className={`truncate decoration-base-200 decoration-2 underline-offset-4 group-hover:underline dark:decoration-base-100 ${
                    item.disabled ? 'text-base-300/60' : 'text-base-content'
                  }`}
                >
                  {item.name}
                </h4>
              </div>
              <div className={`mt-1 flex items-center gap-2 ${item.disabled ? 'opacity-30' : ''}`}>
                {item.badges}
              </div>
            </div>
          </label>

          <div className="">
            {item.isLoading && (
              <div className="flex h-8 w-8 items-center justify-center">
                <span className="loading loading-spinner loading-xs m-auto text-base-300 dark:text-base-content" />
              </div>
            )}
            {!item.isLoading && item.onFocus && (
              <button onClick={handleFocus} className="btn btn-circle btn-ghost btn-sm">
                <CaretRight size={18} className="text-base-content/80 dark:text-base-content" />
              </button>
            )}
          </div>
        </Fragment>
      )}

      {!item && (emptyRow ? emptyRow : <div style={{height: LIST_ITEM_HEIGHT}} />)}
    </li>
  );
}

ListItem.propTypes = {
  data: object,
  index: number,
  itemData: object,
  style: object,
};
