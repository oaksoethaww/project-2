import { useWorkouts } from "../context/WorkoutContext";
import { Loading, ErrorMessage } from "./Status";
export default function WorkoutState({ children }) {
  const { loading, error, retry } = useWorkouts();
  if (loading) return <Loading />;
  if (error)
    return (
      <div>
        <ErrorMessage>{error}</ErrorMessage>
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      </div>
    );
  return children;
}
