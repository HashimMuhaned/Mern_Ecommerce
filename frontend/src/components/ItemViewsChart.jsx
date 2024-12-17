import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ItemViewsChart = ({ itemId, filterDate }) => {
  const [viewHistory, setViewHistory] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKEND_API}/getItemViewsLast${filterDate}/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setViewHistory(response.data.views);
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };

    fetchViews();
  }, [itemId, filterDate]);

  // Dynamically adjust labels based on the filterDate
  const formatDateLabel = (date) => {
    const viewDate = new Date(date);
    if (filterDate === "Day") {
      return viewDate.toLocaleTimeString(); // For last day, show time
    } else if (filterDate === "Week") {
      return viewDate.toLocaleDateString(); // For weeks, show day
    } else if (filterDate === "Month") {
      return `${viewDate.getDate()} ${viewDate.toLocaleString("default", {
        month: "short",
      })}`; // For months, show day and month
    } else if (filterDate === "Year") {
      return `${viewDate.toLocaleString("default", {
        month: "short",
      })} ${viewDate.getFullYear()}`; // For year, show month and year
    }
  };

  // Dynamically adjust the time unit for the X-axis scale
  const getTimeUnit = () => {
    if (filterDate === "Day") return "minute";
    if (filterDate === "Week") return "day";
    if (filterDate === "Month") return "day";
    if (filterDate === "Year") return "month";
  };

  const chartData = {
    labels: viewHistory.map((view) => formatDateLabel(view.date)), // Adjusted labels based on filter
    datasets: [
      {
        label: `Item Views (Last ${filterDate})`,
        data: viewHistory.map((view) => view.count), // Y-axis: number of views
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1, // Smooth line
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Ensures chart fits its container
    scales: {
      x: {
        // type: "time",
        time: {
          unit: getTimeUnit(), // Dynamic time unit based on filter
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div
      id="totalSalesOfThisItem"
      style={{ position: "relative", height: "100%", width: "100%" }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ItemViewsChart;
