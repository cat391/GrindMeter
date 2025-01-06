import useTimer from "./useTimer";

export default function Timer({ duration, isRunning }) {
  const { hours, minutes, seconds } = useTimer(duration, isRunning);

  return (
    <div>
      <h1>
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </h1>
    </div>
  );
}
