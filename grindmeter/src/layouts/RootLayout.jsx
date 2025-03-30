import { NavLink, Outlet } from "react-router-dom";
import "../App.css";
import { useState } from "react";
import SettingsModal from "../components/SettingsModal";
import { useLocation } from "react-router-dom";

export default function RootLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div>
      <header className="h-14 w-full text-white z-10">
        <section className="h-full flex justify-between items-center">
          <nav className="space-x-8 text-lg mx-auto">
            <NavLink
              className="hover:opacity-60 transition-opacity ease-in text-customGreen-100 font-semibold"
              to="/"
            >
              Home
            </NavLink>
            <button
              className="hover:opacity-60 transition-opacity ease-linear text-customGreen-100 font-semibold"
              onClick={() => {
                if (pathname !== "/profile") {
                  setOpen(true);
                }
              }}
            >
              Settings
            </button>

            <NavLink
              className="hover:opacity-60 transition-opacity ease-linear text-customGreen-100 font-semibold"
              to="profile"
            >
              Profile
            </NavLink>
          </nav>
        </section>
      </header>
      <hr className="border-customBlack-200 border-t-2"></hr>

      <main>
        <SettingsModal open={open} onClose={() => setOpen(false)} />
        <Outlet />
      </main>
    </div>
  );
}
