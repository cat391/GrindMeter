import "../App.css";

// Converts seconds to a string of a digital time format
export const convertToTimeStr = (org) => {
  let hours = Math.floor((org / (60 * 60)) % 24);

  let minutes = () => {
    let formattedMinutes = Math.floor((org / 60) % 60);

    if (hours === 0 && formattedMinutes === 0) {
      return "0:"; // No hours or minutes
    } else if (hours !== 0 && formattedMinutes === 0) {
      return "00:"; // Hours but no minutes
    } else {
      return String(formattedMinutes) + ":";
    }
  };

  let seconds = Math.floor(org % 60);

  return `${hours != 0 ? String(hours) + ":" : ""}${minutes()}${String(
    seconds
  ).padStart(2, "0")}`;
};

// Component for Timer "Preset" Buttons
export default function PresetButton({ presets, onClick, id }) {
  return (
    <button
      className="cursor-pointer transition-all bg-customBlack-300 text-white px-6 py-2 rounded-lg
    border-customBlack-200
    border-b-[4px] hover:brightness-105 hover:-translate-y-[0.5px] hover:border-b-[3px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[1px]
    flex justify-center"
      onClick={onClick}
    >
      {convertToTimeStr(presets[id])}
    </button>
  );
}
