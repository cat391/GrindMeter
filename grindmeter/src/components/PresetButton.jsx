import { convertToTimeStr } from "../utils/time";
import PropTypes from "prop-types";

// Component for Timer "Preset" Buttons
export default function PresetButton({ seconds, active = false, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative rounded px-1.5 py-2 text-sm tabular-nums transition-colors duration-200 after:absolute after:inset-x-1.5 after:bottom-0.5 after:h-px after:origin-center after:bg-customGreen-100 after:transition-transform after:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-customGreen-100 motion-reduce:transition-none motion-reduce:after:transition-none ${
        active
          ? "text-white after:scale-x-100"
          : "text-white/40 after:scale-x-0 hover:text-white/80"
      }`}
    >
      {convertToTimeStr(seconds)}
    </button>
  );
}

PresetButton.propTypes = {
  seconds: PropTypes.number.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
