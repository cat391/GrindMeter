import useTimer from "./useTimer";
import "../App.css";
import { usePresetContext } from "./PresetContext";
import { useRef, useEffect } from "react";

const convertToTimeStrV2 = (org) => {
  {
    let m = Math.floor((org / 60) % 60);
    let s = Math.floor(org % 60);
    let h = Math.floor((org / (60 * 60)) % 24);

    let minutes = () => {
      if (h === 0 && m === 0) {
        return ""; // No hours or minutes
      } else if (h !== 0 && m === 0) {
        return "00:"; // hours but no minutes
      } else if (h !== 0 && m < 10) {
        return "0" + String(m) + ":"; // Hours but less than 10 minutes
      } else {
        return String(m) + ":";
      }
    };

    let seconds = () => {
      if (s === 0 && (h !== 0 || m !== 0)) {
        return "00"; // No seconds with hours or minutes
      } else if (s / 10 < 1 && (h !== 0 || m !== 0)) {
        return "0" + String(s); // Single digit seconds with minutes or hours
      } else {
        return String(s);
      }
    };

    return `${h != 0 ? String(h) + ":" : ""}${minutes()}${seconds()}`;
  }
};

export default function Timer({ durationID, isRunning, reset }) {
  const {
    presets,
    setPresets,
    currentPreset,
    setCurrentPreset,
    volume,
    setVolume,
  } = usePresetContext();

  const { state, totalSeconds } = useTimer(durationID, isRunning, reset);
  const audioRef = useRef(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    if (state) {
      playAudio();
    } else {
      pauseAudio();
    }

    // Cleanup function to pause audio when component unmounts
    return () => {
      pauseAudio();
    };
  }, [state]);

  // Changes volume if user changes it in settings
  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  return (
    <div>
      <audio ref={audioRef} src="/sounds/betav2-ringtone.wav" loop />
      <div
        className={
          state
            ? "flex items-center justify-center h-96 w-full text-8xl font-bold text-red-700"
            : "flex items-center justify-center h-96 w-full text-8xl font-bold text-customBlack-400"
        }
      >
        {convertToTimeStrV2(totalSeconds)}
      </div>
    </div>
  );
}
