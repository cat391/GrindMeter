import { NavLink, Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div>
      <header>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="settings">Settings</NavLink>
          <NavLink to="login">Login</NavLink>
        </nav>
      </header>
      <hr></hr>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
