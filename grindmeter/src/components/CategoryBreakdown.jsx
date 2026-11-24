import PropTypes from "prop-types";
import useScrollEdges from "./useScrollEdges";
import { formatDuration } from "../utils/timerStats";

// Longer than any row; the meter clips it to whole characters at every width
const METER_CHARACTERS = 160;

function AsciiMeter({ share, color }) {
  return (
    <span
      aria-hidden="true"
      style={{ "--share": `${share * 100}%`, color }}
      className="flex overflow-hidden whitespace-pre font-mono text-[11px] leading-4"
    >
      <span className="w-[var(--share)] min-w-[1ch] shrink-0 overflow-hidden supports-[width:round(down,1%,1ch)]:w-[round(down,var(--share),1ch)]">
        {"#".repeat(METER_CHARACTERS)}
      </span>
      <span className="min-w-0 flex-1 overflow-hidden text-white/15">
        {".".repeat(METER_CHARACTERS)}
      </span>
    </span>
  );
}

AsciiMeter.propTypes = {
  share: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

const FADE =
  "pointer-events-none absolute inset-x-0 z-10 h-12 from-customBlack-500 to-transparent transition-opacity duration-200 motion-reduce:transition-none lg:right-1";

export default function CategoryBreakdown({
  categories,
  colors,
  selected,
  onSelect,
}) {
  const { scrollRef, above, below } = useScrollEdges(categories.length);

  return (
    <div className="flex min-w-0 flex-col border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
      <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
        <h2 className="text-white/50">Categories</h2>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="tracking-[0.08em] text-customGreen-100 transition-opacity hover:opacity-70"
          >
            Show all
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <p className="mt-6 font-mono text-xs text-white/50">&gt; nothing logged</p>
      ) : (
        // The list is out of flow on desktop so the chart alone sets the panel height
        <div className="relative -mx-2 mt-4 lg:-mr-3 lg:flex-1">
          <div
            aria-hidden="true"
            data-fade="top"
            className={`${FADE} top-0 bg-gradient-to-b ${
              above ? "opacity-100" : "opacity-0"
            }`}
          />
          <ul
            ref={scrollRef}
            className="quiet-scrollbar space-y-1 overscroll-contain lg:absolute lg:inset-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]"
          >
            {categories.map(({ name, seconds, share }) => {
              const isSelected = selected === name;
              return (
                <li key={name}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    title={name}
                    onClick={() => onSelect(isSelected ? null : name)}
                    className={`w-full rounded px-2 py-2 text-left transition-[background-color,opacity] duration-150 hover:bg-white/[0.04] ${
                      selected && !isSelected ? "opacity-45 hover:opacity-100" : ""
                    }`}
                  >
                    <span className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-white">
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: colors.get(name) }}
                          className="h-2 w-2 shrink-0 rounded-full"
                        />
                        <span className="truncate">{name}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-white/60">
                        {formatDuration(seconds)}
                        <span className="ml-2 inline-block w-9 text-right text-white/40">
                          {Math.round(share * 100)}%
                        </span>
                      </span>
                    </span>
                    <AsciiMeter share={share} color={colors.get(name)} />
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            aria-hidden="true"
            data-fade="bottom"
            className={`${FADE} bottom-0 bg-gradient-to-t ${
              below ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      )}
    </div>
  );
}

CategoryBreakdown.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      seconds: PropTypes.number.isRequired,
      share: PropTypes.number.isRequired,
    })
  ).isRequired,
  colors: PropTypes.instanceOf(Map).isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
