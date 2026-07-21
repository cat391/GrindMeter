import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import db from "../firebase-config";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { formatLocalDate } from "../utils/date";

// Register Chart.js components needed for pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

const PieGraph = ({
  userEmail,
  timeLine,
  startDate = null,
  endDate = null,
}) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!userEmail) return;

    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentYear = now.getFullYear();

    const timerUseRef = collection(db, "timerData", userEmail, "timerUse");

    let q;

    switch (timeLine) {
      case "Month":
        q = query(
          timerUseRef,
          where("date", ">=", `${currentMonthYear}-01`),
          where("date", "<=", `${currentMonthYear}-31`)
        );
        break;
      case "Year":
        q = query(
          timerUseRef,
          where("date", ">=", `${currentYear}-01-01`),
          where("date", "<=", `${currentYear}-12-31`)
        );
        break;
      case "Week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        q = query(
          timerUseRef,
          where("date", ">=", formatLocalDate(startOfWeek)),
          where("date", "<=", formatLocalDate(endOfWeek))
        );
        break;
      case "Custom":
        q = query(
          timerUseRef,
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );
        break;
      default:
        q = query(timerUseRef);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoryTotals = {};

      snapshot.forEach((doc) => {
        const docData = doc.data();
        const category =
          !docData.category || docData.category === "None"
            ? "No Category"
            : docData.category;
        const duration = docData.duration || 0; // Raw seconds

        categoryTotals[category] = (categoryTotals[category] || 0) + duration;
      });

      // Prepare data for pie chart, converting to minutes and dropping zero-value slices
      const categories = Object.keys(categoryTotals).filter(
        (category) => Math.floor(categoryTotals[category] / 60) > 0
      );
      const durations = categories.map((category) =>
        Math.floor(categoryTotals[category] / 60)
      );

      const categoryColorMap = {
        "No Category": "#AAB2BD",
      };

      const fallbackColors = [
        "#50C878",
        "#98FF98",
        "#7FFF00",
        "#008080",
        "#248005",
        "#B2AC88",
        "#C5D86D",
        "#6E845C",
        "#7BA23F",
      ];

      // Ensures that "No Category" gets the grey color
      const backgroundColors = categories.map((cat, i) => {
        return (
          categoryColorMap[cat] || fallbackColors[i % fallbackColors.length]
        );
      });

      setChartData({
        labels: categories,
        datasets: [
          {
            data: durations,
            backgroundColor: backgroundColors,
            borderColor: "#2D2D2D",
            borderWidth: 1,
          },
        ],
      });
    });

    return () => unsubscribe();
  }, [userEmail, timeLine, startDate, endDate]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} min (${percentage}%)`;
          },
        },
      },
      title: {
        display: true,
        text: `Time Distribution by Category`,
        color: "#23a946",
        font: {
          size: 15,
        },
      },
    },
  };

  return (
    <div
      className="bg-customBlack-200 rounded-lg p-4"
      style={{
        height: "55vh",
        minHeight: "400px",
        maxHeight: "550px",
        width: "40vw",
        minWidth: "300px",
        maxWidth: "500px",
      }}
    >
      {chartData ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default PieGraph;
