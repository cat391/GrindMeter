import { useState, useEffect, useRef } from "react";
import { usePresetContext } from "../context/PresetContext";
import db from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";

async function addTimerData(s, e) {
  try {
    const docRef = await addDoc(collection(db, "TEST"), {
      timer: {
        startingTime: s, // This should be a Firestore Timestamp object.
        endingTime: e, // This should be a Firestore Timestamp object.
        overall: s - e,
      },
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
  const remainingTimeRef = useRef(presets[duration]);
  const intervalRef = useRef(null);
  const oldPresets = useRef(presets);
  const shouldReset = useRef(true);
  const prevResetVal = useRef(reset);
  const prevDurationVal = useRef(duration);
  const startTimeRef = useRef(null);

  // Changes running state if prop changes (unpaused or paused)
  useEffect(() => setRunning(isRunning), [isRunning]);

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
          // addTimerData(startTimeRef.current, Date.now());
        }
      }, 100);
    } else {
      // FIGURE OUT A WAY TO ADD DATA ONCE TIMER IS DONE
      // if (startTimeRef.current && time > 0) {
      //   addTimerData(startTimeRef.current, Date.now());
      // }
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
