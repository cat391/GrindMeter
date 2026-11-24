import { usePresetContext } from "../context/PresetContext";
import TimerInput from "./TimerInput";
import Toggle from "./Toggle";

export default function TimerSettings() {
  const { stopwatchMode, setStopwatchMode } = usePresetContext();

  return (
    <div>
      <div className="-mt-2">
        <Toggle
          name="stopwatch"
          label="Stopwatch"
          description="Count up and save the time to your category"
          checked={stopwatchMode}
          onChange={setStopwatchMode}
        />
      </div>
      {/* Stays mounted so an unsaved preset edit survives the switch */}
      <div
        hidden={stopwatchMode}
        className="mt-2 border-t border-white/[0.07] pt-5"
      >
        <TimerInput />
      </div>
    </div>
  );
}
