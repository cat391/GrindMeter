import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import PropTypes from "prop-types";
import { formatDuration } from "../utils/timerStats";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip);

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const AXIS_COLOR = "rgba(255, 255, 255, 0.4)";
const DIMMED_ALPHA = "26";

// Marks the hovered period so its points are easy to compare across lines
const crosshair = {
  id: "crosshair",
  beforeDatasetsDraw(chart) {
    const [active] = chart.getActiveElements();
    if (!active) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(active.element.x, chartArea.top);
    ctx.lineTo(active.element.x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};

function chartData({ buckets, series }, colors, category) {
  return {
    labels: buckets.map(({ title }) => title),
    datasets: series.map(({ name, values }) => {
      const color = colors.get(name);
      const shown = !category || category === name;
      const stroke = shown ? color : `${color}${DIMMED_ALPHA}`;
      return {
        label: name,
        data: values,
        borderColor: stroke,
        backgroundColor: stroke,
        borderWidth: shown ? 2 : 1.5,
        pointRadius: shown ? 2.5 : 0,
        pointHoverRadius: shown ? 4 : 0,
        // Straight segments avoid implying time between logged days
        tension: 0,
        spanGaps: true,
        // Lets points on the top of the axis draw in full
        clip: false,
        order: shown ? 0 : 1,
      };
    }),
  };
}

function chartOptions({ buckets, axisMax }, category) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion ? false : { duration: 350 },
    transitions: { active: { animation: { duration: 0 } } },
    interaction: { mode: "index", intersect: false },
    layout: { padding: { top: 6, right: 6 } },
    scales: {
      x: {
        grid: { display: false },
        border: { color: "rgba(255, 255, 255, 0.15)" },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          color: AXIS_COLOR,
          font: { family: MONO_FONT, size: 10 },
          callback: (_value, index) => buckets[index].tick,
        },
      },
      y: {
        min: 0,
        max: axisMax,
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        border: { display: false },
        ticks: {
          stepSize: axisMax / 2,
          color: AXIS_COLOR,
          font: { family: MONO_FONT, size: 10 },
          callback: (value) => formatDuration(value),
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1d1d1d",
        borderColor: "rgba(255, 255, 255, 0.14)",
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
        titleColor: "#ffffff",
        bodyColor: "rgba(255, 255, 255, 0.82)",
        footerColor: "#23a946",
        titleFont: { family: MONO_FONT, size: 11, weight: "normal" },
        bodyFont: { family: MONO_FONT, size: 11 },
        footerFont: { family: MONO_FONT, size: 11, weight: "normal" },
        usePointStyle: true,
        boxWidth: 6,
        boxHeight: 6,
        filter: ({ raw, dataset }) =>
          raw !== null && (!category || dataset.label === category),
        itemSort: (a, b) => b.raw - a.raw,
        callbacks: {
          label: ({ dataset, raw }) =>
            ` ${dataset.label}  ${formatDuration(raw)}`,
          footer: (items) =>
            items.length > 1
              ? `Total  ${formatDuration(
                  items.reduce((sum, { raw }) => sum + raw, 0)
                )}`
              : "",
        },
      },
    },
  };
}

const describeBucket = ({ title, seconds }, series, index) => {
  const parts = series
    .filter(({ values }) => values[index] !== null)
    .map(({ name, values }) => `${name} ${formatDuration(values[index])}`);
  return parts.length > 0
    ? `${title}: ${parts.join(", ")}`
    : `${title}: ${formatDuration(seconds)}`;
};

export default function ActivityChart({
  chart,
  colors,
  rangeLabel,
  status,
  category,
}) {
  const hasData = chart.series.length > 0;

  return (
    <div className="min-w-0 p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em]">
        <h2 className="truncate text-white/50">{category || "Activity"}</h2>
        <p className="shrink-0 tracking-[0.08em] text-white/50">{rangeLabel}</p>
      </div>

      <div className="relative mt-6 h-64 sm:h-72">
        <Line
          aria-hidden="true"
          data={chartData(chart, colors, category)}
          options={chartOptions(chart, category)}
          plugins={[crosshair]}
        />

        <ul aria-label={`Time per period, ${rangeLabel}`} className="sr-only">
          {chart.buckets.map((bucket, index) => (
            <li key={bucket.start}>
              {describeBucket(bucket, chart.series, index)}
            </li>
          ))}
        </ul>

        {status === "ready" && !hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 font-mono text-xs text-white/50">
            <p>&gt; no sessions in this range</p>
            <Link
              to="/"
              className="text-customGreen-100 transition-opacity hover:opacity-70"
            >
              start a timer
            </Link>
          </div>
        )}
        {status === "error" && (
          <p className="absolute inset-0 flex items-center justify-center font-mono text-xs text-red-400">
            Couldn&apos;t load your data.
          </p>
        )}
      </div>
    </div>
  );
}

ActivityChart.propTypes = {
  chart: PropTypes.shape({
    buckets: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.string.isRequired,
        seconds: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        tick: PropTypes.string.isRequired,
      })
    ).isRequired,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(PropTypes.number).isRequired,
      })
    ).isRequired,
    axisMax: PropTypes.number.isRequired,
  }).isRequired,
  colors: PropTypes.instanceOf(Map).isRequired,
  rangeLabel: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["loading", "ready", "error"]).isRequired,
  category: PropTypes.string,
};
