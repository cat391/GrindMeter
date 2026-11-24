import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import PropTypes from "prop-types";
import CategoryManager from "./CategoryManager";
import SoundSettings from "./SoundSettings";
import TimerInput from "./TimerInput";
import useScrollEdges from "./useScrollEdges";

const TABS = [
  { id: "timer", label: "Timer" },
  { id: "sound", label: "Sound" },
  { id: "categories", label: "Categories" },
];
const FADE =
  "pointer-events-none absolute inset-x-0 right-1 z-10 h-10 from-customBlack-500 to-transparent transition-opacity duration-200 motion-reduce:transition-none";

function SettingsModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const tabRefs = useRef({});
  const [activeTab, setActiveTab] = useState("timer");
  const { scrollRef, above, below } = useScrollEdges(activeTab);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const selectTab = (id) => {
    setActiveTab(id);
    scrollRef.current.scrollTop = 0;
  };

  const handleTabKey = (event, index) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = TABS[(index + step + TABS.length) % TABS.length];
    selectTab(next.id);
    tabRefs.current[next.id].focus();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
      className="m-auto h-[min(88dvh,32.5rem)] w-[min(92vw,30rem)] overflow-hidden rounded-xl border border-white/10 bg-customBlack-500 p-0 text-white shadow-2xl shadow-black/60 backdrop:bg-black/70"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 px-6 pb-4 pt-5">
          <h2 id="settings-title" className="text-2xl font-semibold">
            Settings
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialogRef.current.close()}
            className="-mr-1 grid h-8 w-8 place-items-center rounded text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <FiX size={18} />
          </button>
        </header>

        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex gap-5 border-b border-white/10 px-6 text-sm font-medium"
        >
          {TABS.map(({ id, label }, index) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                ref={(element) => {
                  tabRefs.current[id] = element;
                }}
                type="button"
                role="tab"
                id={`settings-tab-${id}`}
                aria-selected={selected}
                aria-controls={`settings-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(id)}
                onKeyDown={(event) => handleTabKey(event, index)}
                className={`-mb-px border-b pb-2.5 transition-colors ${
                  selected
                    ? "border-customGreen-100 text-customGreen-100"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            aria-hidden="true"
            data-fade="top"
            className={`${FADE} top-0 bg-gradient-to-b ${
              above ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={scrollRef}
            className="quiet-scrollbar h-full overflow-y-auto overscroll-contain py-5 pl-6 pr-5 [scrollbar-gutter:stable]"
          >
            <div>
              {/* Panels stay mounted so unsaved edits survive switching tabs */}
              <div
                role="tabpanel"
                id="settings-panel-timer"
                aria-labelledby="settings-tab-timer"
                hidden={activeTab !== "timer"}
              >
                <TimerInput />
              </div>
              <div
                role="tabpanel"
                id="settings-panel-sound"
                aria-labelledby="settings-tab-sound"
                hidden={activeTab !== "sound"}
              >
                <SoundSettings />
              </div>
              <div
                role="tabpanel"
                id="settings-panel-categories"
                aria-labelledby="settings-tab-categories"
                hidden={activeTab !== "categories"}
              >
                <CategoryManager onNavigate={() => dialogRef.current.close()} />
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            data-fade="bottom"
            className={`${FADE} bottom-0 bg-gradient-to-t ${
              below ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </dialog>
  );
}

SettingsModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default SettingsModal;
