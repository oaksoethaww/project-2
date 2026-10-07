import { useWorkouts } from "../context/WorkoutContext";
import StatsCards from "../components/StatsCards";
import WorkoutState from "../components/WorkoutState";
import { weeklyDays, formatDate } from "../services/statistics";
export default function Statistics() {
  const { workouts } = useWorkouts();
  const days = weeklyDays(workouts);
  const max = Math.max(1, ...days.map((d) => d.workouts));
  const weekCount = days.reduce((sum, d) => sum + d.workouts, 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEE THE BIGGER PICTURE</span>
          <h1>Your statistics</h1>
          <p>Every session contributes to your progress.</p>
        </div>
      </div>
      <WorkoutState>
        <StatsCards workouts={workouts} />
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>This week</h2>
              <p>
                {formatDate(days[0].date)} – {formatDate(days[6].date)} · Monday
                to Sunday
              </p>
            </div>
            <span className="pill">
              {weekCount} WORKOUT{weekCount === 1 ? "" : "S"}
            </span>
          </div>
          <div
            className="weekly-chart"
            role="img"
            aria-label={`Weekly workouts: ${days.map((d) => `${d.label} ${d.workouts}`).join(", ")}`}
          >
            {days.map((day) => (
              <div className="chart-column" key={day.date}>
                <strong>{day.workouts}</strong>
                <div className="bar-track">
                  <div
                    className="chart-bar"
                    style={{ height: `${(day.workouts / max) * 100}%` }}
                  />
                </div>
                <span>{day.label}</span>
              </div>
            ))}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Workouts</th>
                  <th>Sets</th>
                  <th>Duration</th>
                  <th>Calories</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.date}>
                    <td>{d.label}</td>
                    <td>{d.workouts}</td>
                    <td>{d.sets}</td>
                    <td>
                      {d.duration.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{" "}
                      min
                    </td>
                    <td>
                      {d.calories.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{" "}
                      kcal
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </WorkoutState>
    </>
  );
}
