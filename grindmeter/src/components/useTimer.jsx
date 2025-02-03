import { useState, useEffect, useRef } from "react";
import { usePresetContext } from "./PresetContext";

export default function useTimer(duration, isRunning, reset) {
  const { presets } = usePresetContext();
  const [time, setTime] = useState(presets[duration]);
  const [running, setRunning] = useState(isRunning);
  const remainingTimeRef = useRef(presets[duration]);
  const intervalRef = useRef(null);
  const oldPresets = useRef(presets);
  const shouldReset = useRef(true);
  const prevResetVal = useRef(reset);
  const prevDurationVal = useRef(duration);

  // Changes running state if prop changes (unpaused or paused)
  useEffect(() => setRunning(isRunning), [isRunning]);

  useEffect(() => {
    /*
    Checks if the timer should be reset if the presets change.
    - It should be reset if the preset changed is the one being used.
    */
    presets.forEach((element, index) => {
      // Finds the index of the preset that changed, and compares that index to the current preset being used
      if (element !== oldPresets.current[index] && index !== duration) {
        shouldReset.current = false;
      }
    });

    oldPresets.current = presets;
  }, [presets]);

  // Resets time if startingSeconds is reset or changed
  useEffect(() => {
    /*
    Checks if it can be reset, if the reset or different preset button is pushed it overrides and resets anyways.
    - Note that the prop reset is a number, not a boolean. 
    */
    if (
      shouldReset.current ||
      reset > prevResetVal.current ||
      prevDurationVal.current !== duration
    ) {
      setTime(presets[duration]);
      remainingTimeRef.current = presets[duration];
      console.log("triggered");
    } else {
      shouldReset.current = true;
    }

    prevResetVal.current = reset;
    prevDurationVal.current = duration;
  }, [duration, reset]);

  useEffect(() => {
    if (running) {
      const startingTime = Date.now();

      intervalRef.current = setInterval(() => {
        const passedTime = Math.floor((Date.now() - startingTime) / 1000);
        const remainingTime = Math.max(
          remainingTimeRef.current - passedTime,
          0
        );

        setTime(remainingTime);

        if (remainingTime <= 0) {
          clearInterval(intervalRef.current);
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      remainingTimeRef.current = time;
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [running, presets]);

  const finished = time === 0;

  return {
    state: finished,
    totalSeconds: time,
  };
}
