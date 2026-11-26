import { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { convertToTimeStr } from "../utils/time";

const FIELDS = [
  { key: "hours", name: "Hours", max: 23 },
  { key: "minutes", name: "Minutes", max: 59 },
  { key: "seconds", name: "Seconds", max: 59 },
];
const MINUTES_INDEX = 1;
const DIGIT_WIDTH = "1ch";
const COLON_WIDTH = "0.36em";

const pad = (value) => String(value).padStart(2, "0");

const toParts = (total) => ({
  hours: Math.floor(total / 3600) % 24,
  minutes: Math.floor(total / 60) % 60,
  seconds: Math.floor(total % 60),
});

const toSeconds = ({ hours, minutes, seconds }) =>
  Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);

// Space opens before a character fades in, and it fades out before space
// closes, so characters never need clipping and never overlap their neighbors.
const ENTER_MOTION =
  "transition-[width,opacity] duration-[260ms,180ms] delay-[0ms,110ms]";
const EXIT_MOTION =
  "transition-[width,opacity] duration-[260ms,90ms] delay-[60ms,0ms]";
const MOTION_MS = 340;

const RUNNING_GLOW =
  "[text-shadow:0_0_12px_rgb(255_255_255_/_0.16),0_0_32px_rgb(255_255_255_/_0.05)]";
const FINISHED_GLOW =
  "[text-shadow:0_0_14px_rgb(255_0_0_/_0.5),0_0_36px_rgb(255_0_0_/_0.2)]";

// A character slot that appears instantly unless `animate` is set.
function Reveal({ shown, width, animate, children }) {
  const motion = !animate ? "" : shown ? ENTER_MOTION : EXIT_MOTION;

  return (
    <span
      aria-hidden="true"
      style={{ width: shown ? width : 0 }}
      className={`inline-flex justify-center whitespace-nowrap ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${motion} ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </span>
  );
}

Reveal.propTypes = {
  shown: PropTypes.bool.isRequired,
  width: PropTypes.string.isRequired,
  animate: PropTypes.bool,
  children: PropTypes.node,
};

// The countdown and its editor are one element, so digits never jump on click.
// Without `onCommit` the time is read-only, as it is for the stopwatch.
export default function TimeDisplay({
  label = "Timer",
  seconds,
  isRunning,
  finished = false,
  glowing = false,
  onCommit,
}) {
  const [draft, setDraft] = useState(null);
  const [activeIndex, setActiveIndex] = useState(MINUTES_INDEX);
  const [invalid, setInvalid] = useState(false);
  const inputRefs = useRef([]);
  const closingRef = useRef(false);
  // Digits only animate while the editor opens or closes, never on a countdown tick
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef(null);
  const isEditing = draft !== null;

  const playEditorMotion = () => {
    setIsAnimating(true);
    clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(
      () => setIsAnimating(false),
      MOTION_MS
    );
  };

  useEffect(() => () => clearTimeout(animationTimeoutRef.current), []);

  const focusField = (index) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  useEffect(() => {
    if (isEditing) focusField(MINUTES_INDEX);
  }, [isEditing]);

  const startEditing = () => {
    const parts = toParts(seconds);
    closingRef.current = false;
    playEditorMotion();
    setInvalid(false);
    setActiveIndex(MINUTES_INDEX);
    setDraft({
      hours: pad(parts.hours),
      minutes: pad(parts.minutes),
      seconds: pad(parts.seconds),
    });
  };

  const close = () => {
    closingRef.current = true;
    playEditorMotion();
    setInvalid(false);
    setDraft(null);
  };

  const submit = ({ fromBlur = false } = {}) => {
    if (closingRef.current) return;
    const total = toSeconds(draft);
    if (total === 0) {
      if (fromBlur) close();
      else setInvalid(true);
      return;
    }
    close();
    // An unchanged time must not reset a paused countdown.
    if (total !== seconds) onCommit(total);
  };

  const setField = (key, value) => {
    setInvalid(false);
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleChange = (index, raw) => {
    const { key, max } = FIELDS[index];
    const digits = raw.replace(/\D/g, "").slice(-2);
    if (digits === "") {
      setField(key, "");
      return;
    }

    const clamped = Number(digits) > max ? String(max) : digits;
    // Move on once no further digit could make a valid value.
    const isComplete = clamped.length === 2 || Number(clamped) * 10 > max;
    setField(key, isComplete ? pad(clamped) : clamped);
    if (isComplete && index < FIELDS.length - 1) focusField(index + 1);
  };

  const step = (index, delta) => {
    const { key, max } = FIELDS[index];
    const range = max + 1;
    setField(key, pad((Number(draft[key]) + delta + range) % range));
  };

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        step(index, 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        step(index, -1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusField(Math.max(index - 1, 0));
        break;
      case "ArrowRight":
      case ":":
      case ".":
        event.preventDefault();
        focusField(Math.min(index + 1, FIELDS.length - 1));
        break;
      case "Backspace":
        if (draft[FIELDS[index].key] === "" && index > 0) {
          event.preventDefault();
          focusField(index - 1);
        }
        break;
      case "Enter":
        event.preventDefault();
        submit();
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  const handleBlur = (event) => {
    if (!isEditing) return;
    // Switching tabs or apps shouldn't end the edit.
    if (!document.hasFocus()) return;
    if (!event.currentTarget.contains(event.relatedTarget)) {
      submit({ fromBlur: true });
    }
  };

  const parts = isEditing
    ? {
        hours: Number(draft.hours),
        minutes: Number(draft.minutes),
        seconds: Number(draft.seconds),
      }
    : toParts(seconds);

  // Leading digits are hidden until editing, matching the normal time format.
  const showHours = isEditing || parts.hours > 0;
  const visibleDigits = [
    [isEditing || parts.hours >= 10, showHours],
    [isEditing || parts.hours > 0 || parts.minutes >= 10, true],
    [true, true],
  ];
  const baseColor = finished ? "text-red-700" : "text-customBlack-400";
  const canHover = Boolean(onCommit) && !isEditing && !isRunning && !finished;
  const glowClass = !glowing ? "" : finished ? FINISHED_GLOW : RUNNING_GLOW;
  const timeStr = convertToTimeStr(seconds);

  return (
    <div className="flex w-full items-center justify-center">
      <div
        className={`relative inline-flex text-[min(6rem,19vw,24dvh)] font-bold leading-none tabular-nums transition-[color,text-shadow] duration-[200ms,1000ms] motion-reduce:transition-none ${baseColor} ${glowClass} ${
          canHover ? "hover:text-white" : ""
        }`}
        onBlur={handleBlur}
        // Clicking a colon or gap shouldn't end the edit.
        onMouseDown={(event) => {
          if (isEditing && event.target.tagName !== "INPUT") {
            event.preventDefault();
          }
        }}
      >
        {FIELDS.map(({ key, name }, index) => {
          const text = pad(parts[key]);
          const isActive = isEditing && activeIndex === index;
          const fieldColor = !isEditing
            ? ""
            : invalid
            ? "text-red-500"
            : isActive
            ? "text-white"
            : "text-customBlack-300";

          return (
            <Fragment key={key}>
              <span
                className={`relative inline-flex transition-colors duration-200 ${fieldColor}`}
              >
                <Reveal
                  shown={visibleDigits[index][0]}
                  width={DIGIT_WIDTH}
                  animate={isAnimating}
                >
                  {text[0]}
                </Reveal>
                <Reveal
                  shown={visibleDigits[index][1]}
                  width={DIGIT_WIDTH}
                  animate={isAnimating}
                >
                  {text[1]}
                </Reveal>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-1 -bottom-3 h-[2px] rounded-full bg-customGreen-100 transition-[opacity,transform] duration-200 ${
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  }`}
                />
                {isEditing && (
                  <input
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    aria-label={name}
                    value={draft[key]}
                    onChange={(event) =>
                      handleChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onFocus={(event) => {
                      setActiveIndex(index);
                      event.target.select();
                    }}
                    onBlur={() =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, [key]: pad(Number(prev[key])) }
                          : prev
                      )
                    }
                    className="absolute inset-0 h-full w-full cursor-text bg-transparent text-base opacity-0 outline-none"
                  />
                )}
              </span>
              {index < FIELDS.length - 1 && (
                <Reveal
                  shown={index === 0 ? showHours : true}
                  width={COLON_WIDTH}
                  animate={isAnimating}
                >
                  <span
                    className={`transition-colors duration-200 ${
                      isEditing ? "text-customBlack-300" : ""
                    }`}
                  >
                    :
                  </span>
                </Reveal>
              )}
            </Fragment>
          );
        })}

        {!onCommit && (
          <span role="timer" className="sr-only">
            {`${label} ${timeStr}`}
          </span>
        )}
        {!isEditing && onCommit && (
          <button
            type="button"
            disabled={isRunning}
            aria-label={
              isRunning
                ? `Time remaining ${timeStr}`
                : `Edit time, currently ${timeStr}`
            }
            onClick={startEditing}
            className={`absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-customGreen-100 ${
              isRunning ? "cursor-default" : "cursor-text"
            }`}
          />
        )}
        {invalid && (
          <span role="alert" className="sr-only">
            Enter a time above zero
          </span>
        )}
      </div>
    </div>
  );
}

TimeDisplay.propTypes = {
  label: PropTypes.string,
  seconds: PropTypes.number.isRequired,
  isRunning: PropTypes.bool,
  finished: PropTypes.bool,
  glowing: PropTypes.bool,
  onCommit: PropTypes.func,
};
