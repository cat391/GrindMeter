import { useCallback, useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import AmbienceAudio from "../components/AmbienceAudio";
import Stopwatch from "../components/Stopwatch";
import Timer from "../components/Timer";
import PresetButton from "../components/PresetButton";
import "../App.css";
import { BiCog, BiPause, BiReset, BiPlay } from "react-icons/bi";
import { usePresetContext } from "../context/PresetContext";
import CategoryComponent from "../components/CategoryComponent";
import { useAmbienceContext } from "../context/PresetContext";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";

// Hidden items keep their space, so the timer never moves when Focus view starts
const fadeWhen = (visible) =>
  `transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${
    visible ? "visible opacity-100" : "invisible opacity-0"
  }`;

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const { presets, stopwatchMode } = usePresetContext();
  // Switching modes ends the current run; each clock saves its time as it closes
  const [loadedMode, setLoadedMode] = useState(stopwatchMode);
  if (loadedMode !== stopwatchMode) {
    setLoadedMode(stopwatchMode);
    setIsOn(false);
  }
  const [displayedTime, setDisplayedTime] = useState(0);
  // A time set directly on the timer; takes priority over the selected preset
  const [customSeconds, setCustomSeconds] = useState(null);
  const [shouldReset, setShouldReset] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const oldPresets = useRef(presets);
  const { visualAmbience, setTimerRunning } = useAmbienceContext();
  const { currentCategory } = useCategoryContext();
  const { user } = UserAuth();
  const { openSettings } = useOutletContext();
  const focused = isOn && visualAmbience;

  const handleTimerChange = (id) => {
    if (id !== displayedTime || customSeconds !== null) {
      setShouldReset((prev) => prev + 1);
    }
    setDisplayedTime(id);
    setCustomSeconds(null);
    setIsOn(false);
  };

  const handleCustomTime = (seconds) => {
    setCustomSeconds(seconds);
    setShouldReset((prev) => prev + 1);
    setIsOn(false);
  };

  const stopTimer = useCallback(() => setIsOn(false), []);

  // Always returns to the selected preset, discarding any edited time
  const resetTimer = () => {
    setCustomSeconds(null);
    setShouldReset((prev) => prev + 1);
    setIsOn(false);
  };

  // Once the alarm rings, the play/pause button silences it by starting over
  const toggleTimer = () => {
    if (timerFinished && !stopwatchMode) {
      resetTimer();
    } else {
      setIsOn((prev) => !prev);
    }
  };

  useEffect(() => {
    let shouldResetTimer = false;
    presets.forEach((element, index) => {
      // Finds the index of the preset that changed, and compares that index to the current preset being used
      if (
        element !== oldPresets.current[index] &&
        index === displayedTime &&
        customSeconds === null
      ) {
        shouldResetTimer = true; // Must reset displayed timer, as it was changed
      }
    });

    if (shouldResetTimer) {
      resetTimer();
    }
    oldPresets.current = presets;
  }, [presets, displayedTime, customSeconds]); // Causes error if you change another preset than the one you are on

  // Change background is visual ambience is turned on
  useEffect(() => {
    // Update ambience context to see if timer is running
    setTimerRunning(isOn);
    if (visualAmbience && isOn) {
      const cls = "bg-black";
      document.body.classList.add(cls);
      return () => document.body.classList.remove(cls);
    } else {
      const cls = "bg-customBlack-100";
      document.body.classList.add(cls);
      return () => document.body.classList.remove(cls);
    }
  }, [visualAmbience, isOn, setTimerRunning]);

  // Leaving this page stops the timer, so Focus view styling must end with it
  useEffect(() => () => setTimerRunning(false), [setTimerRunning]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-14">
      <h2 className="w-full">
        <AmbienceAudio />
        {stopwatchMode ? (
          <Stopwatch isRunning={isOn} reset={shouldReset} onLimit={stopTimer} />
        ) : (
          <Timer
            duration={customSeconds ?? presets[displayedTime]}
            isRunning={isOn}
            reset={shouldReset}
            onDurationChange={handleCustomTime}
            onFinishedChange={setTimerFinished}
          />
        )}
      </h2>

      <div className="mt-6 grid h-8 place-items-center">
        <div className={`[grid-area:1/1] ${fadeWhen(!focused)}`}>
          <CategoryComponent />
        </div>
        <p
          className={`max-w-[min(70vw,18rem)] truncate text-sm text-white/50 [grid-area:1/1] ${fadeWhen(
            focused
          )}`}
        >
          {user && currentCategory !== "None" ? currentCategory : ""}
        </p>
      </div>

      {!stopwatchMode && (
        <div className={`mt-3 flex items-center justify-center gap-5 ${fadeWhen(!focused)}`}>
          {presets.map((seconds, id) => (
            <PresetButton
              key={id}
              seconds={seconds}
              active={id === displayedTime && customSeconds === null}
              onClick={() => handleTimerChange(id)}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex h-16 items-center justify-center">
        {/* The gear sits outside the flow so pause and reset stay centered */}
        <div className="relative flex items-center space-x-4">
          <button
            className={`cursor-pointer transition-all bg-customGreen-100 text-white px-6 py-2 rounded-lg
    border-customGreen-200
    border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[2px] ${
      focused ? "text-2xl" : "text-3xl"
    }`}
            onClick={toggleTimer}
          >
            {isOn ? <BiPause /> : <BiPlay />}
          </button>
          <button
            className={`cursor-pointer transition-all bg-customGreen-100 text-white px-6 py-2 rounded-lg
    border-customGreen-200
    border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[2px]  ${
      focused ? "text-2xl" : "text-3xl"
    }`}
            onClick={resetTimer}
          >
            <BiReset />
          </button>
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={openSettings}
            className="absolute left-full top-1/2 !ml-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-customGreen-100"
          >
            <BiCog size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
