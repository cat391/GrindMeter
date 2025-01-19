import useTimer from "./useTimer";
import "../App.css";

const convertToTimeStrV2 = (org) => {
  {
    let m = Math.floor((org / 60) % 60);
    let s = Math.floor(org % 60);
    let h = Math.floor((org / (60 * 60)) % 24);

    let minutes = () => {
      if (h === 0 && m === 0) {
        return ""; // No hours or minutes
      } else if (h !== 0 && m === 0) {
        return "00:"; // hours but no minutes
      } else {
        return String(m) + ":";
      }
    };

    let seconds = () => {
      if (s === 0 && (h !== 0 || m !== 0)) {
        return "00"; // No seconds with hours or minutes
      } else if (s / 10 < 1 && (h !== 0 || m !== 0)) {
        return "0" + String(s); // Single digit seconds with minutes or hours
      } else {
        return String(s);
      }
    };

    return `${h != 0 ? String(h) + ":" : ""}${minutes()}${seconds()}`;
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
