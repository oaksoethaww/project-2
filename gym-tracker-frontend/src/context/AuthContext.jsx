import { createContext, useContext, useEffect, useState } from "react";
import { api, TOKEN_KEY } from "../services/api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  function logout(message = "") {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
    setError(message);
  }
  useEffect(() => {
    const expire = () => logout("Your session expired. Please log in again.");
    window.addEventListener("gym-session-expired", expire);
    return () => window.removeEventListener("gym-session-expired", expire);
  }, []);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api("/auth/me", { signal: controller.signal })
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err.name !== "AbortError" && !controller.signal.aborted)
          setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, retry]);
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      const remaining = payload.exp * 1000 - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) {
        logout("Your session expired. Please log in again.");
        return;
      }
      const timer = setTimeout(
        () => logout("Your session expired. Please log in again."),
        Math.min(remaining, 2147483647),
      );
      return () => clearTimeout(timer);
    } catch {
      logout("Please log in again.");
    }
  }, [token]);

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    setError("");
    setUser(data.user);
    setToken(data.token);
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        retry: () => setRetry((n) => n + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
