import {useEffect, useRef, useState} from 'react';

import {APPS, PLATFORMS} from '../../../../lib/constants.mjs';
import {useUserReview} from '../api.js';
import {APP_VERSION} from '../constants.js';
import {useNotifierContext} from '../NotifierContext.jsx';
import {useMutationCallback} from '../utils/hooks.js';
import useLocalStore from '../utils/useLocalStore.js';
import Dialog from './ui/Dialog.jsx';

export default function UserReviewDialog() {
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const {mutate, isWorking} = useUserReview();

  const {showNotification} = useNotifierContext();

  const userReviewOpen = useLocalStore(st => st.userReviewOpen);
  const setUserReviewOpen = useLocalStore(st => st.setUserReviewOpen);

  const focusRef = useRef();

  const isFormComplete = stars > 0 && reviewText !== '';

  const handleClose = useMutationCallback(() => {
    setUserReviewOpen(false);
    setReviewText('');
  }, [setUserReviewOpen]);

  const handleUserReview = useMutationCallback(() => {
    const body = {
      app: APPS.training,
      appVersion: APP_VERSION,
      platform: PLATFORMS.rp,
      rating: stars,
      description: reviewText,
    };

    mutate(body, {
      onSuccess: () => {
        handleClose();
        showNotification({
          message: 'Thank you for your review!',
          type: 'success',
          autoClose: true,
        });
      },
    });
  }, [handleClose, mutate, reviewText, showNotification, stars]);

  // We need to wait for the dialog open state to render
  // before we can depend on our ref being available
  useEffect(() => {
    const timer = setTimeout(() => userReviewOpen && focusRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [userReviewOpen]);

  return (
    <Dialog isOpen={userReviewOpen} onClose={handleClose} title="Rate RP Hypertrophy">
      <form id="rating">
        <legend className="sr-only">Star rating</legend>
        <div className="rating rating-lg mt-2">
          {[0, 1, 2, 3, 4, 5].map(val => (
            <input
              key={val}
              type="radio"
              name="rating"
              value={val}
              className={val === 0 ? 'rating-hidden' : 'mask mask-star-2 bg-accent-focus'}
              checked={stars === val}
              onChange={() => setStars(val)}
            />
          ))}
        </div>
      </form>

      <p className="py-2 text-sm text-base-content">
        Tell us anything at all about the app that you think would be useful for us to know!
      </p>

      <div className="flex w-full">
        <textarea
          ref={focusRef}
          className="textarea textarea-bordered min-h-[150px] w-full focus:border-accent-focus focus:outline-none focus:ring-0"
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
        ></textarea>
      </div>
      <div className="flex items-center justify-end space-x-3">
        <button className="btn btn-ghost" onClick={handleClose}>
          Cancel
        </button>
        <button
          disabled={!isFormComplete || isWorking}
          className="btn btn-accent"
          onClick={handleUserReview}
        >
          {isWorking && <span className="loading"></span>}
          Share
        </button>
      </div>
    </Dialog>
  );
}
