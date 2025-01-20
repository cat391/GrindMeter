import { IoSettingsOutline } from "react-icons/io5";
import { convertToTimeStr } from "./PresetButton";
import { useState } from "react";
import { usePresetContext } from "./PresetContext";
import TimerInput from "./TimerInput";

function SettingsModal({ open, onClose }) {
  const { presets, setPresets } = usePresetContext();
  const [p1, setP1] = useState(convertToTimeStr(presets[0]));

  const handleChange = (event) => {
    setP1(event.target.value);
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center transition-colors ${
        open ? "visible bg-black/40" : "invisible"
      }`}
    >
      <div className="bg-customBlack-100 p-6 rounded-xl shadow-md border-2 border-customGreen-300 w-80">
        <div className="flex justify-center mb-4 ">
          <IoSettingsOutline size={30} className="text-customGreen-100" />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-customGreen-100 block font-medium">
              Custom Presets
            </h2>

            <TimerInput value={"00:10:00"} />
            {/* 
            <input
              type="text"
              value={p1}
              onChange={handleChange}
              placeholder="00:00:00"
            /> */}
            <div className="flex justify-center gap-2 m-3">
              <button className="border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md">
                Preset 1
              </button>
              <button className="border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md">
                Preset 2
              </button>
              <button className="border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md">
                Preset 3
              </button>
            </div>
          </div>
        </div>

        <hr className="my-4"></hr>
        <button
          onClick={onClose}
          className="border-2 border-customGreen-300 text-customGreen-200 p-2 rounded-md transition duration-300 ease-in-out transform hover:text-customGreen-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
