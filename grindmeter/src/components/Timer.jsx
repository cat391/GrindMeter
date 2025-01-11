import useTimer from "./useTimer";
import "../App.css";

export default function Timer({ duration, isRunning, reset }) {
  const { hours, minutes, seconds, state } = useTimer(
    duration,
    isRunning,
    reset
  );

  return (
    <div className={state ? "timer-stopped" : "timer"}>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
}
