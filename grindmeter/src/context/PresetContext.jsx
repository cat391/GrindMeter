/* eslint-disable react-refresh/only-export-components -- this file also exports usePresetContext/useVolumeContext/useAmbienceContext hooks; splitting them out would require updating every importer across src/ */
import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

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
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const currentPreset = presets[currentPresetIndex];
  // Volume Context
  const [volume, setVolume] = useState(100);
  // Ambience Context
  const [visualAmbience, setVisualAmbience] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [brownAmbience, setBrownAmbience] = useState(false);
  const [rainAmbience, setRainAmbience] = useState(false);

  return (
    <PresetContext.Provider
      value={{
        presets,
        setPresets,
        currentPreset,
        currentPresetIndex,
        setCurrentPresetIndex,
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
            rainAmbience,
            setRainAmbience,
          }}
        >
          {children}
        </AmbienceContext.Provider>
      </VolumeContext.Provider>
    </PresetContext.Provider>
  );
}

PresetProvider.propTypes = {
  children: PropTypes.node,
};
