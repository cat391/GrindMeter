import useTimer from "./useTimer";
import "../App.css";
import { useVolumeContext } from "../context/PresetContext";
import { useRef, useEffect } from "react";
import { useAmbienceContext } from "../context/PresetContext";
import TimeDisplay from "./TimeDisplay";
import PropTypes from "prop-types";

export default function Timer({
  duration,
  isRunning,
  reset,
  onDurationChange,
  onFinishedChange,
}) {
  const { volume } = useVolumeContext();
  const { visualAmbience, timerRunning } = useAmbienceContext();
  const { state, totalSeconds } = useTimer(duration, isRunning, reset);
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

  useEffect(() => {
    onFinishedChange(state);
  }, [state, onFinishedChange]);

  // Changes volume if user changes it in settings
  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  return (
    <div>
      <audio ref={audioRef} src="/sounds/betav2-ringtone.wav" loop />
      <TimeDisplay
        seconds={totalSeconds}
        isRunning={isRunning}
        finished={state}
        glowing={timerRunning && visualAmbience}
        onCommit={onDurationChange}
      />
    </div>
  );
}

Timer.propTypes = {
  duration: PropTypes.number.isRequired,
  isRunning: PropTypes.bool,
  reset: PropTypes.number,
  onDurationChange: PropTypes.func.isRequired,
  onFinishedChange: PropTypes.func.isRequired,
};
