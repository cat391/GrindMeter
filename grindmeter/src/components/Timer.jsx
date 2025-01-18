import useTimer from "./useTimer";
import { convertToTimeStr } from "./PresetButton";
import "../App.css";

export default function Timer({ duration, isRunning, reset }) {
  const { state, totalSeconds } = useTimer(duration, isRunning, reset);

  return (
    <div
      className={
        state
          ? "flex items-center justify-center h-96 w-full text-8xl font-bold text-red-700"
          : "flex items-center justify-center h-96 w-full text-8xl font-bold text-customBlack-400"
      }
    >
      {convertToTimeStr(totalSeconds)}
    </div>
  );
}
