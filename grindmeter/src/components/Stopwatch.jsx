import PropTypes from "prop-types";
import { useAmbienceContext } from "../context/PresetContext";
import TimeDisplay from "./TimeDisplay";
import useStopwatch from "./useStopwatch";

export default function Stopwatch({ isRunning, reset, onLimit }) {
  const { visualAmbience, timerRunning } = useAmbienceContext();
  const seconds = useStopwatch(isRunning, reset, onLimit);

  return (
    <TimeDisplay
      label="Stopwatch"
      seconds={seconds}
      isRunning={isRunning}
      glowing={timerRunning && visualAmbience}
    />
  );
}

Stopwatch.propTypes = {
  isRunning: PropTypes.bool,
  reset: PropTypes.number,
  onLimit: PropTypes.func.isRequired,
};
