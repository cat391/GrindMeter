import { useState, useEffect, useRef } from "react";

export default function useTimer(startingSeconds, isRunning, reset) {
  const [time, setTime] = useState(startingSeconds);
  const startingTime = useRef(null);

  // Resets time if startingSeconds is reset or changed
  useEffect(() => {
    setTime(startingSeconds);
  }, [startingSeconds, reset]);

  useEffect(() => {
    if (!isRunning) return;

    startingTime.current = Date.now();

    const intervalId = setInterval(() => {
      const passedTime = Math.floor((Date.now() - startingTime.current) / 1000);
      const remainingTime = Math.max(startingSeconds - passedTime, 0);

      setTime(remainingTime);

      if (remainingTime <= 0) {
        isRunning = false;
      }
    }, 100);

    console.log(`${Date.now()}, ${time}`);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const finished = time === 0;

  return {
    hours: Math.floor((time / (60 * 60)) % 24),
    minutes: Math.floor((time / 60) % 60),
    seconds: Math.floor(time % 60),
    state: finished,
  };
}
