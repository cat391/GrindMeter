import { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

const CHARACTERS = [..."Start your grind."];
const GREEN_FROM = CHARACTERS.indexOf("g");
const COUNT = CHARACTERS.length;
const NOISE = "#%@*+=:;-/\\<>01";

// Timing is counted in coarse ticks so the noise steps like an old terminal
const TICK_MS = 40;
const IN_DELAY = 10;
const IN_STAGGER = 1.5;
const IN_SCRAMBLE = 9;
const IN_AFTERGLOW = 5;
const IN_TICKS = IN_DELAY + (COUNT - 1) * IN_STAGGER + IN_SCRAMBLE + IN_AFTERGLOW;
const OUT_STAGGER = 0.6;
const OUT_SCRAMBLE = 4;
const OUT_TICKS = Math.ceil((COUNT - 1) * OUT_STAGGER + OUT_SCRAMBLE);

function characterState(index, tick, leaving, reduceMotion) {
  if (reduceMotion) return leaving ? "hidden" : "locked";
  if (leaving) {
    const start = (COUNT - 1 - index) * OUT_STAGGER;
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

function letterClass(state, green) {
  if (state === "hidden" || state === "noise") return "invisible";
  if (state === "afterglow") {
    return "text-white [text-shadow:0_0_16px_rgb(35_169_70_/_0.95)]";
  }
  return `transition-[color,text-shadow] duration-500 motion-reduce:transition-none ${
    green
      ? "text-customGreen-100 group-hover:[text-shadow:0_0_12px_rgb(35_169_70_/_0.7)]"
      : "text-white"
  }`;
}

export default function DecodedHeadline({ leaving }) {
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [tick, setTick] = useState(0);

  // A layout effect restarts the count before the exit's first frame paints
  useLayoutEffect(() => {
    if (reduceMotion) return undefined;
    setTick(0);
    let current = 0;
    const lastTick = leaving ? OUT_TICKS : IN_TICKS;
    const timer = setInterval(() => {
      current += 1;
      setTick(current);
      if (current >= lastTick) clearInterval(timer);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [leaving, reduceMotion]);

  const settled = !leaving && (reduceMotion || tick >= IN_TICKS);

  return (
    <span
      aria-hidden="true"
      className={`block whitespace-pre text-4xl font-normal sm:text-6xl ${
        settled ? "animate-phosphor motion-reduce:animate-none" : ""
      }`}
    >
      {CHARACTERS.map((character, index) => {
        const state = characterState(index, tick, leaving, reduceMotion);
        return (
          <span key={index} className="relative">
            <span className={letterClass(state, index >= GREEN_FROM)}>
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
  leaving: PropTypes.bool.isRequired,
};
