import useTimer from "./useTimer";
import "../App.css";
import { useVolumeContext } from "../context/PresetContext";
import { useRef, useEffect } from "react";
import { useAmbienceContext } from "../context/PresetContext";
import YoutubeAudioPlayer from "./YoutubeAudioPlayer";
import TimeDisplay from "./TimeDisplay";
import PropTypes from "prop-types";

export default function Timer({
  duration,
  isRunning,
  reset,
  onDurationChange,
}) {
  const { volume } = useVolumeContext();
  const { visualAmbience, timerRunning, brownAmbience, rainAmbience } =
    useAmbienceContext();
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

  // Changes volume if user changes it in settings
  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const glowClass = !(timerRunning && visualAmbience)
    ? ""
    : state
    ? "[text-shadow:0_0_14px_rgb(255_0_0_/_0.5),0_0_36px_rgb(255_0_0_/_0.2)]"
    : "[text-shadow:0_0_14px_rgb(255_255_255_/_0.35),0_0_36px_rgb(255_255_255_/_0.12)]";

  return (
    <div>
      {timerRunning && brownAmbience ? (
        <YoutubeAudioPlayer videoID="RqzGzwTY-6w" />
      ) : null}

      {timerRunning && rainAmbience ? (
        <YoutubeAudioPlayer videoID="yIQd2Ya0Ziw" />
      ) : null}

      <audio ref={audioRef} src="/sounds/betav2-ringtone.wav" loop />
      <TimeDisplay
        seconds={totalSeconds}
        isRunning={isRunning}
        finished={state}
        glowClass={glowClass}
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
};
