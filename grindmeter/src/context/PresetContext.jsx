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

const STOPWATCH_KEY = "grindmeter.stopwatch";

// Storage can be unavailable in private windows, where the mode just won't persist
const readStopwatchMode = () => {
  try {
    return localStorage.getItem(STOPWATCH_KEY) === "on";
  } catch {
    return false;
  }
};

const writeStopwatchMode = (enabled) => {
  try {
    localStorage.setItem(STOPWATCH_KEY, enabled ? "on" : "off");
  } catch {
    // The choice still applies until the page reloads
  }
};

export function PresetProvider({ children }) {
  // Preset Context
  const [presets, setPresets] = useState([60 * 10, 60 * 60, 60 * 90]);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const currentPreset = presets[currentPresetIndex];
  const [stopwatchMode, setStopwatchEnabled] = useState(readStopwatchMode);
  const setStopwatchMode = (enabled) => {
    setStopwatchEnabled(enabled);
    writeStopwatchMode(enabled);
  };
  // Volume Context
  const [volume, setVolume] = useState(100);
  // Ambience Context
  const [visualAmbience, setVisualAmbience] = useState(true);
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
        stopwatchMode,
        setStopwatchMode,
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
