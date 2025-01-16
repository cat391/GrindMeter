import { IoSettingsOutline } from "react-icons/io5";
import { exportedPresets } from "../pages/Home";
import { convertToTimeStr } from "./PresetButton";

function SettingsModal({ open, onClose }) {
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

            <label className="text-customGreen-100 block size text-sm font-medium">
              Preset 1
            </label>
            <input
              type="text"
              defaultValue={convertToTimeStr(exportedPresets[0])}
            />

            <label className="text-customGreen-100 block size text-sm font-medium">
              Preset 1
            </label>
            <input
              type="text"
              defaultValue={convertToTimeStr(exportedPresets[0])}
            />

            <label className="text-customGreen-100 block size text-sm font-medium">
              Preset 1
            </label>
            <input
              type="text"
              defaultValue={convertToTimeStr(exportedPresets[0])}
            />
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
