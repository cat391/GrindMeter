import { createContext, useState, useContext } from "react";

const PresetContext = createContext();

export function usePresetContext() {
  return useContext(PresetContext);
}

export function PresetProvider({ children }) {
  const [presets, setPresets] = useState([60 * 10, 60 * 60, 60 * 90]);
  const [currentPreset, setCurrentPreset] = useState(presets[0]);

  return (
    <PresetContext.Provider
      value={{ presets, setPresets, currentPreset, setCurrentPreset }}
    >
      {children}
    </PresetContext.Provider>
  );
}
