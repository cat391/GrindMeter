import "../App.css";

export default function PresetButton({ presets, onClick, id }) {
  const convertToTimeStr = (org) => {
    let hours = Math.floor((org / (60 * 60)) % 24);
    let minutes = Math.floor((org / 60) % 60);
    let seconds = Math.floor(org % 60);

    return `${hours != 0 ? String(hours) + ":" : ""}${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <button className="preset-button" onClick={onClick}>
      {convertToTimeStr(presets[id])}
    </button>
  );
}
