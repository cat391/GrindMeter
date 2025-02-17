import { useState } from "react";
import { usePresetContext } from "./PresetContext";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";

function VolumeSlider() {
  const {
    presets,
    setPresets,
    currentPreset,
    setCurrentPreset,
    volume,
    setVolume,
  } = usePresetContext();

  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {(() => {
        if (volume > 50) {
          return <IoMdVolumeHigh className="text-customGreen-100" />;
        } else if (volume >= 1) {
          return <IoMdVolumeLow className="text-customGreen-100" />;
        } else {
          return <IoMdVolumeMute className="text-customGreen-100" />;
        }
      })()}

      <input
        id="volume-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        onChange={handleVolumeChange}
        className="w-1/2 h-9 accent-customGreen-100"
      />
    </div>
  );
}

export default VolumeSlider;
