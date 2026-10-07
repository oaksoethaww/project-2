import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkoutProvider } from "./context/WorkoutContext";
import Layout from "./components/Layout";
import { ErrorMessage } from "./components/Status";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkoutForm from "./pages/WorkoutForm";
import WorkoutHistory from "./pages/WorkoutHistory";
import Statistics from "./pages/Statistics";
function Protected() {
  const { user, token, loading, error, retry, logout } = useAuth();
  if (loading)
    return (
      <div className="session-screen" role="status">
        Restoring your session…
      </div>
    );
  if (!token) return <Navigate to="/login" replace />;
  if (!user)
    return (
      <div className="session-screen">
        <ErrorMessage>
          {error || "Could not restore your session."}
        </ErrorMessage>
        <button className="button primary" onClick={retry}>
          Try again
        </button>
        <button className="button secondary" onClick={() => logout()}>
          Back to login
        </button>
      </div>
    );
  return (
    <WorkoutProvider>
      <Layout />
    </WorkoutProvider>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts/new" element={<WorkoutForm />} />
            <Route path="/workouts" element={<WorkoutHistory />} />
            <Route path="/workouts/:id/edit" element={<WorkoutForm />} />
            <Route path="/statistics" element={<Statistics />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="session-screen">
                <h1>Page not found</h1>
                <Link to="/dashboard">Go to dashboard</Link>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
