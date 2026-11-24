import { useAmbienceContext } from "../context/PresetContext";
import YoutubeAudioPlayer from "./YoutubeAudioPlayer";

// Background sound for whichever clock is running
export default function AmbienceAudio() {
  const { timerRunning, brownAmbience, rainAmbience } = useAmbienceContext();

  if (!timerRunning) return null;

  return (
    <>
      {brownAmbience && <YoutubeAudioPlayer videoID="RqzGzwTY-6w" />}
      {rainAmbience && <YoutubeAudioPlayer videoID="yIQd2Ya0Ziw" />}
    </>
  );
}
