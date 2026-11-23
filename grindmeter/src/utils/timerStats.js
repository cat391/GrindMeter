import { formatLocalDate } from "./date";

const DAY_MS = 24 * 60 * 60 * 1000;
// Totals under a minute are treated as noise, matching what the app records
const MIN_VISIBLE_SECONDS = 60;
const NO_CATEGORY = "No Category";
const NO_CATEGORY_COLOR = "#9aa3ad";
const CATEGORY_PALETTE = [
  "#3ee06f",
  "#38bdf8",
  "#f5b83d",
  "#e879a6",
  "#a78bfa",
  "#2dd4bf",
  "#fb7185",
  "#c5d86d",
];

export const parseDay = (day) => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
};

const shiftDay = (day, amount) => {
  const date = parseDay(day);
  date.setDate(date.getDate() + amount);
  return formatLocalDate(date);
};

const dayNumber = (day) => {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date) / DAY_MS;
};

const daysBetween = (start, end) => dayNumber(end) - dayNumber(start);

const formatDay = (day, options) =>
  parseDay(day).toLocaleDateString("en-US", options);

const inBounds = ({ date }, { start, end }) => date >= start && date <= end;

export function rangeBounds(rangeId, today) {
  const date = parseDay(today);
  const year = date.getFullYear();
  const month = date.getMonth();
  if (rangeId === "week") {
    const start = shiftDay(today, -((date.getDay() + 6) % 7));
    return { start, end: shiftDay(start, 6) };
  }
  if (rangeId === "year") {
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }
  return {
    start: formatLocalDate(new Date(year, month, 1)),
    end: formatLocalDate(new Date(year, month + 1, 0)),
  };
}

export function formatDuration(seconds) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${minutes}m`;
}

export function formatRange({ start, end }) {
  const short = { month: "short", day: "numeric" };
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const first = formatDay(start, sameYear ? short : { ...short, year: "numeric" });
  return `${first} - ${formatDay(end, { ...short, year: "numeric" })}`;
}

function bucketUnit({ start, end }) {
  const days = daysBetween(start, end) + 1;
  if (days <= 31) return "day";
  if (days <= 182) return "week";
  return days <= 732 ? "month" : "year";
}

function bucketEnd(start, unit) {
  const date = parseDay(start);
  if (unit === "day") return start;
  if (unit === "week") return shiftDay(start, 6);
  if (unit === "month") {
    return formatLocalDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  }
  return `${date.getFullYear()}-12-31`;
}

function bucketTitle(start, end, unit) {
  if (unit === "day") {
    return formatDay(start, { weekday: "short", month: "short", day: "numeric" });
  }
  if (unit === "week") return formatRange({ start, end });
  return unit === "month"
    ? formatDay(start, { month: "long", year: "numeric" })
    : start.slice(0, 4);
}

function bucketTick(start, unit, count) {
  if (unit === "day") {
    return count <= 7
      ? formatDay(start, { weekday: "narrow" })
      : String(parseDay(start).getDate());
  }
  if (unit === "week") return formatDay(start, { month: "short", day: "numeric" });
  if (unit === "month") {
    return formatDay(start, { month: count <= 12 ? "narrow" : "short" });
  }
  return start.slice(0, 4);
}

// Rounds up to a clean axis maximum such as 30m, 2h, or 50h
function axisMaximum(seconds) {
  const minutes = seconds / 60;
  // Every step halves to a whole minute for the middle axis label
  if (minutes <= 60) return [10, 20, 30, 60].find((step) => minutes <= step) * 60;
  const hours = minutes / 60;
  const magnitude = 10 ** Math.floor(Math.log10(hours));
  const factor = [1, 2, 3, 5, 10].find((step) => hours <= step * magnitude);
  return factor * magnitude * 3600;
}

// Follows the saved category order so a color doesn't change between views
export function categoryColors(entries, savedCategories = []) {
  const saved = savedCategories.filter((name) => name !== "None");
  const others = [...new Set(entries.map(({ category }) => category))]
    .filter((name) => name !== NO_CATEGORY && !saved.includes(name))
    .sort();
  const colors = new Map([[NO_CATEGORY, NO_CATEGORY_COLOR]]);
  [...saved, ...others].forEach((name, index) => {
    colors.set(name, CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]);
  });
  return colors;
}

export function buildChart(entries, bounds, today) {
  const unit = bucketUnit(bounds);
  const ranges = [];
  for (let start = bounds.start; start <= bounds.end; ) {
    const naturalEnd = bucketEnd(start, unit);
    const end = naturalEnd < bounds.end ? naturalEnd : bounds.end;
    ranges.push({ start, end });
    start = shiftDay(end, 1);
  }

  const tickEvery = Math.max(1, Math.ceil(ranges.length / (ranges.length <= 12 ? 12 : 7)));
  const buckets = ranges.map(({ start, end }, index) => ({
    start,
    end,
    seconds: 0,
    categories: new Map(),
    title: bucketTitle(start, end, unit),
    tick: index % tickEvery === 0 ? bucketTick(start, unit, ranges.length) : "",
    current: today >= start && today <= end,
  }));

  entries.forEach((entry) => {
    if (!inBounds(entry, bounds)) return;
    const bucket = buckets.find(({ end }) => entry.date <= end);
    bucket.seconds += entry.seconds;
    bucket.categories.set(
      entry.category,
      (bucket.categories.get(entry.category) || 0) + entry.seconds
    );
  });

  // Periods under a minute stay empty so a line only marks real work
  const series = categoryTotals(entries, bounds).map(({ name }) => ({
    name,
    values: buckets.map(({ categories }) => {
      const seconds = categories.get(name) || 0;
      return seconds >= MIN_VISIBLE_SECONDS ? seconds : null;
    }),
  }));
  const peak = Math.max(0, ...series.flatMap(({ values }) => values));
  return { buckets, series, axisMax: axisMaximum(peak) };
}

export function summarize(entries, bounds, today) {
  const totals = new Map();
  let total = 0;
  entries.forEach((entry) => {
    if (!inBounds(entry, bounds)) return;
    total += entry.seconds;
    totals.set(entry.date, (totals.get(entry.date) || 0) + entry.seconds);
  });

  let bestDay = null;
  let activeDays = 0;
  totals.forEach((seconds, date) => {
    if (seconds < MIN_VISIBLE_SECONDS) return;
    activeDays += 1;
    if (!bestDay || seconds > bestDay.seconds) bestDay = { date, seconds };
  });

  const lastCounted = bounds.end < today ? bounds.end : today;
  const elapsedDays =
    lastCounted < bounds.start ? 0 : daysBetween(bounds.start, lastCounted) + 1;

  return {
    total,
    activeDays,
    elapsedDays,
    dailyAverage: elapsedDays > 0 ? total / elapsedDays : 0,
    bestDay: bestDay && {
      seconds: bestDay.seconds,
      label: formatDay(bestDay.date, { month: "short", day: "numeric" }),
    },
  };
}

export function categoryTotals(entries, bounds) {
  const totals = new Map();
  entries.forEach((entry) => {
    if (!inBounds(entry, bounds)) return;
    totals.set(entry.category, (totals.get(entry.category) || 0) + entry.seconds);
  });
  const visible = [...totals]
    .filter(([, seconds]) => seconds >= MIN_VISIBLE_SECONDS)
    .sort(([, a], [, b]) => b - a);
  const total = visible.reduce((sum, [, seconds]) => sum + seconds, 0);
  return visible.map(([name, seconds]) => ({
    name,
    seconds,
    share: seconds / total,
  }));
}

// A streak survives until the end of the next day, so today can still count
export function currentStreak(entries, today) {
  const totals = new Map();
  entries.forEach(({ date, seconds }) => {
    totals.set(date, (totals.get(date) || 0) + seconds);
  });
  const isActive = (day) => (totals.get(day) || 0) >= MIN_VISIBLE_SECONDS;

  let day = isActive(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (isActive(day)) {
    streak += 1;
    day = shiftDay(day, -1);
  }
  return streak;
}
