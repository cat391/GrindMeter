import { NavLink, Outlet } from "react-router-dom";
import "../App.css";
import { useState } from "react";
import SettingsModal from "../components/SettingsModal";
import { useAmbienceContext } from "../context/PresetContext";

export default function RootLayout() {
  const [open, setOpen] = useState(false);
  const { visualAmbience, timerRunning } = useAmbienceContext();
  // The color fades at the same speed as the page background
  const linkClass = `font-semibold transition-[color,opacity,filter] duration-[1000ms,150ms,150ms] ease-in-out motion-reduce:transition-none ${
    visualAmbience && timerRunning
      ? "text-customBlack-300 hover:brightness-150"
      : "text-customGreen-100 hover:opacity-60"
  }`;

  return (
    <div>
      {/* Only the links catch the mouse, so the page stays interactive around them */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 h-14 text-white">
        <section className="h-full flex justify-between items-center">
          <nav className="pointer-events-auto space-x-8 text-lg mx-auto [text-shadow:0_1px_10px_rgb(0_0_0_/_0.9)]">
            <NavLink className={linkClass} to="/">
              Timer
            </NavLink>
            <NavLink className={linkClass} to="profile">
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
