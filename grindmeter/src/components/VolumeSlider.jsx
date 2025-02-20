import { useState } from "react";
import { useVolumeContext } from "../context/PresetContext";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";

function VolumeSlider() {
  const { volume, setVolume } = useVolumeContext();

  const [isGrabbing, setIsGrabbing] = useState(false);

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
        className={
          isGrabbing
            ? "w-1/2 h-9 accent-customGreen-100 cursor-grabbing"
            : "w-1/2 h-9 accent-customGreen-100 cursor-grab"
        }
        onMouseDown={() => setIsGrabbing(true)}
        onMouseUp={() => setIsGrabbing(false)}
        onMouseLeave={() => setIsGrabbing(false)}
      />
    </div>
  );
}

export default VolumeSlider;
