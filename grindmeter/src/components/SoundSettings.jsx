import { useState } from "react";
import { useAmbienceContext } from "../context/PresetContext";
import Toggle from "./Toggle";
import VolumeSlider from "./VolumeSlider";

export default function SoundSettings() {
  const {
    visualAmbience,
    setVisualAmbience,
    brownAmbience,
    setBrownAmbience,
    rainAmbience,
    setRainAmbience,
  } = useAmbienceContext();
  const [ambienceOn, setAmbienceOn] = useState(true);

  const toggleAmbience = (enabled) => {
    setAmbienceOn(enabled);
    if (!enabled) {
      setVisualAmbience(false);
      setBrownAmbience(false);
      setRainAmbience(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-white/60">
        Ringtone
      </h3>
      <div className="mt-3">
        <VolumeSlider />
      </div>

      <h3 className="mt-7 text-sm font-medium text-white/60">
        Ambience
      </h3>
      <div className="mt-1 divide-y divide-white/[0.07]">
        <Toggle
          name="ambienceOn"
          label="Ambience"
          description="Set the mood while the timer runs"
          checked={ambienceOn}
          onChange={toggleAmbience}
        />
        <Toggle
          name="visualChange"
          label="Focus view"
          description="Darken the page and hide presets"
          checked={visualAmbience}
          disabled={!ambienceOn}
          onChange={setVisualAmbience}
        />
        <Toggle
          name="brownChange"
          label="Brown noise"
          description="Steady, low background sound"
          checked={brownAmbience}
          disabled={!ambienceOn}
          onChange={setBrownAmbience}
        />
        <Toggle
          name="rainChange"
          label="Rain"
          description="Soft rainfall in the background"
          checked={rainAmbience}
          disabled={!ambienceOn}
          onChange={setRainAmbience}
        />
      </div>
    </div>
  );
}
