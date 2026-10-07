import { Link } from "react-router-dom";
import { formatDate } from "../services/statistics";
export default function WorkoutTable({ workouts, onDelete }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Date</th>
            <th>Sets × reps</th>
            <th>Weight</th>
            <th>Duration</th>
            <th>Calories</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {workouts.map((workout) => (
            <tr key={workout._id}>
              <td>
                <strong>{workout.exercise}</strong>
                <span
                  className={`category category-${workout.category.toLowerCase()}`}
                >
                  {workout.category}
                </span>
              </td>
              <td>{formatDate(workout.date)}</td>
              <td>
                {workout.sets} × {workout.reps}
              </td>
              <td>{workout.weight} kg</td>
              <td>{workout.duration} min</td>
              <td>{workout.calories} kcal</td>
              {onDelete && (
                <td className="table-actions">
                  <Link
                    to={`/workouts/${workout._id}/edit`}
                    className="text-button"
                    aria-label={`Edit ${workout.exercise}`}
                  >
                    Edit
                  </Link>
                  <button
                    className="text-button danger"
                    onClick={() => onDelete(workout)}
                    aria-label={`Delete ${workout.exercise}`}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
