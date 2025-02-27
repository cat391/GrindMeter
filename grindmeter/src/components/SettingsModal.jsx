import { IoSettingsOutline } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import { usePresetContext } from "../context/PresetContext";
import TimerInput from "./TimerInput";
import VolumeSlider from "./VolumeSlider";
import AddCategoryField from "./AddCategoryField";
import { UserAuth } from "../context/AuthContext";
import { ModifyCategoryField } from "./ModifyCategoryField";

function SettingsModal({ open, onClose }) {
  const { presets, setPresets, currentPreset, setCurrentPreset } =
    usePresetContext();

  const { googleSignIn, user, logOut } = UserAuth();

  let lastUsedIndex = 0;

  const handleClick = (e) => {
    setCurrentPreset(presets[e.target.id]);
    lastUsedIndex = e.target.id;
  };

  const handleClose = () => {
    setCurrentPreset(presets[lastUsedIndex]);
    onClose();
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

            <TimerInput />

            <div className="flex justify-center gap-2 m-3">
              <button
                id="0"
                className={
                  presets.indexOf(currentPreset) !== 0
                    ? "border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md opacity-45 transition duration-100 ease-in-out transform hover:opacity-75"
                    : "border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md opacity-100"
                }
                onClick={handleClick}
              >
                Preset 1
              </button>
              <button
                id="1"
                className={
                  presets.indexOf(currentPreset) !== 1
                    ? "border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md opacity-45 transition duration-100 ease-in-out transform hover:opacity-75"
                    : "border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md opacity-100"
                }
                onClick={handleClick}
              >
                Preset 2
              </button>
              <button
                id="2"
                className={
                  presets.indexOf(currentPreset) !== 2
                    ? "border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md opacity-45 transition duration-100 ease-in-out transform hover:opacity-75"
                    : "border-2 border-customGreen-300 text-customGreen-100 text-sm p-1 rounded-md opacity-100"
                }
                onClick={handleClick}
              >
                Preset 3
              </button>
            </div>
            <h2 className="text-customGreen-100 block font-medium">Ringtone</h2>
            <VolumeSlider />

            <h2 className="text-customGreen-100 block font-medium h-10">
              {user ? (
                <p>Work Categories</p>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <span>Work Categories</span>
                    <IoIosLock className="w-5 h-5" />
                  </div>
                </>
              )}
            </h2>
            <div>
              {user ? (
                <>
                  <h3 className="text-customGreen-200 block font-medium text-sm ">
                    Add Category
                  </h3>
                  <div>
                    <AddCategoryField />
                  </div>
                  <h3 className="text-customGreen-200 block font-medium text-sm opacity-70">
                    Modify Category
                  </h3>
                  <div>
                    <ModifyCategoryField />
                  </div>
                  <h3 className="text-customGreen-200 block font-medium text-sm opacity-70">
                    Delete Category
                  </h3>{" "}
                </>
              ) : (
                <p className="text-customGreen-200 text-center text-sm">
                  Must be logged in to use this feature.
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-4"></hr>
        <button
          onClick={handleClose}
          className="border-2 border-customGreen-300 text-customGreen-200 p-2 rounded-md transition duration-300 ease-in-out transform hover:text-customGreen-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
