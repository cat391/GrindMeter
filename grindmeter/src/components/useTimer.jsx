import { useState, useEffect, useRef } from "react";
import { usePresetContext } from "./PresetContext";

export default function useTimer(startingSeconds, isRunning, reset) {
  const { presets } = usePresetContext();
  const [time, setTime] = useState(startingSeconds);
  const remainingTimeRef = useRef(startingSeconds);
  const intervalRef = useRef(null);

  // Resets time if startingSeconds is reset or changed
  useEffect(() => {
    setTime(startingSeconds);
    remainingTimeRef.current = startingSeconds;
  }, [startingSeconds, reset, presets]);

  useEffect(() => {
    // if (!isRunning) return;

    if (isRunning) {
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
  }, [isRunning]);

  const finished = time === 0;

  return {
    state: finished,
    totalSeconds: time,
  };
}
