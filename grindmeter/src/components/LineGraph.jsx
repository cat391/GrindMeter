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

const MonthLineGraph = ({ userEmail }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!userEmail) return;

    // Collect information about the month
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Reference to the "timerUse" subcollection for a given user
    const timerUseRef = collection(db, "timerData", userEmail, "timerUse");
    const q = query(
      timerUseRef,
      where("date", ">=", `${currentMonthYear}-01`), // First day of month (e.g., "2024-01-01")
      where("date", "<=", `${currentMonthYear}-31`) // Last day of month (e.g., "2024-01-31")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Group data by category
      const categoryData = {};

      snapshot.forEach((doc) => {
        const docData = doc.data();
        const category = docData.category; // e.g., "None", "Work", etc.
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
        "rgba(75, 192, 192, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
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
  }, [userEmail]);

  // Chart options with a time scale for the x-axis
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day", // Adjust unit as needed (e.g., day, week, month)
        },
        title: {
          display: true,
          text: "Date",
          color: "#ffffff",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Duration (Minutes)",
          color: "#ffffff",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
        },
      },
      title: {
        display: true,
        text: "Timer Use (Month)",
        color: "#ffffff",
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

const LineGraph = ({ userEmail, timeLine = "month" }) => {
  switch (timeLine) {
    case "month":
      return <MonthLineGraph userEmail={userEmail} />;
    default:
      return null;
  }
};

export default LineGraph;
