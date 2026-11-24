import { useState } from "react";
import { usePresetContext } from "../context/PresetContext";
import { convertToTimeStr } from "../utils/time";

const FIELDS = [
  { id: "hour", label: "Hours", short: "hrs", max: 23 },
  { id: "minute", label: "Minutes", short: "min", max: 59 },
  { id: "second", label: "Seconds", short: "sec", max: 59 },
];

const pad = (value) => String(value).padStart(2, "0");

const toDraft = (seconds) => ({
  hour: pad(Math.floor((seconds / 3600) % 24)),
  minute: pad(Math.floor((seconds / 60) % 60)),
  second: pad(seconds % 60),
});

const toSeconds = ({ hour, minute, second }) =>
  Number(hour) * 3600 + Number(minute) * 60 + Number(second);

export default function TimerInput() {
  const { presets, setPresets, currentPreset, currentPresetIndex, setCurrentPresetIndex } =
    usePresetContext();
  const [draft, setDraft] = useState(() => toDraft(currentPreset));
  const [justSaved, setJustSaved] = useState(false);

  // Loads during render so the previous preset's time never flashes. The index
  // is included so two presets with the same time don't share a draft.
  const presetKey = `${currentPresetIndex}:${currentPreset}`;
  const [loadedKey, setLoadedKey] = useState(presetKey);
  if (loadedKey !== presetKey) {
    setLoadedKey(presetKey);
    setDraft(toDraft(currentPreset));
  }

  const seconds = toSeconds(draft);
  const changed = seconds !== currentPreset;
  const canSave = changed && seconds > 0;

  const handleChange = ({ id, max }, value) => {
    if (!/^\d{0,2}$/.test(value) || Number(value) > max) return;
    setJustSaved(false);
    setDraft((current) => ({ ...current, [id]: value }));
  };

  const selectPreset = (index) => {
    setJustSaved(false);
    setCurrentPresetIndex(index);
    if (index === currentPresetIndex) setDraft(toDraft(currentPreset));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!canSave) return;
    setPresets((current) =>
      current.map((preset, index) =>
        index === currentPresetIndex ? seconds : preset
      )
    );
    setJustSaved(true);
  };

  return (
    <form onSubmit={handleSave}>
      <h3 className="text-sm font-medium text-white/60">
        Presets
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {presets.map((preset, index) => {
          const selected = index === currentPresetIndex;
          return (
            <button
              key={index}
              type="button"
              aria-pressed={selected}
              aria-label={`Preset ${index + 1}, ${convertToTimeStr(preset)}`}
              onClick={() => selectPreset(index)}
              className={`min-w-0 rounded-md border px-2 py-2.5 text-left transition-colors sm:px-3 ${
                selected
                  ? "border-customGreen-100 bg-customGreen-100/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <span
                className={`block text-xs ${
                  selected ? "text-customGreen-100" : "text-white/50"
                }`}
              >
                Preset {index + 1}
              </span>
              <span className="mt-1 block text-xs tabular-nums text-white sm:text-sm">
                {convertToTimeStr(preset)}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-7 text-sm font-medium text-white/60">
        Duration
      </h3>
      <div className="mt-3 flex items-start justify-center gap-1.5 sm:gap-3">
        {FIELDS.map((field, index) => (
          <div key={field.id} className="flex items-start gap-1.5 sm:gap-3">
            {index > 0 && (
              <span aria-hidden="true" className="pt-1 text-3xl text-white/25 sm:text-4xl">
                :
              </span>
            )}
            <label className="block text-center">
              <span className="sr-only">{field.label}</span>
              <input
                id={field.id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={draft[field.id]}
                onChange={(event) => handleChange(field, event.target.value)}
                onFocus={(event) => event.target.select()}
                onBlur={() =>
                  setDraft((current) => ({
                    ...current,
                    [field.id]: pad(Number(current[field.id])),
                  }))
                }
                className="w-14 border-b border-white/15 bg-transparent pb-1 text-center text-3xl tabular-nums text-white outline-none transition-colors focus:border-customGreen-100 sm:w-20 sm:text-4xl"
              />
              <span aria-hidden="true" className="mt-1.5 block text-xs text-white/50">
                {field.short}
              </span>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p role="status" className="min-w-0 text-xs text-white/50">
          {seconds === 0
            ? "Set at least one second."
            : justSaved && !changed
            ? "Preset updated."
            : ""}
        </p>
        <button
          type="submit"
          disabled={!canSave}
          className="shrink-0 rounded-md border border-customGreen-100 px-4 py-2 text-sm font-medium text-customGreen-100 transition-colors enabled:hover:bg-customGreen-100 enabled:hover:text-customBlack-500 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
        >
          Save preset
        </button>
      </div>
    </form>
  );
}
