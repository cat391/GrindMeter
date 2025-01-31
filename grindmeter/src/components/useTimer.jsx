import { useState, useEffect, useRef } from "react";
import { usePresetContext } from "./PresetContext";

export default function useTimer(duration, isRunning, reset) {
  const { presets } = usePresetContext();
  const [time, setTime] = useState(presets[duration]);
  const [running, setRunning] = useState(isRunning);
  const remainingTimeRef = useRef(presets[duration]);
  const intervalRef = useRef(null);

  // Changes running state if prop changes (unpaused or paused)
  useEffect(() => setRunning(isRunning), [isRunning]);

  // Resets time if startingSeconds is reset or changed
  useEffect(() => {
    setTime(presets[duration]);
    remainingTimeRef.current = presets[duration];
    console.log("triggered");
  }, [duration, reset, presets]);

  useEffect(() => {
    if (running) {
      const startingTime = Date.now();

      intervalRef.current = setInterval(() => {
        const passedTime = Math.floor((Date.now() - startingTime) / 1000);
        const remainingTime = Math.max(
          remainingTimeRef.current - passedTime,
          0
        ); // Updated startingSeconds to remainingTimeRef

        // console.log(startingSeconds, passedTime, remainingTime);

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
