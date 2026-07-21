import { useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { useVolumeContext } from "../context/PresetContext";
import PropTypes from "prop-types";

export default function YoutubeAudioPlayer({ videoID }) {
  const playerRef = useRef(null);
  const { volume } = useVolumeContext();

  const onPlayerReady = (e) => {
    playerRef.current = e.target;
    e.target.playVideo();
    e.target.unMute();
    e.target.setVolume(volume);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const opts = {
    height: "0", // no visible video
    width: "0", // no visible video
    playerVars: {
      autoplay: 1,
      controls: 0, // hide controls
      disablekb: 1, // disable keyboard
      modestbranding: 1, // no YouTube logo
      start: 0, // start time in seconds
      playsinline: 1, // iOS inline playback
      fs: 0, // disable fullscreen
    },
  };

  return (
    <div style={{ overflow: "hidden", width: 0, height: 0 }}>
      <YouTube videoId={videoID} opts={opts} onReady={onPlayerReady} />
    </div>
  );
}

YoutubeAudioPlayer.propTypes = {
  videoID: PropTypes.string,
};
