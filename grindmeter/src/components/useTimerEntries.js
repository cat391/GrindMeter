import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../firebase-config";

const toEntry = (snapshot) => {
  const { category, date, duration } = snapshot.data();
  return {
    date,
    category: !category || category === "None" ? "No Category" : category,
    seconds: Number(duration) || 0,
  };
};

// One live subscription feeds every dashboard view, so changing range is instant
export default function useTimerEntries(userEmail) {
  const [state, setState] = useState({ entries: [], status: "loading" });

  useEffect(() => {
    if (!userEmail) return undefined;
    setState({ entries: [], status: "loading" });
    return onSnapshot(
      collection(db, "timerData", userEmail, "timerUse"),
      (snapshot) => {
        const entries = snapshot.docs
          .map(toEntry)
          .filter(({ date }) => typeof date === "string");
        setState({ entries, status: "ready" });
      },
      (error) => {
        console.error("Error loading timer data: ", error);
        setState((current) => ({ ...current, status: "error" }));
      }
    );
  }, [userEmail]);

  return state;
}
