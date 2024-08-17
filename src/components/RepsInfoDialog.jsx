import {RIR_TARGET_REPS_DELOAD} from '../../../../lib/training/constants.mjs';
import {useTargetRIR} from '../utils/hooks.js';
import useLocalStore from '../utils/useLocalStore.js';
import Dialog from './ui/Dialog.jsx';

export default function RepsInfoDialog() {
  const isRepsInfoOpen = useLocalStore(st => st.isRepsInfoOpen);
  const setRepsInfoOpen = useLocalStore(st => st.setRepsInfoOpen);
  const targetRIR = useTargetRIR();
  // TODO: Should this be part of the tutorial process?

  return (
    <Dialog isOpen={isRepsInfoOpen} onClose={() => setRepsInfoOpen(false)} title="Target reps">
      {targetRIR === 0 ? (
        <>
          <p>
            This is your final accumulation week. Aim to hit at least the specified target reps to
            ensure you&apos;re getting the best results.
          </p>
          <p>
            If you can perform more reps than targeted without compromising your technique, feel
            free to do so. Your results will be great either way, so it&apos;s your call!
          </p>
        </>
      ) : targetRIR === Math.abs(RIR_TARGET_REPS_DELOAD) ? (
        <>
          <p>
            During deload week your job is to reduce fatigue as much as possible to set up your next
            mesocycle for maximum muscle gain. Don&apos;t worry about hitting{' '}
            {Math.abs(RIR_TARGET_REPS_DELOAD)}
            &nbsp; RIR exactly, just make sure every set this week feels ultra easy.
          </p>
          <p>
            If you have to grind, fatigue will hang around and your next mesocycle may be negatively
            affected. Focus on your best technique and stop each set before it even feels like a
            challenge.
          </p>
          <p>
            This easier training will promote even more fatigue reduction than taking time off of
            training completely, while also improving your technique.
          </p>
        </>
      ) : (
        <>
          <p>
            To promote maximum muscle-building results, we will provide specific target reps for you
            to shoot for whenever we can.
          </p>
          <p>
            Always do your best to perform that many reps to ensure you are progressing. If you feel
            like the final reps in a set are super easy, you can do 1-2 extra reps and record that
            new rep result, but erring on the conservative side is usually wiser.
          </p>
          <p>
            If it&apos;s a new set without specific target reps, perform your reps with great
            technique and do your best to stop at the target RIR for the exercise.
          </p>
        </>
      )}

      <div className="flex justify-end">
        <button className="btn btn-accent" onClick={() => setRepsInfoOpen(false)}>
          Got it
        </button>
      </div>
    </Dialog>
  );
}
