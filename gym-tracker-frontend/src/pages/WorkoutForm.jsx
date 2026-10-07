import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWorkouts } from "../context/WorkoutContext";
import WorkoutState from "../components/WorkoutState";
import { ErrorMessage } from "../components/Status";
import { dateKey } from "../services/statistics";
const categories = ["Strength", "Cardio", "Flexibility", "Other"];
const numericFields = [
  ["sets", "Sets", "1"],
  ["reps", "Reps per set", "1"],
  ["weight", "Weight (kg)", "0.1"],
  ["duration", "Duration (minutes)", "0.1"],
  ["calories", "Calories (kcal)", "0.1"],
];
function Form({ workout, id }) {
  const [values, setValues] = useState(() =>
    workout
      ? { ...workout, date: workout.date.slice(0, 10) }
      : {
          exercise: "",
          category: "Strength",
          sets: 0,
          reps: 0,
          weight: 0,
          duration: 0,
          calories: 0,
          date: dateKey(),
        },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { saveWorkout } = useWorkouts();
  const navigate = useNavigate();
  function change(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = {
      exercise: values.exercise,
      category: values.category,
      date: values.date,
    };
    for (const [key] of numericFields) body[key] = Number(values[key]);
    try {
      await saveWorkout(body, id);
      navigate("/workouts", {
        state: { message: id ? "Workout updated." : "Workout added." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel workout-form" onSubmit={submit}>
      <div className="panel-heading">
        <div>
          <h2>Workout details</h2>
          <p>Use zero for any measurement that does not apply.</p>
        </div>
        <span className="pill">{id ? "EDIT SESSION" : "NEW SESSION"}</span>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="form-grid">
        <label className="span-two">
          Exercise
          <input
            name="exercise"
            value={values.exercise}
            onChange={change}
            required
            maxLength={120}
            placeholder="e.g. Bench press or morning run"
          />
        </label>
        <label>
          Category
          <select name="category" value={values.category} onChange={change}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            name="date"
            type="date"
            value={values.date}
            onChange={change}
            required
          />
        </label>
        {numericFields.map(([key, label, step]) => (
          <label key={key}>
            {label}
            <input
              name={key}
              type="number"
              min="0"
              max="1000000"
              step={step}
              value={values[key]}
              onChange={change}
              required
            />
          </label>
        ))}
      </div>
      <div className="form-actions">
        <Link className="button secondary" to="/workouts">
          Cancel
        </Link>
        <button className="button primary" disabled={busy}>
          {busy ? "Saving…" : id ? "Save changes" : "Save workout"}
        </button>
      </div>
    </form>
  );
}
export default function WorkoutForm() {
  const { id } = useParams();
  const { workouts } = useWorkouts();
  const workout = workouts.find((w) => w._id === id);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT COUNT</span>
          <h1>{id ? "Edit workout" : "Add a workout"}</h1>
          <p>
            {id
              ? "Keep your journal accurate."
              : "Capture today’s effort, one session at a time."}
          </p>
        </div>
      </div>
      <WorkoutState>
        {id && !workout ? (
          <section className="panel">
            <h2>Workout not found</h2>
            <Link to="/workouts">Back to history</Link>
          </section>
        ) : (
          <Form key={id || "new"} workout={workout} id={id} />
        )}
      </WorkoutState>
    </>
  );
}
