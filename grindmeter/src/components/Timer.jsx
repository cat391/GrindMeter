import useTimer from "./useTimer";
import "../App.css";

export default function Timer({ duration, isRunning, reset }) {
  const { hours, minutes, seconds } = useTimer(duration, isRunning, reset);

  return (
    <div>
      <h1>
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </h1>
    </div>
  );
}
