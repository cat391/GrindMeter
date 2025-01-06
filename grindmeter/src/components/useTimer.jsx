import { useState, useEffect } from "react";

export default function useTimer(startingSeconds, isRunning) {
  const [time, setTime] = useState(startingSeconds);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  useEffect(() => {
    setTime(startingSeconds);
  }, [startingSeconds]);

  return {
    hours: Math.floor((time / (60 * 60)) % 24),
    minutes: Math.floor((time / 60) % 60),
    seconds: Math.floor(time % 60),
  };
}
