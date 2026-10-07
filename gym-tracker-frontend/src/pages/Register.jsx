import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { ErrorMessage } from "../components/Status";
export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        },
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="register-page">
      <Link className="brand" to="/login">
        <span className="brand-icon">G</span>
        <span>Gym Tracker</span>
      </Link>
      <form className="auth-form register-form" onSubmit={submit}>
        <span className="eyebrow">START YOUR JOURNEY</span>
        <h1>Create your account</h1>
        <p>A simple space for your hard work.</p>
        <ErrorMessage>{error}</ErrorMessage>
        <label>
          Name
          <input name="name" autoComplete="name" required maxLength={80} />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            aria-describedby="password-help"
            required
            minLength={8}
          />
        </label>
        <p id="password-help" className="field-help">
          At least 8 characters; maximum 72 bytes.
        </p>
        <label>
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
        <button className="button primary full-width" disabled={busy}>
          {busy ? "Creating account…" : "Create account →"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
