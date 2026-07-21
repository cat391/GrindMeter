import "../App.css";
import { usePresetContext } from "../context/PresetContext";
import { convertToTimeStr } from "../utils/time";
import PropTypes from "prop-types";

// Component for Timer "Preset" Buttons
export default function PresetButton({ onClick, id }) {
  const { presets } = usePresetContext();

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

PresetButton.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.number,
};
