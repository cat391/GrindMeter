import { useRef } from "react";
import YouTube from "react-youtube";

export default function YoutubeAudioPlayer({ videoID }) {
  const playerRef = useRef(null);

  const onPlayerReady = (e) => {
    e.target.playVideo();
    e.target.unMute();
  };

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
      <YouTube
        ref={playerRef}
        videoId={videoID}
        opts={opts}
        onReady={onPlayerReady}
      />
    </div>
  );
}
