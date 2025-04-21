import { IoSettingsOutline } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import { usePresetContext } from "../context/PresetContext";
import TimerInput from "./TimerInput";
import VolumeSlider from "./VolumeSlider";
import AddCategoryField from "./AddCategoryField";
import { UserAuth } from "../context/AuthContext";
import { ModifyCategoryField } from "./ModifyCategoryField";
import DeleteCategoryField from "./DeleteCategoryField";
import { useState } from "react";
import { useAmbienceContext } from "../context/PresetContext";

function SettingsModal({ open, onClose }) {
  const { presets, setPresets, currentPreset, setCurrentPreset } =
    usePresetContext();
  const { visualAmbience, setVisualAmbience } = useAmbienceContext();
  const { googleSignIn, user, logOut } = UserAuth();
  const [ambienceIsOn, setAmbienceIsOn] = useState(false);

  let lastUsedIndex = 0;

  const handleClick = (e) => {
    setCurrentPreset(presets[e.target.id]);
    lastUsedIndex = e.target.id;
  };

  const handleClose = () => {
    setCurrentPreset(presets[lastUsedIndex]);
    onClose();
  };

  const handleChange = (e) => {
    switch (e.target.name) {
      case "ambienceOn":
        setAmbienceIsOn(e.target.checked);
        if (!e.target.checked) {
          setVisualAmbience(false);
        }
        break;
      case "visualChange":
        setVisualAmbience(e.target.checked);
        break;
      default:
        console.log(e.target.name);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center transition-colors ${
        open ? "visible bg-black/40" : "invisible"
      }`}
      onClick={onClose}
    >
      <div
        className="bg-customBlack-100 rounded-xl shadow-md border-2 border-customGreen-300 w-80 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-2">
          <div className="flex justify-center mb-2">
            <IoSettingsOutline size={30} className="text-customGreen-100" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 custom-scrollbar">
          <div className="space-y-5">
            <section>
              <h2 className="text-customGreen-100 font-medium mb-3">
                Custom Presets
              </h2>

              <TimerInput />

              <div className="flex justify-center gap-2 my-3">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    id={index}
                    className={`
                      border-2 border-customGreen-300 text-customGreen-100 text-sm py-1 px-3 rounded-md
                      transition duration-100 ease-in-out transform
                      ${
                        presets.indexOf(currentPreset) !== index
                          ? "opacity-45 hover:opacity-75"
                          : "opacity-100"
                      }
                    `}
                    onClick={handleClick}
                  >
                    Preset {index + 1}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-customGreen-100 font-medium mb-2">
                Ringtone
              </h2>
              <VolumeSlider />
            </section>
            <section className="mb-5">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-customGreen-100 font-medium">Ambience</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    name="ambienceOn"
                    onChange={handleChange}
                  />
                  <div
                    className="
        bg-customBlack-100 rounded-full w-8 h-4 ring-2 ring-customGreen-300 duration-300
        after:bg-customGreen-300 after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:rounded-full after:duration-300
        peer-checked:after:translate-x-4 peer-checked:after:bg-customGreen-100 peer-checked:ring-customGreen-100
        hover:after:scale-95
      "
                  ></div>
                </label>
              </div>

              {ambienceIsOn ? (
                <div className="text-customGreen-200 text-sm">
                  <h3>Visual Change</h3>
                  <input
                    name="visualChange"
                    type="checkbox"
                    onChange={handleChange}
                  />
                  <h3>Brown Noise</h3>
                  <input type="checkbox" />
                  <h3>Rain Noise</h3>
                  <input type="checkbox" />
                </div>
              ) : (
                <div></div>
              )}
            </section>

            <section>
              <h2 className="text-customGreen-100 font-medium mb-3">
                {user ? (
                  "Work Categories"
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Work Categories</span>
                    <IoIosLock className="w-5 h-5" />
                  </div>
                )}
              </h2>

              {user ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-customGreen-200 font-medium text-sm mb-2">
                      Add Category
                    </h3>
                    <div className="flex justify-center">
                      <AddCategoryField />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-customGreen-200 font-medium text-sm opacity-70 mb-2">
                      Modify Category
                    </h3>
                    <div>
                      <ModifyCategoryField />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-customGreen-200 font-medium text-sm opacity-70 mb-2">
                      Delete Category
                    </h3>
                    <div>
                      <DeleteCategoryField />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-customBlack-200/50 p-3 rounded-md">
                  <p className="text-customGreen-200 text-center text-sm">
                    Must be logged in to use this feature.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-5 pb-5 pt-2 mt-auto">
          <hr className="border-customGreen-300/20 mb-4" />
          <button
            onClick={handleClose}
            className="w-full border-2 border-customGreen-300 text-customGreen-200 p-2 rounded-md 
                     transition duration-300 ease-in-out transform hover:text-customGreen-100 hover:bg-customGreen-300/10"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(26, 95, 73, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

export default SettingsModal;
