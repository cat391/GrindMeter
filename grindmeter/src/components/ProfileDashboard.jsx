import { useState } from "react";
import PropTypes from "prop-types";
import ActivityChart from "./ActivityChart";
import CategoryBreakdown from "./CategoryBreakdown";
import DeleteData from "./DeleteData";
import DownloadComponent from "./DownloadComponent";
import StatReadout from "./StatReadout";
import useTimerEntries from "./useTimerEntries";
import { useCategoryContext } from "../context/CategoryContext";
import { formatLocalDate } from "../utils/date";
import {
  buildChart,
  categoryColors,
  categoryTotals,
  currentStreak,
  formatDuration,
  formatRange,
  rangeBounds,
  summarize,
} from "../utils/timerStats";

const RANGES = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom" },
];
const EARLIEST_DAY = "2000-01-01";
const DATE_INPUT =
  "border-b border-white/20 bg-transparent py-1 font-mono text-xs text-white outline-none transition-colors [color-scheme:dark] focus:border-customGreen-100";
const FOOTER_ACTION =
  "text-white/60 transition-colors hover:text-customGreen-100";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const isValidRange = ({ start, end }, today) =>
  Boolean(start && end) && start >= EARLIEST_DAY && start <= end && end <= today;

export default function ProfileDashboard({ user, onSignOut }) {
  const { entries, status } = useTimerEntries(user.email);
  const { categories: savedCategories } = useCategoryContext();
  const [rangeId, setRangeId] = useState("month");
  const [customRange, setCustomRange] = useState(null);
  const [draftRange, setDraftRange] = useState({ start: "", end: "" });
  const [focusedCategory, setFocusedCategory] = useState(null);

  const today = formatLocalDate();
  const bounds = rangeId === "custom" ? customRange : rangeBounds(rangeId, today);
  const categories = categoryTotals(entries, bounds);
  const category = categories.some(({ name }) => name === focusedCategory)
    ? focusedCategory
    : null;
  const shownEntries = category
    ? entries.filter((entry) => entry.category === category)
    : entries;
  const summary = summarize(shownEntries, bounds, today);
  const streak = currentStreak(shownEntries, today);
  // The chart keeps every category so a focused line has context around it
  const chart = buildChart(entries, bounds, today);
  const colors = categoryColors(entries, savedCategories);
  const ready = status === "ready";
  const firstName = user.displayName?.trim().split(/\s+/)[0];
  const draftInvalid =
    Boolean(draftRange.start && draftRange.end) &&
    !isValidRange(draftRange, today);

  const selectRange = (id) => {
    if (id === rangeId) return;
    if (id === "custom") {
      // Opens on the range already in view so the chart never goes blank
      const seed = {
        start: bounds.start,
        end: bounds.end < today ? bounds.end : today,
      };
      setCustomRange(seed);
      setDraftRange(seed);
    }
    setRangeId(id);
  };

  const changeDraft = (field, value) => {
    const next = { ...draftRange, [field]: value };
    setDraftRange(next);
    if (isValidRange(next, today)) setCustomRange(next);
  };

  return (
    <section className="relative z-10 w-full max-w-5xl rounded-xl border border-white/10 bg-customBlack-500 text-white shadow-2xl shadow-black/60">
      <header className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            grindmeter // profile
          </p>
          <h1 className="text-4xl font-normal leading-tight [overflow-wrap:anywhere] sm:text-5xl sm:leading-tight">
            {firstName ? `${firstName}'s` : "Your"}{" "}
            <span className="text-customGreen-100">grind.</span>
          </h1>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div
            role="group"
            aria-label="Time range"
            className="flex gap-5 font-mono text-xs uppercase tracking-[0.14em]"
          >
            {RANGES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={rangeId === id}
                onClick={() => selectRange(id)}
                className={`border-b pb-1 transition-colors ${
                  rangeId === id
                    ? "border-customGreen-100 text-customGreen-100"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {rangeId === "custom" && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                aria-label="Start date"
                min={EARLIEST_DAY}
                max={today}
                value={draftRange.start}
                onChange={(event) => changeDraft("start", event.target.value)}
                className={DATE_INPUT}
              />
              <span aria-hidden="true" className="font-mono text-xs text-white/40">
                -&gt;
              </span>
              <input
                type="date"
                aria-label="End date"
                min={EARLIEST_DAY}
                max={today}
                value={draftRange.end}
                onChange={(event) => changeDraft("end", event.target.value)}
                className={DATE_INPUT}
              />
              {draftInvalid && (
                <p role="alert" className="w-full font-mono text-[11px] text-red-400 md:text-right">
                  Check those dates.
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px border-y border-white/10 bg-white/10 lg:grid-cols-4">
        <StatReadout
          label="Total"
          accent
          value={ready ? formatDuration(summary.total) : "--"}
          caption={plural(summary.activeDays, "active day")}
        />
        <StatReadout
          label="Daily avg"
          value={ready ? formatDuration(summary.dailyAverage) : "--"}
          caption={`over ${plural(summary.elapsedDays, "day")}`}
        />
        <StatReadout
          label="Best day"
          value={ready && summary.bestDay ? formatDuration(summary.bestDay.seconds) : "--"}
          caption={summary.bestDay?.label ?? "no sessions"}
        />
        <StatReadout
          label="Streak"
          value={ready ? `${streak}d` : "--"}
          caption="current run"
        />
      </dl>

      <div className="grid lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <ActivityChart
          chart={chart}
          colors={colors}
          rangeLabel={formatRange(bounds)}
          status={status}
          category={category}
        />
        <CategoryBreakdown
          categories={categories}
          colors={colors}
          selected={category}
          onSelect={setFocusedCategory}
        />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 whitespace-nowrap border-t border-white/10 px-6 py-4 font-mono text-xs sm:px-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <DownloadComponent className={FOOTER_ACTION} />
          <DeleteData className="text-white/60 transition-colors hover:text-red-400" />
        </div>
        <button type="button" onClick={onSignOut} className={FOOTER_ACTION}>
          Log out
        </button>
      </footer>
    </section>
  );
}

ProfileDashboard.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onSignOut: PropTypes.func.isRequired,
};
