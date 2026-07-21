import { useState, useEffect, useRef } from "react";
import { usePresetContext } from "../context/PresetContext";
import db from "../firebase-config";
import {
  collection,
  addDoc,
  updateDoc,
  where,
  query,
  getDocs,
  increment,
} from "firebase/firestore";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";
import { formatLocalDate } from "../utils/date";

async function addTimerData(duration, currentCategory, user) {
  if (!user || !user.email) return; // Add additional check for email

  try {
    const currentDate = formatLocalDate();
    const timerUseRef = collection(db, `timerData/${user.email}/timerUse`);

    // Query for existing document with same category and date
    const q = query(
      timerUseRef,
      where("category", "==", currentCategory),
      where("date", "==", currentDate)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Document exists - atomically add to duration so concurrent writes don't clobber each other
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        duration: increment(Math.round(duration)),
      });
      console.log("Document updated with ID: ", docRef.id);
    } else {
      // No matching document - create new one
      const docRef = await addDoc(timerUseRef, {
        duration: Math.round(duration),
        category: currentCategory,
        date: currentDate,
      });
      console.log("New document created with ID: ", docRef.id);
    }
  } catch (error) {
    console.error("Error in addTimerData: ", error);
  }
}

export default function useTimer(duration, isRunning, reset) {
  const { presets } = usePresetContext();
  const [time, setTime] = useState(presets[duration]);
  const [running, setRunning] = useState(isRunning);
  const { currentCategory } = useCategoryContext();
  const { user } = UserAuth();
  const remainingTimeRef = useRef(presets[duration]);
  const intervalRef = useRef(null);
  const prevResetVal = useRef(reset);
  const prevDurationVal = useRef(duration);
  const skipPauseRecordRef = useRef(false);
  const finishedRef = useRef(false);

  const heartbeatRef = useRef(null);
  const lastHeartbeatRef = useRef(null);
  // Timer time (seconds) still available to be recorded this run; every write
  // is capped by this so the session total never exceeds its duration.
  const remainingBudgetRef = useRef(presets[duration]);

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

  // Resets time if startingSeconds is reset or changed
  useEffect(() => {
    if (reset > prevResetVal.current || prevDurationVal.current !== duration) {
      // This runs before the paired pause, whose recording is skipped below —
      // so the active run's un-heartbeated tail must be recorded here.
      if (running && startTimeRef.current && !finishedRef.current) {
        const now = Date.now();
        const sinceLast = (now - lastHeartbeatRef.current) / 1000;
        const capped = Math.min(sinceLast, remainingBudgetRef.current);
        lastHeartbeatRef.current = now;
        remainingBudgetRef.current -= capped;
        if (capped > 1) {
          addTimerData(capped, categoryRef.current, userRef.current);
        }
      }
      setTime(presets[duration]);
      remainingTimeRef.current = presets[duration];
      // A reset/duration-switch also flips the timer off; tell the running
      // effect not to record the resulting pause as session time.
      skipPauseRecordRef.current = true;
    }

    prevResetVal.current = reset;
    prevDurationVal.current = duration;
  }, [duration, reset, presets, running]);

  useEffect(() => {
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
            addTimerData(capped, categoryRef.current, userRef.current);
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
            addTimerData(capped, categoryRef.current, userRef.current);
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
            addTimerData(capped, categoryRef.current, userRef.current);
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

  const finished = time === 0;

  return {
    state: finished,
    totalSeconds: time,
  };
}
