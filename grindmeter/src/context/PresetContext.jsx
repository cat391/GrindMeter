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
  const [presets, setPresets] = useState([60 * 10, 60 * 60, 60 * 90]);
  const [currentPreset, setCurrentPreset] = useState(presets[0]);
  const [volume, setVolume] = useState(100);
  const [visualAmbience, setVisualAmbience] = useState(false);
  // const [timerRunning, setTimerRunning] = useState(false);

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
          }}
        >
          {children}
        </AmbienceContext.Provider>
      </VolumeContext.Provider>
    </PresetContext.Provider>
  );
}
