import { useState, useEffect, useRef } from "react";
import { usePresetContext } from "../context/PresetContext";
import db from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";

async function addTimerData(duration, currentCategory, user) {
  if (!user) return; // Do not add data if user is not logged in

  try {
    // Add timer data to subcollection for user in timerData
    const timerDataRef = collection(db, `timerData/${user.email}/timerUse`);

    const docRef = await addDoc(timerDataRef, {
      duration: Math.round(duration),
      category: currentCategory,
      date: new Date().toISOString().split("T")[0],
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
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
  const oldPresets = useRef(presets);
  const shouldReset = useRef(true);
  const prevResetVal = useRef(reset);
  const prevDurationVal = useRef(duration);

  // Track timer session data
  const startTimeRef = useRef(null);

  // Changes running state if prop changes (unpaused or paused)

  useEffect(() => {
    setRunning(isRunning);
  }, [isRunning]);

  useEffect(() => {
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
      startTimeRef.current = Date.now();
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
          const endTime = Date.now();
          const duration = (endTime - startTimeRef.current) / 1000;

          addTimerData(duration, currentCategory, user);
        }
      }, 100);
    } else {
      if (startTimeRef.current && time > 0) {
        const endTime = Date.now();
        const duration = (endTime - startTimeRef.current) / 1000;

        addTimerData(duration, currentCategory, user);
      }
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
