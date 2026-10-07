const API_URL = (import.meta.env.VITE_API_URL || "/backend/api").replace(/\/$/, "");
export const TOKEN_KEY = "gym-tracker-token";

export async function api(path, { method = "GET", body, signal } = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (
      response.status === 401 &&
      token &&
      token === sessionStorage.getItem(TOKEN_KEY)
    ) {
      window.dispatchEvent(new Event("gym-session-expired"));
    }
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}
