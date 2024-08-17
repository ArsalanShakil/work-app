/**
 * Returns an array that represents days of exercises in the meso creation board
 * const days = [[{exerciseId, muscleGroupId}]]
 */

export default function getBoardDays(mesoWeek) {
  if (!mesoWeek) {
    return null;
  }

  return mesoWeek.days.map(day =>
    day.exercises.map(dex => {
      return {
        exerciseId: dex.exerciseId,
        muscleGroupId: dex.muscleGroupId,
      };
    })
  );
}
