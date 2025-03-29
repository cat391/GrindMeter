import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import db from "../firebase-config";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Adapter for time scale

// Register Chart.js components including TimeScale for date handling
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const LineGraph = ({ userEmail, timeLine }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!userEmail) return;

    // Collect information about the week/month/year
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const currentYear = now.getFullYear();

    // Reference to the "timerUse" subcollection for a given user
    const timerUseRef = collection(db, "timerData", userEmail, "timerUse");

    let q;

    switch (timeLine) {
      case "Month":
        q = query(
          timerUseRef,
          where("date", ">=", `${currentMonthYear}-01`), // First day of month (e.g., "2024-01-01")
          where("date", "<=", `${currentMonthYear}-31`) // Last day of month (e.g., "2024-01-31")
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
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
        startOfWeek.setHours(0, 0, 0, 0); // Start of day (00:00:00)

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999); // End of day (23:59:59.999)
        q = query(
          timerUseRef,
          where("date", ">=", startOfWeek.toISOString().split("T")[0]),
          where("date", "<=", endOfWeek.toISOString().split("T")[0])
        );
        break;

      default:
        console.log(timeLine);
        q = query(timerUseRef);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Group data by category
      const categoryData = {};

      snapshot.forEach((doc) => {
        const docData = doc.data();
        const category =
          docData.category === "None" ? "No Category" : docData.category;
        // Convert the date string to a Date object
        const date = new Date(docData.date);
        const duration = Math.floor(docData.duration / 60);

        // Initialize the category array if needed
        if (!categoryData[category]) {
          categoryData[category] = [];
        }
        // Store the point in { x: date, y: duration } format
        if (duration > 1) {
          // Don't display if numbers are insignificant (less than a minute)
          categoryData[category].push({ x: date, y: duration });
        }
      });

      // Build datasets array, one per category
      const colors = [
        "#AAB2BD",
        "#50C878",
        "#98FF98",
        "#7FFF00",
        "#008080",
        "#C4C3D0",
        "#B2AC88",
        "#C5D86D",
        "#6E845C",
        "#7BA23F",
      ];
      let colorIndex = 0;
      const datasets = Object.keys(categoryData).map((category) => {
        // Sort data points for each category by date
        const sortedData = categoryData[category].sort((a, b) => a.x - b.x);
        const color = colors[colorIndex % colors.length];
        colorIndex++;

        return {
          label: category,
          data: sortedData,
          fill: false,
          borderColor: color,
          backgroundColor: color,
        };
      });

      // Set the chart data; note we don't need a separate "labels" array when using {x, y} objects
      setChartData({
        datasets: datasets,
      });
    });

    return () => unsubscribe();
  }, [userEmail, timeLine]);

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  }

  function getEndOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day); // Adjust for Sunday end
    return new Date(d.setDate(diff));
  }

  // Chart options with a time scale for the x-axis
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: timeLine === "Month" || timeLine === "Week" ? "day" : "week", // Adjust unit as needed (e.g., day, week, month)
          displayFormats: {
            day: "MMM d",
            week: "MMM d",
          },
        },

        title: {
          display: true,
          text: "Date",
          color: "#23a946",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#757575",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Duration (Minutes)",
          color: "#23a946",
        },
        grid: {
          color: "#757575",
          tickColor: "",
        },
        ticks: {
          color: "#757575",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
          borderColor: "#ffffff",
          tickColor: "#ffffff",
        },
      },
      title: {
        display: true,
        text: "Timer Use",
        color: "#23a946",
      },
    },
  };

  return (
    <div
      className="bg-customBlack-200 rounded-lg p-4"
      style={{ width: "100%", height: "55vh", minHeight: "400px" }}
    >
      {chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default LineGraph;
