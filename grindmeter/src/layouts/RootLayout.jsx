import { NavLink, Outlet } from "react-router-dom";
import "../App.css";

export default function RootLayout() {
  return (
    <div>
      <header className="h-14 w-full text-white sticky top-0 z-10">
        <section className="h-full flex justify-between items-center">
          <nav className="space-x-8 text-lg mx-auto">
            <NavLink
              className="hover:opacity-60 transition-opacity ease-in text-customGreen-100 font-semibold"
              to="/"
            >
              Home
            </NavLink>
            <NavLink
              className="hover:opacity-60 transition-opacity ease-linear text-customGreen-100 font-semibold"
              to="settings"
            >
              Settings
            </NavLink>
            <NavLink
              className="hover:opacity-60 transition-opacity ease-linear text-customGreen-100 font-semibold"
              to="login"
            >
              Login
            </NavLink>
          </nav>
        </section>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
