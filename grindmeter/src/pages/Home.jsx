import { useState, useEffect, useRef } from "react";
import Timer from "../components/Timer";
import PresetButton from "../components/PresetButton";
import "../App.css";
import { BiPause, BiReset, BiPlay } from "react-icons/bi";
import { usePresetContext } from "../components/PresetContext";

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const { presets, setPresets, currentPreset, setCurrentPreset } =
    usePresetContext();
  const [displayedTime, setDisplayedTime] = useState(0);
  const [shouldReset, setShouldReset] = useState(0);
  const oldPresets = useRef(presets);

  const handleTimerChange = (id) => {
    setDisplayedTime(id);
    setIsOn(false);
  };

  const toggleTimer = () => setIsOn((prev) => (prev ? false : true));

  const resetTimer = () => {
    setShouldReset((prev) => prev + 1);
    setIsOn(false);
  };

  useEffect(() => {
    let shouldResetTimer = false;
    presets.forEach((element, index) => {
      // Finds the index of the preset that changed, and compares that index to the current preset being used
      if (element !== oldPresets.current[index] && index === displayedTime) {
        // console.log(element, index, displayedTime);
        shouldResetTimer = true; // Must reset displayed timer, as it was changed
      }
    });

    if (shouldResetTimer) {
      console.log("TS RAN PMO");
      resetTimer();
    }
    oldPresets.current = presets;
  }, [presets]); // Causes error if you change another preset than the one you are on

  return (
    <div>
      <h2>
        <Timer
          durationID={displayedTime}
          isRunning={isOn}
          reset={shouldReset}
        />
      </h2>
      <div className="flex space-x-4 justify-center items-center h-50">
        {[0, 1, 2].map((id) => {
          return (
            <PresetButton
              presets={presets}
              key={id}
              id={id}
              onClick={() => handleTimerChange(id)}
            />
          );
        })}
      </div>
      <div className="flex space-x-4 justify-center items-center h-40">
        <button
          className="cursor-pointer transition-all bg-customGreen-100 text-white px-6 py-2 rounded-lg
    border-customGreen-200
    border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-3xl"
          onClick={toggleTimer}
        >
          {isOn ? <BiPause /> : <BiPlay />}
        </button>
        <button
          className="cursor-pointer transition-all bg-customGreen-100 text-white px-6 py-2 rounded-lg
    border-customGreen-200
    border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-3xl"
          onClick={resetTimer}
        >
          <BiReset />
        </button>
      </div>
    </div>
  );
}
