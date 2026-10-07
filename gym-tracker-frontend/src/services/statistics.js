export function totals(workouts) {
  return workouts.reduce(
    (result, workout) => ({
      workouts: result.workouts + 1,
      sets: result.sets + workout.sets,
      duration: result.duration + workout.duration,
      calories: result.calories + workout.calories,
    }),
    { workouts: 0, sets: 0, duration: 0, calories: 0 },
  );
}
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function formatDate(value) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric" },
  );
}
export function weeklyDays(workouts, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    const key = dateKey(date);
    return {
      date: key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      ...totals(workouts.filter((w) => w.date.slice(0, 10) === key)),
    };
  });
}
