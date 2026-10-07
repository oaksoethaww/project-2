import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWorkouts } from "../context/WorkoutContext";
import WorkoutTable from "../components/WorkoutTable";
import WorkoutState from "../components/WorkoutState";
import { Empty, ErrorMessage } from "../components/Status";
export default function WorkoutHistory() {
  const { workouts, deleteWorkout } = useWorkouts();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const filtered = workouts.filter(
    (w) =>
      w.exercise.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || w.category === category),
  );
  async function confirmDelete() {
    setBusy(true);
    setError("");
    try {
      await deleteWorkout(deleting._id);
      setDeleting(null);
      setMessage("Workout deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR EFFORT, RECORDED</span>
          <h1>Workout history</h1>
          <p>Look back, make changes, and keep moving.</p>
        </div>
        <Link className="button primary" to="/workouts/new">
          + Add workout
        </Link>
      </div>
      <WorkoutState>
        {message && (
          <div className="alert success" role="status">
            {message}
          </div>
        )}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                All workouts <span className="count">{workouts.length}</span>
              </h2>
              <p>Most recent workout dates first.</p>
            </div>
          </div>
          <div className="filters">
            <label>
              Search exercises
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a workout…"
              />
            </label>
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["All", "Strength", "Cardio", "Flexibility", "Other"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </label>
          </div>
          {filtered.length ? (
            <WorkoutTable
              workouts={filtered}
              onDelete={(w) => {
                setDeleting(w);
                setError("");
              }}
            />
          ) : (
            <Empty
              title={workouts.length ? "No matching workouts." : undefined}
            >
              {workouts.length
                ? "Try a different search or category."
                : undefined}
            </Empty>
          )}
        </section>
      </WorkoutState>
      {deleting && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">Delete this workout?</h2>
            <p>
              “{deleting.exercise}” will be permanently removed from your
              journal.
            </p>
            <ErrorMessage>{error}</ErrorMessage>
            <div className="form-actions">
              <button
                autoFocus
                className="button secondary"
                disabled={busy}
                onClick={() => setDeleting(null)}
              >
                Keep workout
              </button>
              <button
                className="button destructive"
                disabled={busy}
                onClick={confirmDelete}
              >
                {busy ? "Deleting…" : "Delete workout"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
