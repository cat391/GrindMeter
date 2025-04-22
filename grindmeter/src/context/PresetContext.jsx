import { createContext, useState, useContext } from "react";

const PresetContext = createContext();
const VolumeContext = createContext();
const AmbienceContext = createContext();

export function usePresetContext() {
  return useContext(PresetContext);
}

export function useVolumeContext() {
  return useContext(VolumeContext);
}

export function useAmbienceContext() {
  return useContext(AmbienceContext);
}

export function PresetProvider({ children }) {
  // Preset Context
  const [presets, setPresets] = useState([60 * 10, 60 * 60, 60 * 90]);
  const [currentPreset, setCurrentPreset] = useState(presets[0]);
  // Volume Context
  const [volume, setVolume] = useState(100);
  // Ambience Context
  const [visualAmbience, setVisualAmbience] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [brownAmbience, setBrownAmbience] = useState(false);

  return (
    <PresetContext.Provider
      value={{
        presets,
        setPresets,
        currentPreset,
        setCurrentPreset,
      }}
    >
      <VolumeContext.Provider value={{ volume, setVolume }}>
        <AmbienceContext.Provider
          value={{
            visualAmbience,
            setVisualAmbience,
            timerRunning,
            setTimerRunning,
            brownAmbience,
            setBrownAmbience,
          }}
        >
          {children}
        </AmbienceContext.Provider>
      </VolumeContext.Provider>
    </PresetContext.Provider>
  );
}
