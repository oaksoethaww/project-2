import { totals } from "../services/statistics";
export default function StatsCards({ workouts }) {
  const values = totals(workouts);
  const cards = [
    ["workouts", "Total workouts", "sessions"],
    ["sets", "Total sets", "sets"],
    ["duration", "Workout duration", "minutes"],
    ["calories", "Calories burned", "kcal"],
  ];
  return (
    <div className="stats-grid">
      {cards.map(([key, label, unit], index) => (
        <article className="stat-card" key={key}>
          <div className={`stat-mark mark-${index}`} aria-hidden="true">
            {["↗", "≡", "◷", "ϟ"][index]}
          </div>
          <span>{label}</span>
          <strong>
            {values[key].toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </strong>
          <small>{unit}</small>
        </article>
      ))}
    </div>
  );
}
