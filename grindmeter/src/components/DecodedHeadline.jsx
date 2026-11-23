import { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

const NOISE = "#%@*+=:;-/\\<>01";

// Timing is counted in coarse ticks so the noise steps like an old terminal
const TICK_MS = 40;
const IN_DELAY = 10;
const IN_STAGGER = 1.5;
const IN_SCRAMBLE = 9;
const IN_AFTERGLOW = 5;
const OUT_STAGGER = 0.6;
const OUT_SCRAMBLE = 4;

const inTicks = (count) =>
  IN_DELAY + (count - 1) * IN_STAGGER + IN_SCRAMBLE + IN_AFTERGLOW;
const outTicks = (count) => Math.ceil((count - 1) * OUT_STAGGER + OUT_SCRAMBLE);

function characterState(index, count, tick, leaving, reduceMotion) {
  if (reduceMotion) return leaving ? "hidden" : "locked";
  if (leaving) {
    const start = (count - 1 - index) * OUT_STAGGER;
    if (tick < start) return "locked";
    return tick < start + OUT_SCRAMBLE ? "noise" : "hidden";
  }
  const start = IN_DELAY + index * IN_STAGGER;
  if (tick < start) return "hidden";
  if (tick < start + IN_SCRAMBLE) return "noise";
  return tick < start + IN_SCRAMBLE + IN_AFTERGLOW ? "afterglow" : "locked";
}

// Derived from position and time so renders stay pure
const noiseGlyph = (index, tick) =>
  NOISE[((index + 3) * 31 + Math.floor(tick / 2) * 17 * (index + 1)) % NOISE.length];

function letterClass(state, accented) {
  if (state === "hidden" || state === "noise") return "invisible";
  if (state === "afterglow") {
    return "text-white [text-shadow:0_0_16px_rgb(35_169_70_/_0.95)]";
  }
  return `transition-[color,text-shadow] duration-500 motion-reduce:transition-none ${
    accented
      ? "text-customGreen-100 group-hover:[text-shadow:0_0_12px_rgb(35_169_70_/_0.7)]"
      : "text-white"
  }`;
}

export default function DecodedHeadline({
  text,
  accent,
  leaving = false,
  className = "",
}) {
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [tick, setTick] = useState(0);
  const characters = [...text];
  const count = characters.length;
  const accentFrom = [...text.slice(0, text.lastIndexOf(accent))].length;

  // A layout effect restarts the count before the exit's first frame paints
  useLayoutEffect(() => {
    if (reduceMotion) return undefined;
    setTick(0);
    let current = 0;
    const lastTick = leaving ? outTicks(count) : inTicks(count);
    const timer = setInterval(() => {
      current += 1;
      setTick(current);
      if (current >= lastTick) clearInterval(timer);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [count, leaving, reduceMotion]);

  const settled = !leaving && (reduceMotion || tick >= inTicks(count));

  return (
    <span
      aria-hidden="true"
      className={`block whitespace-pre-wrap font-normal [overflow-wrap:anywhere] ${className} ${
        settled ? "animate-phosphor motion-reduce:animate-none" : ""
      }`}
    >
      {characters.map((character, index) => {
        const state = characterState(index, count, tick, leaving, reduceMotion);
        return (
          <span key={index} className="relative">
            <span className={letterClass(state, index >= accentFrom)}>
              {character}
            </span>
            {state === "noise" && character !== " " && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[0.68em] text-customGreen-100/80">
                {noiseGlyph(index, tick)}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

DecodedHeadline.propTypes = {
  text: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
  leaving: PropTypes.bool,
  className: PropTypes.string,
};
