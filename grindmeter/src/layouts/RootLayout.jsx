import { NavLink, Outlet } from "react-router-dom";
import "../App.css";
import { useState } from "react";
import SettingsModal from "../components/SettingsModal";

export default function RootLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Only the links catch the mouse, so the page stays interactive around them */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 h-14 text-white">
        <section className="h-full flex justify-between items-center">
          <nav className="pointer-events-auto space-x-8 text-lg mx-auto [text-shadow:0_1px_10px_rgb(0_0_0_/_0.9)]">
            <NavLink
              className="hover:opacity-60 transition-opacity ease-in text-customGreen-100 font-semibold"
              to="/"
            >
              Home
            </NavLink>
            <NavLink
              className="hover:opacity-60 transition-opacity ease-linear text-customGreen-100 font-semibold"
              to="profile"
            >
              Profile
            </NavLink>
          </nav>
        </section>
      </header>

      <main>
        {/* Lives in the layout so ambience settings survive page changes */}
        <SettingsModal open={open} onClose={() => setOpen(false)} />
        <Outlet context={{ openSettings: () => setOpen(true) }} />
      </main>
    </div>
  );
}
