import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";
import { recordTime } from "../utils/timerStore";

// `duration` is in seconds and takes effect when `reset` increases.
export default function useTimer(duration, isRunning, reset) {
  const [time, setTime] = useState(duration);
  const [running, setRunning] = useState(isRunning);
  const { currentCategory } = useCategoryContext();
  const { user } = UserAuth();
  const remainingTimeRef = useRef(duration);
  const intervalRef = useRef(null);
  const prevResetVal = useRef(reset);
  const skipPauseRecordRef = useRef(false);
  const finishedRef = useRef(false);
  const runningRef = useRef(false);

  const heartbeatRef = useRef(null);
  const lastHeartbeatRef = useRef(null);
  // Timer time (seconds) still available to be recorded this run; every write
  // is capped by this so the session total never exceeds its duration.
  const remainingBudgetRef = useRef(duration);

  // Track timer session data
  const startTimeRef = useRef(null);

  // Keep category/user in refs so interval callbacks read the latest values
  // instead of the ones captured when the running effect last ran.
  const categoryRef = useRef(currentCategory);
  const userRef = useRef(user);

  useEffect(() => {
    categoryRef.current = currentCategory;
  }, [currentCategory]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Changes running state if prop changes (unpaused or paused)
  useEffect(() => {
    setRunning(isRunning);
  }, [isRunning]);

  // Applies the current duration on reset, before paint so the old time never flashes
  useLayoutEffect(() => {
    if (reset > prevResetVal.current) {
      // This runs before the paired pause, whose recording is skipped below —
      // so the active run's un-heartbeated tail must be recorded here.
      if (running && startTimeRef.current && !finishedRef.current) {
        const now = Date.now();
        const sinceLast = (now - lastHeartbeatRef.current) / 1000;
        const capped = Math.min(sinceLast, remainingBudgetRef.current);
        lastHeartbeatRef.current = now;
        remainingBudgetRef.current -= capped;
        if (capped > 1) {
          recordTime(capped, categoryRef.current, userRef.current);
        }
      }
      // Stop ticking now: the running state turns off a render later, and a
      // tick in that gap would overwrite the reset with the old time.
      clearInterval(intervalRef.current);
      clearInterval(heartbeatRef.current);
      setTime(duration);
      remainingTimeRef.current = duration;
      // A reset/duration-switch also flips the timer off; tell the running
      // effect not to record the resulting pause as session time.
      skipPauseRecordRef.current = true;
    }

    prevResetVal.current = reset;
  }, [duration, reset, running]);

  useEffect(() => {
    runningRef.current = running;
    if (running) {
      skipPauseRecordRef.current = false;
      finishedRef.current = false;
      const startingTime = Date.now();
      startTimeRef.current = startingTime;
      lastHeartbeatRef.current = startingTime;
      const startingRemaining = remainingTimeRef.current;
      remainingBudgetRef.current = startingRemaining;

      intervalRef.current = setInterval(() => {
        const passedTime = Math.floor((Date.now() - startingTime) / 1000);
        const remainingTime = Math.max(startingRemaining - passedTime, 0);

        setTime(remainingTime);

        if (remainingTime <= 0) {
          clearInterval(intervalRef.current);
          clearInterval(heartbeatRef.current);

          const now = Date.now();
          const sinceLast = (now - lastHeartbeatRef.current) / 1000;
          const capped = Math.min(sinceLast, remainingBudgetRef.current);
          lastHeartbeatRef.current = now;
          remainingBudgetRef.current = 0;

          finishedRef.current = true;

          if (capped > 0) {
            recordTime(capped, categoryRef.current, userRef.current);
          }
        }
      }, 100);

      heartbeatRef.current = setInterval(() => {
        const now = Date.now();
        const sinceLast = (now - lastHeartbeatRef.current) / 1000;
        if (sinceLast >= 30) {
          const capped = Math.min(sinceLast, remainingBudgetRef.current);
          lastHeartbeatRef.current = now;
          remainingBudgetRef.current -= capped;
          if (capped > 0) {
            recordTime(capped, categoryRef.current, userRef.current);
          }
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      clearInterval(heartbeatRef.current);

      if (skipPauseRecordRef.current) {
        skipPauseRecordRef.current = false;
      } else {
        if (startTimeRef.current && time > 0 && !finishedRef.current) {
          const now = Date.now();
          const sinceLast = (now - lastHeartbeatRef.current) / 1000;
          const capped = Math.min(sinceLast, remainingBudgetRef.current);

          // Only record if there's meaningful duration (>1 second)
          if (capped > 1) {
            recordTime(capped, categoryRef.current, userRef.current);
          }
        }

        remainingTimeRef.current = time;

        if (time > 0) {
          finishedRef.current = false;
        }
      }
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(heartbeatRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 'time' is read only on the running→false transition; adding it would recreate the interval every tick
  }, [running]);

  // Leaving the page or switching to the stopwatch ends a run with no pause,
  // so the time since the last save is recorded here.
  useEffect(
    () => () => {
      if (!runningRef.current || finishedRef.current) return;
      const sinceLast = (Date.now() - lastHeartbeatRef.current) / 1000;
      const capped = Math.min(sinceLast, remainingBudgetRef.current);
      if (capped > 1) {
        recordTime(capped, categoryRef.current, userRef.current);
      }
    },
    []
  );

  const finished = time === 0;

  return {
    state: finished,
    totalSeconds: time,
  };
}
