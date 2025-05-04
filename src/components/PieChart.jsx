import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../global/store/userReducers";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = () => {
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
  const dispatch = useDispatch();

  const [chartData, setChartData] = useState(null); // State for dynamic chart data

  useEffect(() => {
    // Load user info from localStorage if not already in Redux state
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!userState.userInfo && storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      dispatch(
        userActions.setUserInfo({
          _id: parsedUserInfo._id,
          name: parsedUserInfo.name,
          stallname: parsedUserInfo.stallname,
          token: localStorage.getItem("token"),
        })
      );
    }
  }, [dispatch, userState.userInfo]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo?._id) return;

      try {
        // Fetch completed orders for the user's stall
        const response = await axios.get(
          `http://localhost:5000/api/orders/get-orders-completed-list?stallId=${userInfo._id}`
        );
        const orders = response.data.orders;

        // Process orders to calculate totals by category
        const categoryCounts = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const category = item.productId.category;
            if (categoryCounts[category]) {
              categoryCounts[category] += item.quantity;
            } else {
              categoryCounts[category] = item.quantity;
            }
          });
        });

        // Prepare chart data
        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        setChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: ["#FFC107", "#28A745", "#007BFF", "#DC3545", "#17A2B8"], // Add more colors as needed
              borderColor: "rgba(0,0,0,0)", // Remove border
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching completed orders:", error);
      }
    };

    fetchData();
  }, [userInfo]);

  const options = {
    responsive: true, // Make the chart responsive
    maintainAspectRatio: true, // Maintain aspect ratio
    plugins: {
      legend: {
        display: true,
        position: "top", // Position of legend
      },
      tooltip: {
        enabled: true, // Enable tooltips
      },
    },
  };

  return (
    <div>
      <h3>Food Trends by Category</h3>
      {/* Render the Pie chart only if chart data is available */}
      {chartData ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
};

export default PieChart;
