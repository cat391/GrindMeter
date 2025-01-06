import { useState } from "react";
import Timer from "../components/Timer";
import PresetButton from "../components/PresetButton";

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const [presets, setPresets] = useState([10, 2700, 3600]);
  const [displayedTime, setDisplayedTime] = useState(presets[0]);
  const [shouldReset, setShouldReset] = useState(0);

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
      <button onClick={toggleTimer}>Stop/Go</button>
      <button onClick={resetTimer}>Reset</button>
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
  );
}
