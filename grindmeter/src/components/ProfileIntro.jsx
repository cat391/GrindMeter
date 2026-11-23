import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AsciiClock from "./AsciiClock";
import DecodedHeadline from "./DecodedHeadline";

const EXIT_MS = 620;
const DISMISSED_POPUP_ERRORS = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export default function ProfileIntro({ onSignIn, onExited }) {
  const [phase, setPhase] = useState("idle");
  const [lifted, setLifted] = useState(false);
  const [failed, setFailed] = useState(false);
  const exitTimer = useRef(null);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  const handleStart = async () => {
    if (phase !== "idle") return;
    setFailed(false);
    setPhase("pending");
    try {
      await onSignIn();
      setPhase("leaving");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      exitTimer.current = setTimeout(onExited, reduceMotion ? 0 : EXIT_MS);
    } catch (error) {
      setPhase("idle");
      if (!DISMISSED_POPUP_ERRORS.has(error?.code)) {
        console.error("Google sign-in failed", error);
        setFailed(true);
      }
    }
  };

  const leaving = phase === "leaving";
  // Only a failure is shown; the other states are announced to screen readers
  const status = leaving
    ? "Signed in"
    : phase === "pending"
    ? "Waiting for Google"
    : failed
    ? "Couldn't sign in. Try again."
    : "";

  return (
    <div className="pointer-events-none relative z-10 flex flex-col items-center text-white">
      <button
        type="button"
        onClick={handleStart}
        onPointerEnter={() => setLifted(true)}
        onPointerLeave={() => setLifted(false)}
        onFocus={() => setLifted(true)}
        onBlur={() => setLifted(false)}
        aria-busy={phase === "pending"}
        aria-label="Start your grind. Sign in with Google"
        className="group pointer-events-auto flex cursor-pointer flex-col items-center gap-3 rounded-2xl bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-customGreen-100 focus-visible:ring-offset-8 focus-visible:ring-offset-customBlack-500"
      >
        <AsciiClock phase={phase} lifted={lifted} />
        <DecodedHeadline leaving={leaving} />
      </button>
      <p
        role="status"
        className={
          failed
            ? "absolute top-full mt-4 whitespace-nowrap text-sm text-red-400"
            : "sr-only"
        }
      >
        {status}
      </p>
    </div>
  );
}

ProfileIntro.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  onExited: PropTypes.func.isRequired,
};
