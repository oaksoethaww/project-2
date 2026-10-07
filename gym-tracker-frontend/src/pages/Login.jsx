import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage } from "../components/Status";
export default function Login() {
  const { user, loading, login, error: sessionError } = useAuth();
  const location = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user && !loading) return <Navigate to="/dashboard" replace />;
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await login(form.get("email"), form.get("password"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-intro">
        <Link className="brand" to="/login">
          <span className="brand-icon">G</span>
          <span>Gym Tracker</span>
        </Link>
        <div>
          <span className="eyebrow">ONE WORKOUT AT A TIME</span>
          <h1>
            Small steps.
            <br />
            Stronger you.
          </h1>
          <p>Keep your workouts in one place and see the effort add up.</p>
          <div className="auth-art" aria-hidden="true">
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
        <small>Your progress, at your pace.</small>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Log in to your journal</h2>
          <p>Pick up where you left off.</p>
          {location.state?.registered && (
            <div className="alert success" role="status">
              Account created. Log in to get started.
            </div>
          )}
          <ErrorMessage>{error || sessionError}</ErrorMessage>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button
            className="button primary full-width"
            disabled={busy || loading}
          >
            {busy || loading ? "Logging in…" : "Log in →"}
          </button>
          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
