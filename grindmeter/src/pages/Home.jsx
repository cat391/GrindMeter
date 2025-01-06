import { useState } from "react";
import Timer from "../components/Timer";
import PresetButton from "../components/PresetButton";

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const [presets, setPresets] = useState([10, 2700, 3600]);
  const [displayedTime, setDisplayedTime] = useState(presets[0]);

  const handleTimerChange = (id) => {
    setDisplayedTime(presets[id]);
    setIsOn(false);
  };

  const toggleTimer = () => setIsOn((prev) => (prev ? false : true));

  return (
    <div>
      <h2>
        <Timer duration={displayedTime} isRunning={isOn} />
      </h2>
      <button onClick={toggleTimer}>Stop/Go</button>
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
