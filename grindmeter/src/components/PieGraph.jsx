import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import db from "../firebase-config";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components needed for pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

const PieGraph = ({ userEmail, timeLine }) => {
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
          where("date", ">=", startOfWeek.toISOString().split("T")[0]),
          where("date", "<=", endOfWeek.toISOString().split("T")[0])
        );
        break;
      default:
        q = query(timerUseRef);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoryTotals = {};

      snapshot.forEach((doc) => {
        const docData = doc.data();
        const category = docData.category || "Uncategorized";
        const duration = Math.floor(docData.duration / 60); // Convert to minutes

        if (duration > 0 && category != "None") {
          categoryTotals[category] = (categoryTotals[category] || 0) + duration;
        } else {
          categoryTotals["No Category"] =
            (categoryTotals["No Category"] || 0) + duration;
        }
      });

      // Prepare data for pie chart
      const categories = Object.keys(categoryTotals);
      const durations = Object.values(categoryTotals);

      const backgroundColors = [
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

      setChartData({
        labels: categories,
        datasets: [
          {
            data: durations,
            backgroundColor: backgroundColors.slice(0, categories.length),
            borderColor: "#2D2D2D",
            borderWidth: 1,
          },
        ],
      });
    });

    return () => unsubscribe();
  }, [userEmail, timeLine]);

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
            const percentage = Math.round((value / total) * 100);
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
        width: "100%",
        height: "55vh",
        minHeight: "400px",
        maxHeight: "550px",
        overflowX: "auto",
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
