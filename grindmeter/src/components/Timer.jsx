import useTimer from "./useTimer";
import "../App.css";

export default function Timer({ duration, isRunning, reset }) {
  const { hours, minutes, seconds, state } = useTimer(
    duration,
    isRunning,
    reset
  );

  return (
    <div
      className={
        state
          ? "flex items-center justify-center h-96 w-full text-8xl font-bold text-red-700"
          : "flex items-center justify-center h-96 w-full text-8xl font-bold text-customBlack-400"
      }
    >
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
}
