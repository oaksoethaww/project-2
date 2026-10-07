import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard">
          <span className="brand-icon">G</span>
          <span>
            Gym Tracker<small>WORKOUT JOURNAL</small>
          </span>
        </Link>
        <div className="nav-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {[
            ["/dashboard", "◫", "Dashboard"],
            ["/workouts/new", "+", "Add workout"],
            ["/workouts", "≡", "Workout history"],
            ["/statistics", "↗", "Statistics"],
          ].map(([path, icon, label]) => (
            <NavLink key={path} to={path} end>
              <span aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-profile">
            <span className="avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="logout" onClick={() => logout()}>
            Log out <span aria-hidden="true">↪</span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>Build consistency. Track progress.</span>
          <span className="topbar-badge">Your workout journal</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer>Gym Workout Tracker · Every workout counts.</footer>
      </div>
    </div>
  );
}
