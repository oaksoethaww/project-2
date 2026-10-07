import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

const WorkoutContext = createContext(null);
export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setWorkouts([]);
    api("/workouts", { signal: controller.signal })
      .then((data) => setWorkouts(data.workouts))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user.id, retry]);
  async function saveWorkout(values, id) {
    const data = await api(id ? `/workouts/${id}` : "/workouts", {
      method: id ? "PUT" : "POST",
      body: values,
    });
    setWorkouts((current) =>
      [...current.filter((w) => w._id !== data.workout._id), data.workout].sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.createdAt.localeCompare(a.createdAt),
      ),
    );
  }
  async function deleteWorkout(id) {
    await api(`/workouts/${id}`, { method: "DELETE" });
    setWorkouts((current) => current.filter((w) => w._id !== id));
  }
  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        loading,
        error,
        retry: () => setRetry((n) => n + 1),
        saveWorkout,
        deleteWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}
export function useWorkouts() {
  return useContext(WorkoutContext);
}
