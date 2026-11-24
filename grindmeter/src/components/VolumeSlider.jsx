import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { useVolumeContext } from "../context/PresetContext";

function volumeIcon(volume) {
  if (volume === 0) return FiVolumeX;
  if (volume < 34) return FiVolume;
  return volume < 67 ? FiVolume1 : FiVolume2;
}

function VolumeSlider() {
  const { volume, setVolume } = useVolumeContext();
  const Icon = volumeIcon(volume);

  return (
    <div className="flex items-center gap-3">
      <Icon aria-hidden="true" size={16} className="shrink-0 text-white/60" />
      <input
        id="volume-slider"
        aria-label="Ringtone volume"
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        style={{ "--value": `${volume}%` }}
        onChange={(event) => setVolume(Number(event.target.value))}
        className="range-slider min-w-0 flex-1"
      />
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-white/60">
        {volume}%
      </span>
    </div>
  );
}

export default VolumeSlider;
