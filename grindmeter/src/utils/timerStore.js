import {
  addDoc,
  collection,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../firebase-config";
import { formatLocalDate } from "./date";

// Adds focused time to today's total for a category. The timer and stopwatch
// both save through here, so Profile treats their time the same.
export async function recordTime(duration, currentCategory, user) {
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
    } else {
      // No matching document - create new one
      await addDoc(timerUseRef, {
        duration: Math.round(duration),
        category: currentCategory,
        date: currentDate,
      });
    }
  } catch (error) {
    console.error("Error saving timer data: ", error);
  }
}
