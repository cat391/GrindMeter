import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const DECODE_STEPS = 9;
const DECODE_STEP_MS = 34;

// Digits roll and lock from left to right whenever the value changes
function useDecodedValue(value) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return undefined;
    }
    const characters = [...value];
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step >= DECODE_STEPS) {
        clearInterval(timer);
        setShown(value);
        return;
      }
      const locked = Math.floor((step / DECODE_STEPS) * characters.length);
      setShown(
        characters
          .map((character, index) =>
            index < locked || !/\d/.test(character)
              ? character
              : String(Math.floor(Math.random() * 10))
          )
          .join("")
      );
    }, DECODE_STEP_MS);
    return () => clearInterval(timer);
  }, [value]);

  return shown;
}

export default function StatReadout({ label, value, caption, accent = false }) {
  const shown = useDecodedValue(value);

  return (
    <div className="min-w-0 bg-customBlack-500 px-6 py-5 sm:px-8">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
        {label}
      </dt>
      <dd className="mt-2">
        <span className="sr-only">{value}</span>
        <span
          aria-hidden="true"
          className={`block whitespace-nowrap font-mono text-2xl tabular-nums sm:text-3xl ${
            accent ? "text-customGreen-100" : "text-white"
          }`}
        >
          {shown}
        </span>
        <span className="mt-1 block truncate font-mono text-[11px] text-white/50">
          {caption}
        </span>
      </dd>
    </div>
  );
}

StatReadout.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
  accent: PropTypes.bool,
};
