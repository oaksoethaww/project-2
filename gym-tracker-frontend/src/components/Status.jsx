export function ErrorMessage({ children }) {
  return children ? (
    <div className="alert error" role="alert">
      {children}
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Loading your workouts…
    </div>
  );
}
export function Empty({ title = "Your first workout starts here.", children }) {
  return (
    <div className="empty">
      <span className="empty-icon" aria-hidden="true">
        ↗
      </span>
      <h3>{title}</h3>
      <p>{children || "Log a workout to start building your history."}</p>
    </div>
  );
}
