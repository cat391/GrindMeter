import { useState, useEffect } from "react";
import { usePresetContext } from "./PresetContext";

export default function TimerInput() {
  // Reset the values, if closed

  // I HAVE TO MAKE IT SO THAT WHEN THE PRESETS CHANGE, IT CHANGES EVERYWHERE IN THE CODE, use USEEFFECT

  const { presets, setPresets, currentPreset, setCurrentPreset } =
    usePresetContext();

  const [hour, setHour] = useState(
    Math.floor((currentPreset / (60 * 60)) % 24)
  );
  const [minute, setMinute] = useState(Math.floor((currentPreset / 60) % 60));
  const [second, setSecond] = useState(currentPreset % 60);

  const handleChange = (e) => {
    const input = e.target.value;
    const id = e.target.id;

    if (!/^\d*$/.test(input)) return; // Break if not number

    if (id === "hour" && Number(input) < 24) {
      setHour(Number(input));
    } else if (id === "minute" && Number(input < 60)) {
      setMinute(Number(input));
    } else if (Number(input < 60)) {
      setSecond(Number(input));
    }
  };

  const handleSave = () => {
    const currentPresetIndex = presets.indexOf(currentPreset);

    console.log("ran");
    setPresets((prevPresets) => {
      return prevPresets.map((preset, index) =>
        index === currentPresetIndex
          ? hour * 3600 + minute * 60 + second
          : preset
      );
    });
  };

  useEffect(() => {
    setHour(Math.floor((currentPreset / (60 * 60)) % 24));
    setMinute(Math.floor((currentPreset / 60) % 60));
    setSecond(currentPreset % 60);
  }, [currentPreset]);

  return (
    <div>
      <div className="flex gap-2 text-white justify-center m-2">
        <input
          type="type"
          id="hour"
          value={hour}
          className=" w-10 text-white bg-customBlack-300 text-center"
          placeholder="h"
          onChange={handleChange}
          autoComplete="off"
        />
        :
        <input
          type="type"
          id="minute"
          value={minute}
          placeholder="m"
          className="w-10 text-white bg-customBlack-300 text-center"
          onChange={handleChange}
          autoComplete="off"
        />
        :
        <input
          type="type"
          id="second"
          value={second}
          placeholder="s"
          className="w-10 text-white bg-customBlack-300 text-center"
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      <div className="flex justify-center text-center text-customGreen-100 m-5">
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
