import useTimer from "./useTimer";
import "../App.css";

// Maybe combine this one and the other???
const convertToTimeStrV2 = (org) => {
  {
    let hours = Math.floor((org / (60 * 60)) % 24);
    let minutes = Math.floor((org / 60) % 60);
    let seconds = Math.floor(org % 60);

    return `${hours != 0 ? String(hours) + ":" : ""}${
      minutes != 0 ? String(minutes) + ":" : ""
    }${seconds === 0 && minutes ? "00" : seconds}`;
  }
};

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
      {convertToTimeStrV2(totalSeconds)}
    </div>
  );
}
