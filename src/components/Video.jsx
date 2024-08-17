import {bool, func, string} from 'prop-types';
import {useEffect, useRef} from 'react';
import {twMerge} from 'tailwind-merge';

import {useScript} from '../utils/hooks.js';

export default function Video({id, onClose = () => {}, className, disabled}) {
  const frame = useRef();
  const status = useScript('https://www.youtube.com/iframe_api');

  useEffect(() => {
    if (frame.current && status === 'ready' && !disabled && window.YT) {
      window.YT.ready(() => {
        new window.YT.Player(frame.current, {
          events: {
            onStateChange: event => {
              if (event.data === window.YT.PlayerState.ENDED) {
                onClose();
              }
            },
          },
        });
      });
    }
  }, [disabled, onClose, status]);

  return (
    <div className="relative flex aspect-video w-full items-center justify-center bg-base-200">
      <iframe
        ref={frame}
        className={twMerge('w-full aspect-video', className)}
        src={`https://www.youtube.com/embed/${id}?rel=0&enablejsapi=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;"
      />
    </div>
  );
}

Video.propTypes = {
  disabled: bool,
  className: string,
  id: string,
  onClose: func,
};
