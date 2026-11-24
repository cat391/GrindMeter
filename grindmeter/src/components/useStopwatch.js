import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { useCategoryContext } from "../context/CategoryContext";
import { recordTime } from "../utils/timerStore";

const TICK_MS = 200;
const SAVE_EVERY_SECONDS = 30;
// Like the countdown, a tap of a second or so isn't worth recording
const MIN_SAVE_SECONDS = 2;
// The time display goes up to 23:59:59
const MAX_SECONDS = 24 * 60 * 60 - 1;
// Browsers slow background timers to about once a minute, so a longer silence
// means the computer was asleep, and that time doesn't count as work.
const SLEEP_GAP_MS = 2 * 60 * 1000;

const wholeSeconds = (session) => Math.floor(session.elapsedMs / 1000);

const advance = (session) => {
  if (session.lastTickAt === null) return;
  const now = Date.now();
  const gap = now - session.lastTickAt;
  session.lastTickAt = now;
  if (gap >= 0 && gap <= SLEEP_GAP_MS) {
    session.elapsedMs = Math.min(session.elapsedMs + gap, MAX_SECONDS * 1000);
  }
};

const save = (session, minimum = MIN_SAVE_SECONDS) => {
  const unsaved = wholeSeconds(session) - session.savedSeconds;
  if (unsaved < minimum) return;
  session.savedSeconds += unsaved;
  recordTime(unsaved, session.category, session.user);
};

// Counts up from zero while running. `reset` clears it when it changes, and
// `onLimit` asks the page to stop once the display can't go any higher.
export default function useStopwatch(isRunning, reset, onLimit) {
  const [seconds, setSeconds] = useState(0);
  const { categories, currentCategory } = useCategoryContext();
  const { user } = UserAuth();
  const sessionRef = useRef({
    elapsedMs: 0,
    lastTickAt: null,
    savedSeconds: 0,
    category: currentCategory,
    user,
  });
  const onLimitRef = useRef(onLimit);
  const lastResetRef = useRef(reset);

  useEffect(() => {
    onLimitRef.current = onLimit;
  }, [onLimit]);

  // Time so far belongs to the category it was spent on. A renamed or deleted
  // category no longer exists, so its unsaved time follows the replacement.
  useEffect(() => {
    const session = sessionRef.current;
    if (session.category === currentCategory && session.user === user) return;
    advance(session);
    const categoryGone =
      session.category !== "None" && !categories.includes(session.category);
    if (session.user !== user || !categoryGone) save(session, 1);
    session.category = currentCategory;
    session.user = user;
  }, [categories, currentCategory, user]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const session = sessionRef.current;
    session.lastTickAt = Date.now();

    const interval = setInterval(() => {
      advance(session);
      const total = wholeSeconds(session);
      setSeconds(total);
      if (total >= MAX_SECONDS) {
        onLimitRef.current?.();
      } else if (total - session.savedSeconds >= SAVE_EVERY_SECONDS) {
        save(session);
      }
    }, TICK_MS);

    // Runs on pause and when leaving the page, so both save the latest time
    return () => {
      clearInterval(interval);
      advance(session);
      session.lastTickAt = null;
      setSeconds(wholeSeconds(session));
      save(session);
    };
  }, [isRunning]);

  // Before paint so the old time never flashes. A reset always stops the run.
  useLayoutEffect(() => {
    if (reset === lastResetRef.current) return;
    lastResetRef.current = reset;
    const session = sessionRef.current;
    advance(session);
    save(session);
    session.elapsedMs = 0;
    session.savedSeconds = 0;
    session.lastTickAt = null;
    setSeconds(0);
  }, [reset]);

  return seconds;
}
