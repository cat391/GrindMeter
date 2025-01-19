import { createContext, useState, useContext } from "react";

const PresetContext = createContext();

export function usePresetContext() {
  return useContext(PresetContext);
}

export function PresetProvider({ children }) {
  const [presets, setPresets] = useState([600, 66, 3600]);

  return (
    <PresetContext.Provider value={{ presets, setPresets }}>
      {children}
    </PresetContext.Provider>
  );
}
