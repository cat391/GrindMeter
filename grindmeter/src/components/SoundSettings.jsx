import { useState } from "react";
import PropTypes from "prop-types";
import { useAmbienceContext } from "../context/PresetContext";
import VolumeSlider from "./VolumeSlider";

function Toggle({ name, label, description, checked, disabled = false, onChange }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 py-3 transition-opacity ${
        disabled ? "opacity-40" : "cursor-pointer"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm text-white">{label}</span>
        <span className="mt-0.5 block text-xs text-white/50">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 shrink-0 rounded-full bg-white/15 transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:bg-customGreen-100 peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-customGreen-100 motion-reduce:transition-none motion-reduce:after:transition-none"
      />
    </label>
  );
}

Toggle.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

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
