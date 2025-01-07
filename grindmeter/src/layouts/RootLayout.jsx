import { NavLink, Outlet } from "react-router-dom";
import "../App.css";

export default function RootLayout() {
  return (
    <div>
      <header>
        <nav className="nav">
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "link")}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "link")}
            to="settings"
          >
            Settings
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "link")}
            to="login"
          >
            Login
          </NavLink>
        </nav>
      </header>
      <hr></hr>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
