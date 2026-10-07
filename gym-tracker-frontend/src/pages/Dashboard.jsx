import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../context/WorkoutContext";
import StatsCards from "../components/StatsCards";
import WorkoutTable from "../components/WorkoutTable";
import WorkoutState from "../components/WorkoutState";
import { Empty } from "../components/Status";
export default function Dashboard() {
  const { user } = useAuth();
  const { workouts } = useWorkouts();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PROGRESS AT A GLANCE</span>
          <h1>Welcome, {user.name.split(" ")[0]}.</h1>
          <p>Make today another step forward.</p>
        </div>
        <Link to="/workouts/new" className="button primary">
          + Add workout
        </Link>
      </div>
      <WorkoutState>
        <StatsCards workouts={workouts} />
        <section className="motivation">
          <div>
            <span className="eyebrow">KEEP SHOWING UP</span>
            <h2>Consistency is your strongest rep.</h2>
            <p>Record what you do. Celebrate how far you go.</p>
          </div>
          <span className="motivation-symbol" aria-hidden="true">
            ↗
          </span>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent workouts</h2>
              <p>Your latest five sessions.</p>
            </div>
            <Link to="/workouts" className="text-button">
              View history →
            </Link>
          </div>
          {workouts.length ? (
            <WorkoutTable workouts={workouts.slice(0, 5)} />
          ) : (
            <Empty />
          )}
        </section>
      </WorkoutState>
    </>
  );
}
