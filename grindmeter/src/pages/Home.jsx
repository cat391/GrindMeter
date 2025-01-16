import { useState } from "react";
import Timer from "../components/Timer";
import PresetButton from "../components/PresetButton";
import "../App.css";
import { BiPause, BiReset, BiPlay } from "react-icons/bi";

export let exportedPresets = [0, 0, 0];

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const [presets, setPresets] = useState([2, 10, 3600]);
  const [displayedTime, setDisplayedTime] = useState(presets[0]);
  const [shouldReset, setShouldReset] = useState(0);

  exportedPresets = presets;

  const handleTimerChange = (id) => {
    setDisplayedTime(presets[id]);
    setIsOn(false);
  };

  const toggleTimer = () => setIsOn((prev) => (prev ? false : true));
  const resetTimer = () => {
    setShouldReset((prev) => prev + 1);
    setIsOn(false);
  };

  return (
    <div>
      <h2>
        <Timer duration={displayedTime} isRunning={isOn} reset={shouldReset} />
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
